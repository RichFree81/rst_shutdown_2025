# RUNBOOK (outline)
- Local DB: backend/.data/app_data.db (dev only)
- Env vars: copy .env.example -> backend/.env and fill in values
- Migrations: use Alembic; scripts under backend/app/db/migrations
- Health: /healthz (live), /readyz (ready)
- Deploy: containerize backend and use Azure App Service + Azure PostgreSQL
