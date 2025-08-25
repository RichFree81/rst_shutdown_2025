# Backend

This README documents the FastAPI backend located in `backend/`.

## Overview
- Framework: FastAPI + SQLAlchemy + Alembic
- Config: Pydantic Settings loaded from `backend/.env`
- Database (local): SQLite at `backend/.data/app_runtime.dev.sqlite` (gitignored)
- Migrations: Alembic scripts in `backend/app/db/migrations/`

## Directory structure (key paths)
- `app/` — application code
  - `core/` — settings, security, utilities
  - `api/` — FastAPI routers and endpoints
  - `db/` — database session, alembic env, migrations
  - `Domains/` — domain-specific models and logic (e.g., users)
- `.data/` — runtime DB files for local dev and tests (gitignored)
- `.env` — local environment variables (gitignored)

## Environment configuration
Copy the sample file and fill in values:
```
cp backend/.env.sample backend/.env  # Windows: copy backend\.env.sample backend\.env
```
Key variables (see `backend/.env.sample`):
```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=ChangeMeDev123!
JWT_SECRET=replace-with-a-strong-random-secret
CORS_ALLOW_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
# Optional managed DB (e.g., Azure):
# DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME
```
Notes:
- `.env` is loaded via an absolute path, so it works regardless of working directory.
- If `DATABASE_URL` is unset locally, the app defaults to SQLite in `backend/.data/`.

## Running the API (repo root)
```
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir backend
```

## Database & migrations
- Run migrations (repo root):
```
.\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini upgrade head
```
- Local DB file will be at `backend/.data/app_runtime.dev.sqlite`.

## First admin bootstrap
On startup, if no users exist and `ADMIN_EMAIL`/`ADMIN_PASSWORD` are set, the app creates the first admin (`bootstrap_first_admin()` in `app/main.py`).

## QA script
From repo root:
```
powershell -ExecutionPolicy Bypass -File "scripts/backend_qa.ps1"
```
This validates env, runs migrations, and checks `/api/v1/auth/login` and `/api/v1/auth/me`.

## Azure-ready notes
- Use a managed DB in production; set `DATABASE_URL` in Azure App Settings.
- Install the appropriate DB driver in deployment (e.g., `psycopg[binary]` for Postgres, `pyodbc` for Azure SQL).
- Run migrations in your pipeline:
```
python -m alembic -c backend/alembic.ini upgrade head
```
- Keep secrets in App Settings (not in repo).

## Housekeeping
- Runtime database files under `backend/.data/` are gitignored. Do not commit actual DB files.
- The `.vscode/` folder in the repo root pins the interpreter to the repo-root `.venv/` and provides a ready-to-run Uvicorn debug config.

## Guidelines: Adding a new domain
Use this checklist to add a domain (e.g., `inventory`, `billing`) in a consistent, migration-friendly way.

- **Create domain structure** under `backend/app/Domains/<domain>/`:
  - `models.py` — SQLAlchemy models
  - `schemas.py` — Pydantic request/response models
  - `service.py` (or `crud.py`) — DB operations/business logic
  - `router.py` — FastAPI `APIRouter` with `prefix="/api/v1/<domain>"`

- **Register models for Alembic** by importing them in `backend/app/models/__init__.py` so they are attached to `Base.metadata`.
  - Example (inside `app/models/__init__.py`):
  ```python
  # ensure domain models are imported so Alembic sees them
  from app.Domains.<domain>.models import *  # noqa
  ```

- **Wire the API router** in the main application:
  - Import and include the router in `app/main.py` (or a central `app/api/__init__.py` if present):
  ```python
  from app.Domains.<domain>.router import router as <domain>_router
  app.include_router(<domain>_router)
  ```

- **DB access pattern**:
  - Inject sessions using `get_db()` from `app.db.database` in your router/service functions.
  - Keep SQLAlchemy-specific code in `service.py`; keep routers thin.

- **Create migration** after adding/altering models:
  ```powershell
  .\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini revision --autogenerate -m "add <domain>"
  .\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini upgrade head
  ```
  - Review the generated migration for correctness before upgrading.

- **QA**:
  - Extend `scripts/backend_qa.ps1` or add curl/Invoke-RestMethod smoke tests for new endpoints.
  - Run the standard QA script:
  ```powershell
  powershell -ExecutionPolicy Bypass -File "scripts/backend_qa.ps1"
  ```

- **Conventions**:
  - Keep request/response DTOs in `schemas.py` (avoid leaking ORM models to API).
  - Use `prefix="/api/v1/<domain>"` and `tags=["<Domain>"]` on the router.
  - Add unit tests under a mirrored path in `backend/app/tests/` (if/when tests are added).

### Domain skeleton example
Minimal structure for a domain named `inventory`:
```
backend/
  app/
    Domains/
      inventory/
        __init__.py
        models.py
        schemas.py
        service.py
        router.py
```
Example snippets:

`app/Domains/inventory/models.py`
```python
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from app.models import Base

class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
```

`app/Domains/inventory/schemas.py`
```python
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str

class ProductRead(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True
```

`app/Domains/inventory/service.py`
```python
from sqlalchemy.orm import Session
from app.Domains.inventory import models, schemas

def create_product(db: Session, data: schemas.ProductCreate) -> models.Product:
    obj = models.Product(name=data.name)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
```

`app/Domains/inventory/router.py`
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.Domains.inventory import schemas, service

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

@router.post("/products", response_model=schemas.ProductRead)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    return service.create_product(db, payload)
```
Remember to:
- Import the models in `app/models/__init__.py` so Alembic detects them.
- Include the router in `app/main.py` via `app.include_router(...)`.
- Generate and apply a migration.

### Optional: quick scaffold steps
1. Create the folder and files under `app/Domains/<domain>/` as above.
2. Register models in `app/models/__init__.py`.
3. Wire the router in `app/main.py`.
4. Create migration and upgrade:
   ```powershell
   .\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini revision --autogenerate -m "add <domain>"
   .\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini upgrade head
   ```
5. Add QA smoke tests for new endpoints.
