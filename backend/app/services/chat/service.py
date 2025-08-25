from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import exists

from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage

from app.schemas.chat import (
    ChatConfig,
    NewChatField,
    ChatSessionOut,
    ChatMessageOut,
    ChatAssistantMessage,
)

# NOTE: This is a minimal stub service. Replace with real auth/user resolution.

DEFAULT_FIELDS: List[NewChatField] = [
    NewChatField(key="title", label="Title", type="text", required=False),
]

DEFAULT_POLICY: Dict[str, Any] = {
    "max_section_depth": 1,
    "style": "concise",
}

class ChatService:
    def get_config(self, domain_id: str) -> ChatConfig:
        # Per-domain overrides could be loaded from DB or config
        return ChatConfig(
            domain_id=domain_id,
            new_chat_fields=DEFAULT_FIELDS,
            policy=DEFAULT_POLICY,
            response_schema_version="v1",
        )

    def list_sessions(self, db: Session, user_id: Optional[int], domain_id: Optional[str]) -> List[ChatSessionOut]:
        q = db.query(ChatSession)
        if user_id is not None:
            q = q.filter(ChatSession.user_id == user_id)
        if domain_id:
            q = q.filter(ChatSession.domain_id == domain_id)
        # Exclude sessions with zero messages (avoid placeholder/dummy sessions)
        q = q.filter(exists().where(ChatMessage.session_id == ChatSession.id))
        rows = q.order_by(ChatSession.created_at.desc()).limit(50).all()
        out: List[ChatSessionOut] = []
        for r in rows:
            title = (r.title or "").strip()
            if not title or title.lower() in {"chat", "my first chat"}:
                # derive from first user message, else first assistant
                first_user = (
                    db.query(ChatMessage)
                    .filter(ChatMessage.session_id == r.id, ChatMessage.role == "user")
                    .order_by(ChatMessage.created_at.asc())
                    .first()
                )
                first_any = first_user or (
                    db.query(ChatMessage)
                    .filter(ChatMessage.session_id == r.id)
                    .order_by(ChatMessage.created_at.asc())
                    .first()
                )
                candidate = None
                if first_any is not None:
                    candidate = first_any.content_text or (
                        (first_any.content_json or {}).get("summary") if isinstance(first_any.content_json, dict) else None
                    )
                if candidate:
                    words = " ".join([w.strip("\t\n\r ,.;:!?") for w in str(candidate).split()[:5] if w])
                    title = words[:80].strip().capitalize() if words else ""
            out.append(
                ChatSessionOut(
                    id=r.id,
                    domain_id=r.domain_id,
                    title=title or None,
                    meta=r.meta_json or {},
                    tags=r.tags or [],
                )
            )
        return out

    def create_session(
        self,
        db: Session,
        user_id: Optional[int],
        domain_id: str,
        title: Optional[str],
        meta: Optional[Dict[str, Any]],
        tags: Optional[List[str]],
    ) -> ChatSessionOut:
        s = ChatSession(
            domain_id=domain_id,
            user_id=user_id,
            title=title,
            meta_json=meta or {},
            tags=tags or [],
        )
        db.add(s)
        db.commit()
        db.refresh(s)
        return ChatSessionOut(
            id=s.id,
            domain_id=s.domain_id,
            title=s.title,
            meta=s.meta_json or {},
            tags=s.tags or [],
        )

    def list_messages(self, db: Session, session_id: int) -> List[ChatMessageOut]:
        rows = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )
        return [
            ChatMessageOut(
                id=r.id,
                role=r.role,  # type: ignore
                content_json=r.content_json,
                content_text=r.content_text,
            )
            for r in rows
        ]

    def append_user_message(self, db: Session, session_id: int, content: str) -> ChatMessageOut:
        m = ChatMessage(session_id=session_id, role="user", content_text=content)
        db.add(m)
        db.commit()
        db.refresh(m)
        return ChatMessageOut(id=m.id, role="user", content_text=m.content_text)

    def append_assistant_message(self, db: Session, session_id: int, payload: ChatAssistantMessage) -> ChatMessageOut:
        m = ChatMessage(session_id=session_id, role="assistant", content_json=payload.dict())
        db.add(m)
        db.commit()
        db.refresh(m)
        return ChatMessageOut(id=m.id, role="assistant", content_json=m.content_json)
