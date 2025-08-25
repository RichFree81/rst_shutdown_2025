# Baseline Scaffolding Reference (Aligned to Current Repo)

This document mirrors **your current folder structure** and shows **where app‑specific (domain) code belongs**. Keep it in the repo for future modules.

---

## 10) Front-end application shell (what lives under `frontend/src/app/`)

- **`AppShell.tsx`** – global layout shell (header/nav/footer, containers, spacing). No domain-specific logic.
  
**`AppRouter.tsx`** – central routing (React Router). Mounts lazy-loaded domain routes under the shell.
- **`providers/`** – app-wide providers only (theme, auth, query/cache). Avoid domain logic here.

Guidelines
- The shell owns layout, theme, global state boundaries. Domains plug in via routes.
- Keep shell clean; do not import domain components directly. Use lazy route elements.
- Shell enforces a flat theme: no shadows in header, ribbon, explorer, context tabs. Use borders and spacing for hierarchy.
- Context area scrollbars are show-on-scroll only (no hover reveal), fading ~400ms after scroll ends.

---

## 11) Front-end domain modules (`frontend/src/domains/`)

Each domain gets its own folder under `frontend/src/domains/`. Example structure (illustrative):

```
frontend/src/domains/<domain_name>/
  pages/
    <FeaturePage>.tsx         # route-mounted pages (lazy loaded)
  components/
    <ReusablePart>.tsx        # domain-local UI building blocks
  api/
    <domain>.client.ts        # fetch/axios wrappers for this domain only
  hooks/
    use<Feature>.ts           # domain React hooks
  types/
    <domain>.ts               # domain TypeScript types/interfaces
  routes.ts                   # exports route definitions for AppRouter
  index.ts                    # optional barrel exports (no side effects)
```

Rules
- Use typography role classes (`.h1`, `.h2`, `.h3`, `.body-copy`, `.caption`) for text styling; avoid ad-hoc font utilities.
- Use Tailwind utilities bound to semantic tokens (see `src/index.css` @theme mappings). Do not redefine theme variables inside domains.
- Prefer flat surfaces; avoid shadows. When a distinct panel is needed, use `bg-white` + `border-border-subtle`.
- Keep domain API code isolated in `api/` and do not call other domains directly from UI; share via backend APIs or clearly defined client functions.
- Lazy-load pages via React Router (`lazy(() => import(...))`) to code-split by domain.
- Keep file names in `camelCase`/`PascalCase` for components and `kebab-case` or `camelCase` for others—be consistent within the domain.
- Do not import from another domain’s internals; share cross-domain components via a `frontend/src/shared/` area if needed (create later as necessary).

---

## 12) Checklist to add a new front-end domain

1. Create `frontend/src/domains/<name>/` with:
   - `pages/`, `components/`, `api/`, `hooks/`, `types/`, `routes.ts` (and optionally `index.ts`).
2. Build page(s) using typography role classes and token-based Tailwind utilities.
3. Implement domain client in `api/` (use fetch/axios). Handle errors and loading states in hooks.
4. Export routes from `<domain>/routes.ts`.
5. In `AppRouter.tsx`, import and register the domain routes, using `lazy()` for page components.
6. Keep tests near code or in a parallel `__tests__/` folder (choose one convention and stick to it).

---

## 13) Front-end conventions & performance

- **Typography** – always prefer role classes (`.h1`, `.h2`, `.h3`, `.body-copy`, `.caption`).
- **Colors** – use token-backed utilities (e.g., `text-text-primary`, `bg-bg-canvas`, `border-border-subtle`, `bg-brand-bluegrey-50`, `text-brand-navy-700`). Avoid hard-coded hex values.
- **Fonts** – self-hosted via `@fontsource` latin subsets, preloaded at runtime in `src/main.tsx`. Do not use external font CDNs.
- **Accessibility** – focus styles use `--brand-sky`. Preserve visible focus; do not disable outlines.
- **Code-splitting** – lazy-load domain pages to keep initial bundle small.
- **Barrels** – `index.ts` files must only re-export (no side effects).

---

## 14) Current front-end state snapshot

