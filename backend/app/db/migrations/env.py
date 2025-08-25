# backend/app/db/migrations/env.py
from logging.config import fileConfig
from pathlib import Path
import os

from alembic import context
from sqlalchemy import pool
from sqlalchemy import create_engine

# Make sure the app package is importable (backend on sys.path)
import sys
BACKEND_DIR = Path(__file__).resolve().parents[3]  # .../backend
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.models import Base  # Base.metadata includes all tables

# Alembic config object (reads alembic.ini)
config = context.config

# Logging if alembic.ini is present
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- Build a robust DB URL for Alembic, absolute for SQLite ---
db_url = settings.DATABASE_URL

def to_abs_sqlite_url(url: str) -> str:
    if not url.startswith("sqlite:///"):
        return url
    # Strip prefix and resolve relative path
    rel = url.replace("sqlite:///", "", 1)
    p = Path(rel)
    if not p.is_absolute():
        p = (Path.cwd() / p).resolve()
    # Ensure parent dir exists so SQLite can create the file
    p.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{p.as_posix()}"

db_url = to_abs_sqlite_url(db_url)

# Target metadata (models) for autogenerate
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    # For SQLite, provide connect_args; for others it’s harmless to omit
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    engine = create_engine(db_url, poolclass=pool.NullPool, connect_args=connect_args)

    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
