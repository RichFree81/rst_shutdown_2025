# my_cloud_api

- Backend: backend/app (FastAPI)
- Frontend: frontend (Vite/React)
See RUNBOOK.md for operations and deployment notes.

## Frontend
- See `frontend/README.md` for development, structure, and domain guidelines.
- Flat theme overview:
  - Header: navy with subtle copper bottom border
  - Left ribbon: flat neutral-200 (no blur)
  - Context tabs: underline-only active state, no shadows
  - Content: flat canvas; domains add surfaces as needed
  - Scrollbars: show-on-scroll only in context area
- Tokens live in `frontend/src/theme/tokens.css` and are mapped to Tailwind v4 utilities via `@theme` in `frontend/src/index.css`.

## Specs
- Theme: `specs/theme_spec.md`
- Scaffolding: `specs/scaffolding_spec.md`
- Publishing: `specs/publishing_spec.md`