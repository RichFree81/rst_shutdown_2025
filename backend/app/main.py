from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.health import router as health_router
from app.api.v1.items import router as items_router  # your example router
from app.api.v1.chat import router as chat_router
from app.Domains.users.router import router as users_router

app = FastAPI(title="my_cloud_api")

# CORS: allow front-end to call the API in browser (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS or ["http://localhost:5173"],  # dev default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoints
app.include_router(health_router)

# Versioned API
app.include_router(items_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(users_router)

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.security import hash_password
from app.Domains.users.models import User
from app.core.config import settings

@app.on_event("startup")
def bootstrap_first_admin():
    db: Session = SessionLocal()
    try:
        count = db.query(User).count()
        if count == 0 and settings.ADMIN_EMAIL:
            if settings.ADMIN_PASSWORD:
                u = User(
                    email=settings.ADMIN_EMAIL,
                    password_hash=hash_password(settings.ADMIN_PASSWORD),
                    is_active=True,
                    is_admin=True,
                )
                db.add(u)
                db.commit()
                print(f"[bootstrap] Created first admin user: {settings.ADMIN_EMAIL}")
            else:
                print("[bootstrap] ADMIN_EMAIL set without ADMIN_PASSWORD. Invite flow will handle first admin.")
    finally:
        db.close()