- `frontend/src/domains/` exists and is tracked by `.gitkeep` (empty by design until first domain).
- Theme tokens live in `frontend/src/theme/tokens.css` and are exposed to Tailwind v4 utilities via `@theme` in `frontend/src/index.css`.
- Header is dark navy with a copper bottom border; left ribbon is flat darker grey; tabs are underline-only.
- Fonts are self-hosted via `@fontsource` (latin-only) and preloaded at runtime.


## 1) Repository layout (as‑is)

```
/                          # repo root
├─ backend/
│  ├─ .data/               # local runtime data (e.g., SQLite files)
│  └─ app/
│     ├─ api/
│     │  └─ v1/
│     ├─ core/             # config, db session, auth, logging (infra only)
│     ├─ db/
│     │  └─ migrations/
│     │     └─ versions/
│     ├─ Domains/          # ⬅️ place for app-specific domains (bounded contexts)
│     ├─ models/           # global models shared across domains (User/Role/Tenant/etc.)
│     ├─ schemas/          # global DTOs only (try to keep minimal)
│     └─ services/         # global services/helpers (keep minimal)
├─ frontend/
│  ├─ public/
│  └─ src/
└─ specs/                  # specifications, docs, PRDs
```

> **Note:** Your package names currently use `Domains` (capital **D**). Python package names are typically lowercase. You can keep `Domains/` for now; if you later want to normalize to `domains/`, see the optional note in §8.

---

## 2) Responsibilities & boundaries (back end)

- **`backend/app/core/`** – platform shell: configuration (Pydantic Settings), DB engine/session, auth/JWT, logging. **No business logic** here.
- **`backend/app/db/migrations/`** – Alembic migrations (autogenerated scripts live in `versions/`).
- **`backend/app/api/`** – FastAPI wiring and shared dependencies (e.g., `deps.py`), versioned routers under `v1/` if you prefer.
- **`backend/app/models/`** – truly global SQLAlchemy models (e.g., `User`, `Role`, `Tenant`, `AuditLog`). Keep this small.
- **`backend/app/schemas/`** – truly global Pydantic DTOs (e.g., `UserRead`). Prefer **domain-local** schemas instead (see §3).
- **`backend/app/services/`** – truly global services (e.g., email sender, file storage). Avoid putting domain rules here.
- **`backend/app/Domains/`** – **where feature code lives**. Each domain owns its models, schemas, repositories, services, router, and tests.

---

## 3) Where app‑specific (domain) files should reside

Create **one folder per feature/domain** under `backend/app/Domains/`:

```
backend/app/Domains/<domain_name>/
  __init__.py
  models.py        # SQLAlchemy tables for this domain only
  schemas.py       # Pydantic DTOs for this domain (Create/Update/Read)
  repository.py    # DB access for this domain (CRUD, queries)
  service.py       # Business rules and orchestration for this domain
  permissions.py   # Domain-specific RBAC (e.g., "<domain>.view", "<domain>.edit")
  router.py        # FastAPI endpoints for this domain (mounted under a prefix)
  __tests__/       # Unit + API tests for this domain
```

**Guidelines**  
- Put **all feature-specific code** inside its domain folder.  
- Keep `backend/app/models/`, `schemas/`, `services/` for **global, cross-cutting** items only.  
- Domains may import from `core/` and their **own** package. Avoid cross-domain imports; if needed, expose a thin service interface.

---

## 4) Router registration

Current wiring (as implemented):
```python
# backend/app/main.py (excerpt)
from fastapi import FastAPI
from app.core.config import settings
from app.health import router as health_router
from app.api.v1.items import router as items_router

app = FastAPI(title="my_cloud_api")

# CORS is configured from settings; adjust origins as needed
# ... middleware omitted for brevity ...

# Health endpoints
app.include_router(health_router)

# Versioned API
app.include_router(items_router, prefix="/api/v1")
```

Manual (explicit and simple):
```python
# backend/app/main.py
from fastapi import FastAPI
from app.Domains.cost_control.router import router as cost_router  # adjust name

def create_app() -> FastAPI:
    app = FastAPI(title="My Cloud API")
    app.include_router(cost_router)  # mounts /cost-control/...
    return app

app = create_app()
```

Auto-discovery (works when you add many domains):
```python
# backend/app/main.py
import pkgutil, importlib, app.Domains
from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI(title="My Cloud API")
    for _, modname, _ in pkgutil.walk_packages(app.Domains.__path__, app.Domains.__name__ + "."):
        if modname.endswith(".router"):
            mod = importlib.import_module(modname)
            app.include_router(mod.router)
    return app

app = create_app()
```

