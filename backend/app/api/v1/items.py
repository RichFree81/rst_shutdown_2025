# backend/app/api/v1/items.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db            # ← central DB session dependency
from app.models.item import Item              # ← ORM model (SQLAlchemy)
from app.schemas.item import ItemCreate, ItemRead  # ← Pydantic schemas (I/O)

router = APIRouter(prefix="/items", tags=["items"])

@router.get("", response_model=List[ItemRead])
def list_items(db: Session = Depends(get_db)):
    return db.query(Item).all()

@router.get("/{item_id}", response_model=ItemRead)
def get_item(item_id: int, db: Session = Depends(get_db)):
    # If you're on SQLAlchemy 2.0, prefer db.get(Item, item_id)
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item

@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    # Pydantic v2 → use model_dump(); if you're on v1, use item.dict()
    db_item = Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
