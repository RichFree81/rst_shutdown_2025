# Publishing Spec (Deployment and Operations)

This document defines the actions, requirements, and checklists to publish this application to a managed environment (e.g., Azure). It must be kept up to date and followed for any new environment (dev/staging/prod).


## Scope
- Backend API: `backend/` (FastAPI + Uvicorn)
- Database: SQL (PostgreSQL recommended)
- Frontend: `frontend/` (Vite/React, static assets)
- CI/CD: GitHub Actions
- Secrets: Azure Key Vault (recommended)


## Environments
- dev: non-critical, feature validation
- staging: production-like, pre-release verification
- prod: customer-facing

For each environment, define:
- Subscription / Resource Group
- Region
- Naming conventions (rg, app, db, kv, st, plan)
- DNS zone and hostnames


## Azure Reference Architecture (recommended)
- Compute
  - Backend: Azure App Service (Linux) or Azure Container Apps
  - Frontend: Azure Static Web Apps or Azure Storage Static Website + Azure CDN
- Data
  - Azure Database for PostgreSQL Flexible Server
- Networking
  - Custom domain + TLS via Azure Front Door or App Service Managed Certs
- Secrets & Config
  - Azure Key Vault for JWT secret, admin bootstrap password, SMTP, etc.
  - App Service App Settings for non-secret config (e.g., CORS list)
- Observability
  - Application Insights + Log Analytics Workspace
- CI/CD
  - GitHub Actions with OIDC to Azure (no long-lived secrets)


## Application Configuration

### Backend required settings (env)
- APP_ENV: dev|staging|prod
- DATABASE_URL: postgres connection string (Key Vault secret)
- JWT_SECRET: secret used to sign tokens (Key Vault secret; rotateable)
- JWT_ALGORITHM: HS256 (default)
- JWT_EXPIRES_MIN: e.g., 60
- ADMIN_EMAIL: initial admin bootstrap (App Setting)
- ADMIN_PASSWORD: initial admin bootstrap (Key Vault secret)
- CORS_ALLOW_ORIGINS: JSON array (e.g., ["https://app.example.com"]) (App Setting)
- Optional SMTP settings when enabling email flows

Note: Admin bootstrap runs only when no users exist. Changing ADMIN_* later does not retroactively change existing admin.

### Frontend required settings (build/runtime)
- VITE_API_BASE_URL: e.g., https://api.example.com


## Pre-publish Checklist (per environment)
- [ ] Resource group created
- [ ] Postgres server + database created (SSL enforced)
- [ ] App Service (Linux) or Container App created for backend
- [ ] Storage/Static Web App created for frontend
- [ ] Key Vault created and access policies/role assignments configured
- [ ] DNS zone entries reserved (api.example.com, app.example.com)
- [ ] Application Insights configured for backend
- [ ] GitHub OIDC to Azure set up (federated credentials)
- [ ] CI/CD workflows created and scoped to branches


## Secrets & Settings (provision)
Store the following in Key Vault and reference them in the compute platform:
- kv: JWT_SECRET, ADMIN_PASSWORD, DATABASE_URL, SMTP_* (if used)

Create App Settings on App Service/Container App:
- APP_ENV, ADMIN_EMAIL, CORS_ALLOW_ORIGINS, JWT_ALGORITHM, JWT_EXPIRES_MIN
- Bind Key Vault secrets via Key Vault references or injected as envs in the container definition


## Build and Release Process

### CI (GitHub Actions)
- Backend CI (already present: `.github/workflows/backend-ci.yml`)
  - Install deps
  - Lint/format checks
  - Apply Alembic migrations to ephemeral DB or migration check
- Frontend CI (to add)
  - Install deps
  - Type-check + lint
  - Build

### CD (Add new workflows)
- On `main` push or tag:
  - Build backend artifact (Docker image or zip deploy)
  - Run Alembic migrations against target DB
  - Deploy backend to App Service/Container Apps
  - Deploy frontend to Static Web App/Storage + CDN purge


## Database Migrations
- Tool: Alembic
- Command: `alembic upgrade head`
- Migration policy:
  - Migrations must run before new code is routed live
  - Backward-compatible changes preferred (rolling deploys)
  - Rollback plan required for breaking changes (down revisions tested)


## Smoke Tests (post-deploy)
Run the automated QA scripts against the target URLs:
- Backend QA: `scripts/backend_qa.ps1` with `-EnvFile` pointing to a safe temp file containing only ADMIN_EMAIL/ADMIN_PASSWORD/JWT_SECRET (or use Key Vault in pipeline)
  - POST `/api/v1/auth/login`
  - GET `/api/v1/auth/me`
- Frontend QA: `scripts/frontend_qa.ps1` with `VITE_API_BASE_URL` set to deployed API

Publish gates should fail if smoke tests fail.


## CORS and Domains
- Set `CORS_ALLOW_ORIGINS` to the final frontend origin(s)
- If using multiple environments, configure distinct origins per env


## Security Controls
- Enforce HTTPS only
- Managed identity for App Service/Container App to access Key Vault
- Key rotation procedures for `JWT_SECRET`
- Principle of least privilege on Azure RBAC
- No secrets in repo or CI logs
- Regular dependency updates and vulnerability scanning


## Monitoring & Alerts
- Application Insights metrics + distributed tracing
- Alerts for:
  - 5xx error rate spike
  - High latency
  - App restart/health probe failures
  - Database connectivity issues


## Backup & Recovery
- Automated backups for PostgreSQL
- Export infra-as-code templates (Bicep/Terraform) for rebuilds
- Document restore runbook


## Rollback Strategy
- Keep previous backend image/slot
- Blue/Green or deployment slots for App Service
- Rollback DB with tested down migrations when feasible


## Operational Runbooks
- Rotate JWT secret (in Key Vault) and restart app; users must re-login
- Reset admin password (via admin endpoint/tool once implemented)
- Apply emergency hotfix (new tag → CD)


## Ownership & Maintenance
- This document: `specs/publishing_spec.md`
- Update on any change to:
  - Environment variables, secrets, CI/CD, hosting platform, or smoke test endpoints
- Code owners: Platform/DevOps + Backend lead


## Appendices
- A: Example Azure Resources (names are examples)
  - rg: `rg-myapp-prod-eu`
  - app service plan: `asp-myapp-prod`
  - web app (api): `app-myapp-api-prod`
  - static site: `stmyappprod` (static website enabled)
  - key vault: `kv-myapp-prod`
  - postgres: `pg-myapp-prod`
  - app insights: `appi-myapp-prod`
- B: Example CORS
  - prod: `["https://app.example.com"]`
  - staging: `["https://staging.example.com"]`
