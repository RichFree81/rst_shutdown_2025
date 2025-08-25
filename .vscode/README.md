# .vscode workspace config

This folder contains editor settings for Windsurf/VS Code to ensure a consistent local dev setup. It does not affect runtime or production.

## What’s configured
- Interpreter pinned to repo-root venv: `.venv/`
- Python analysis extra path: `backend/` (so imports like `app.*` resolve)
- Pytest discovery under `backend/`
- Debug configuration to run Uvicorn with `--app-dir backend` and load `backend/.env`

## Files
- `settings.json`
  - `python.defaultInterpreterPath`: `.venv\\Scripts\\python.exe`
  - `python.analysis.extraPaths`: `["backend"]`
- `launch.json`
  - Debug: “API (Uvicorn, repo root)”
  - Program: `.venv\\Scripts\\uvicorn.exe`
  - Args: `app.main:app --reload --host 127.0.0.1 --port 8000 --app-dir backend`
  - Env file: `backend/.env`

## Usage
- Command Palette (Ctrl+Shift+P) → “Python: Select Interpreter” → ensure `.venv` is selected.
- Start debugging with the “API (Uvicorn, repo root)” configuration.

## Notes
- Do not put secrets in `.vscode/*`. Keep secrets in `backend/.env` (gitignored).
- You don’t need to activate the venv; the debug config and paths already use `.venv`. Activating is optional for convenience.
