from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.chat import (
    ChatConfig,
    CreateSessionRequest,
    ChatSessionOut,
    ChatMessageOut,
    PostMessageRequest,
)
from app.services.chat.service import ChatService
from app.core.security import get_current_user
from app.Domains.users.models import User
from app.models.chat_session import ChatSession

router = APIRouter(tags=["chat"])
service = ChatService()

@router.get("/chat/config/{domain_id}", response_model=ChatConfig)
def get_chat_config(domain_id: str):
    return service.get_config(domain_id)

@router.get("/chat/sessions", response_model=list[ChatSessionOut])
def list_sessions(
    domain_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_sessions(db, current_user.id, domain_id)

@router.post("/chat/sessions", response_model=ChatSessionOut)
def create_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.domain_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="domain_id is required")
    return service.create_session(
        db=db,
        user_id=current_user.id,
        domain_id=payload.domain_id,
        title=payload.title,
        meta=payload.meta,
        tags=payload.tags,
    )

@router.get("/chat/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
def list_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s: ChatSession | None = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not s or s.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return service.list_messages(db, session_id)

@router.post("/chat/sessions/{session_id}/messages", response_model=ChatMessageOut)
def post_message(
    session_id: int,
    payload: PostMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s: ChatSession | None = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not s or s.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    # Append user message
    user_msg = service.append_user_message(db, session_id, payload.content)
    return user_msg

@router.delete("/chat/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service.delete_session(db, current_user.id, session_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return Response(status_code=204)