> Ensure `backend/app/Domains/__init__.py` **exists** so Python treats it as a package.

---

## 5) Alembic configuration (models discovery)

Current configuration (as implemented):
```python
# backend/app/db/migrations/env.py (excerpt)
from app.models import Base  # Base.metadata includes all tables
target_metadata = Base.metadata
```

This relies on `app/models/__init__.py` importing every model so it registers on `Base.metadata`:
```python
# backend/app/models/__init__.py (excerpt)
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from .item import Item  # import each model so Alembic sees its table
```

Alternative: domain auto-discovery (when you add many domains):
```python
# backend/app/db/migrations/env.py (alternative excerpt)
import pkgutil, importlib, app.Domains
from app.models import Base

for _, modname, _ in pkgutil.walk_packages(app.Domains.__path__, app.Domains.__name__ + "."):
    if modname.endswith(".models"):
        importlib.import_module(modname)

target_metadata = Base.metadata
```

Then from `backend/`, run:
```
alembic -c alembic.ini revision --autogenerate -m "your message"
alembic -c alembic.ini upgrade head
```

> If you invoke Alembic from the repo root, ensure `PYTHONPATH=backend` so `import app` works.

---

## 6) Environments & local data

- Keep environment files in the repo root or under `backend/` (e.g., `.env.development`, `.env.test`, `.env.production`). Load them in `app/core/config.py` via `pydantic_settings`.
- Use `backend/.data/` for local DB files (e.g., SQLite) or other runtime artifacts that **should not** be committed.

---

## 7) Front-end & specs

- **`frontend/`** – Vite + React + TypeScript + Tailwind CSS v4 app (UI). The backend exposes REST/GraphQL for it.
- **Theme** – implemented via CSS variables and Tailwind utilities:
  - `frontend/src/theme/tokens.css` defines `--fce-*` semantic tokens (colors) and aliases to brand variables.
  - `frontend/src/theme/typography.css` defines typography role classes: `.h1`, `.h2`, `.h3`, `.body-copy`, `.caption`.
  - Tailwind config maps utilities to the CSS variables. Use role classes instead of ad-hoc font utilities for consistency.
- **Fonts** – self-hosted via `@fontsource` (latin subset only) and preloaded at runtime for performance:
  - Imports in `frontend/src/main.tsx` (e.g., `@fontsource/montserrat/latin-400.css`, `.../latin-600.css`, `.../latin-700.css`, `@fontsource/taviraj/latin-400.css`).
  - Runtime preloads by importing WOFF2 assets and injecting `<link rel="preload" as="font">` before React renders.
- **Shell** – `frontend/src/app/` contains `AppShell.tsx` (layout) and `AppRouter.tsx` (routing), with providers in `app/providers/`.
- **Domains root** – `frontend/src/domains/` exists (tracked via `.gitkeep`) for domain UI modules.
- **`specs/`** – architecture notes, API contracts, PRDs, AI prompt specs, etc. Keep this doc in sync with the codebase.

---

## 8) Optional: normalize `Domains/` → `domains/` later

Lowercase package names avoid case-sensitivity issues across OSes (Windows vs Linux CI/CD). If/when you normalize:

```
git mv backend/app/Domains backend/app/domains
# Update imports: app.Domains → app.domains
```

No rush—this is optional; the current `Domains/` will work.

---

## 9) Quick checklist to add a new domain

1. `backend/app/Domains/<name>/` with the files shown in §3 (ensure `__init__.py` exists).
2. Define tables in `models.py`; run Alembic autogeneration + upgrade.
3. Implement `schemas.py`, `repository.py`, `service.py`, `permissions.py`.
4. Add `router.py` and mount it (manual or auto-discovery).
5. Write tests in `__tests__/`.
6. (Optional) If the domain needs AI, add prompts/tools/agents under an `app/ai/` area and call domain services via stable interfaces.

---

### TL;DR
- **All feature code lives under `backend/app/Domains/<feature>/`.**
- Keep `core/`, `models/`, `schemas/`, `services/` for **global** concerns.
- Alembic must import each domain’s `models.py` for migrations to see new tables.
- Routers are either manually included or auto-discovered.
