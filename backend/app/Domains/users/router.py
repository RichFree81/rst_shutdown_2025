from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from .schemas import (
    LoginRequest,
    Token,
    InviteRequest,
    AcceptInviteRequest,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    UserRead,
)
from app.Domains.users.models import User

router = APIRouter(prefix="/api/v1", tags=["auth", "users"])

@router.post("/auth/login", response_model=Token)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user: User | None = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(sub=user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/auth/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/users/invite")
async def invite_user(payload: InviteRequest, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Not Implemented (scaffold)")

@router.post("/auth/accept-invite")
async def accept_invite(payload: AcceptInviteRequest, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Not Implemented (scaffold)")

@router.post("/auth/password-reset")
async def request_password_reset(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Not Implemented (scaffold)")

@router.post("/auth/password-reset/confirm")
async def confirm_password_reset(payload: PasswordResetConfirmRequest, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Not Implemented (scaffold)")