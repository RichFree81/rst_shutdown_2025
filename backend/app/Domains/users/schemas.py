# backend/app/Domains/users/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: Optional[str] = None  # may be None for invited users until accepted

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class InviteRequest(BaseModel):
    email: EmailStr

class AcceptInviteRequest(BaseModel):
    token: str
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirmRequest(BaseModel):
    token: str
    password: str
