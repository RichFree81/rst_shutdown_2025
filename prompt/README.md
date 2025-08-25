# prompt/

This folder stores development prompts, templates, and notes used during engineering.

- Committed to Git for collaboration and history.
- Excluded from production Docker images via `.dockerignore` (keeps deploys lean).

## Suggested structure
- `templates/` — reusable prompt templates (e.g., bug triage, feature spec, review checklists)
- `sessions/` — working prompts/notes for current tasks
- `archive/` — older prompts you want to keep for reference

## Conventions
- Prefer Markdown files (`.md`) with clear titles and dates.
- Do not store secrets; use placeholders where necessary.
- Keep prompts concise and link back to issues/specs under `specs/` where helpful.
