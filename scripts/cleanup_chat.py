import argparse
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage


def cleanup(db: Session, apply: bool = False) -> None:
    # Find empty sessions
    empty_q = (
        db.query(ChatSession)
        .filter(~db.query(ChatMessage.id).filter(ChatMessage.session_id == ChatSession.id).exists())
    )
    empties = empty_q.all()

    # Find placeholder title sessions
    placeholder_q = (
        db.query(ChatSession)
        .filter(ChatSession.title.isnot(None))
        .filter(ChatSession.title != "")
    )
    placeholders = [
        s for s in placeholder_q.all() if s.title and s.title.strip().lower() in {"chat", "my first chat"}
    ]

    print(f"[cleanup] Empty sessions: {len(empties)}")
    print(f"[cleanup] Placeholder-titled sessions: {len(placeholders)}")

    if not apply:
        print("[cleanup] Dry run complete. Re-run with --apply to make changes.")
        return

    # Delete empties
    for s in empties:
        db.delete(s)

    # Null-out placeholder titles
    for s in placeholders:
        s.title = None

    db.commit()
    print("[cleanup] Applied changes.")


def purge(db: Session, apply: bool = False, domain: str | None = None) -> None:
    if domain:
        print(f"[purge] Target domain: {domain}")
        session_ids = [
            s.id for s in db.query(ChatSession.id).filter(ChatSession.domain_id == domain).all()
        ]
    else:
        print("[purge] Target: ALL domains")
        session_ids = [s.id for s in db.query(ChatSession.id).all()]

    print(f"[purge] Sessions to delete: {len(session_ids)}")
    if not apply:
        print("[purge] Dry run complete. Re-run with --apply to make changes.")
        return

    if session_ids:
        # Delete messages first due to FK constraint
        db.query(ChatMessage).filter(ChatMessage.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(ChatSession).filter(ChatSession.id.in_(session_ids)).delete(synchronize_session=False)
        db.commit()
    print("[purge] Applied changes.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean or purge chat data.")
    parser.add_argument("--apply", action="store_true", help="Actually apply changes. Without this flag, runs as dry-run.")
    sub = parser.add_subparsers(dest="cmd")

    p_clean = sub.add_parser("clean", help="Remove empty sessions and normalize placeholder titles.")

    p_purge = sub.add_parser("purge", help="Delete sessions and messages. Optionally restrict to a domain.")
    p_purge.add_argument("--domain", help="Domain ID to purge (omit to purge all domains).", default=None)
    args = parser.parse_args()

    db: Session = SessionLocal()
    try:
        if args.cmd == "purge":
            purge(db, apply=args.apply, domain=getattr(args, "domain", None))
        else:
            cleanup(db, apply=args.apply)
    finally:
        db.close()


if __name__ == "__main__":
    main()
