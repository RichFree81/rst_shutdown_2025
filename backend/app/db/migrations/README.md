# Database Schema Migrations (Alembic)

This folder contains schema change scripts (migrations), not database files.

- Tool: Alembic
- Scripts live under `versions/`
- Apply to the active database via:
  - `alembic -c alembic.ini upgrade head` (from `backend/`)
- Works with any `DATABASE_URL`:
  - Local dev: SQLite file (e.g., `sqlite:///./.data/app_runtime.dev.sqlite`)
  - Cloud: PostgreSQL (e.g., `postgresql+psycopg://...`)

Do not place actual database files here. Runtime database files belong under `backend/.data/` (gitignored).
