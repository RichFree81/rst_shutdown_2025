from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db

router = APIRouter(tags=["health"])

@router.get("/healthz")
def healthz():
    # Process is up
    return {"status": "ok"}

@router.get("/readyz")
def readyz(db: Session = Depends(get_db)):
    # DB reachable and answering basic query
    db.execute(text("SELECT 1"))
    return {"status": "ready"}
