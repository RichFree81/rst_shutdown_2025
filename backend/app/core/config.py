# backend/app/core/config.py

from typing import List
from pydantic import Field
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    # Accept either `app_name` (lowercase) or `APP_NAME` from .env
    APP_NAME: str = Field("my_cloud_api", alias="app_name")

    # Accept either `environment` or `APP_ENV` from .env
    APP_ENV: str = Field("dev", alias="environment")

    # Database URL
    # Default (dev): absolute path to SQLite under backend/.data/, independent of current working directory
    _default_sqlite_path = (Path(__file__).resolve().parents[2] / ".data" / "app_runtime.dev.sqlite").as_posix()
    DATABASE_URL: str = f"sqlite:///{_default_sqlite_path}"

    # Optional CORS list; leave empty and set a default in main.py for dev
    CORS_ALLOW_ORIGINS: List[str] = Field(default_factory=list)

    # JWT/Auth
    JWT_SECRET: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MIN: int = 60

    # Admin bootstrap
    ADMIN_EMAIL: str | None = None
    ADMIN_PASSWORD: str | None = None

    # Email/SMTP
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAIL_FROM: str | None = None

    # Frontend base URL (for building links in emails)
    FRONTEND_BASE_URL: str = Field("http://localhost:5173", alias="FRONTEND_URL")

    # Accept CORS_ALLOW_ORIGINS as either JSON array or comma-separated string
    @field_validator("CORS_ALLOW_ORIGINS", mode="before")
    @classmethod
    def parse_cors_allow_origins(cls, v):
        if v is None or v == "":
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            # Try JSON first
            if s.startswith("["):
                try:
                    import json
                    parsed = json.loads(s)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            # Fallback to comma-separated
            return [part.strip() for part in s.split(",") if part.strip()]
        return v

    # Load env from backend/.env via absolute path so it works from any CWD
    _env_file_default = (Path(__file__).resolve().parents[2] / ".env").as_posix()

    model_config = SettingsConfigDict(
        env_file=_env_file_default,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",          # <-- ignore any other unexpected keys
        populate_by_name=True,   # <-- allow alias fields above to populate
    )

settings = Settings()
