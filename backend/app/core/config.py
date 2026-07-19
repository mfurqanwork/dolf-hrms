from functools import lru_cache
from typing import List
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_database_url(url: str, *, driver: str) -> str:
    """Normalize postgres URLs for SQLAlchemy (asyncpg or psycopg2)."""
    normalized = url.strip().replace("postgres://", "postgresql://", 1)

    for prefix in (
        "postgresql+asyncpg://",
        "postgresql+psycopg2://",
        "postgresql://",
    ):
        if normalized.startswith(prefix):
            normalized = f"postgresql+{driver}://" + normalized[len(prefix) :]
            break

    parsed = urlparse(normalized)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    host = (parsed.hostname or "").lower()
    is_local = host in {"", "localhost", "127.0.0.1", "db"}

    # Hosted Postgres (Neon, Supabase, Vercel) usually requires TLS.
    # psycopg2 uses sslmode=; asyncpg uses ssl=.
    if driver == "asyncpg":
        if "sslmode" in query and "ssl" not in query:
            query["ssl"] = query.pop("sslmode")
        elif not is_local and "ssl" not in query:
            query["ssl"] = "require"
    elif not is_local and "sslmode" not in query:
        query["sslmode"] = "require"

    return urlunparse(parsed._replace(query=urlencode(query)))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    # Accept Vercel/Neon-style POSTGRES_URL as a fallback for DATABASE_URL.
    database_url: str = Field(
        default="postgresql+asyncpg://hrms:hrms_secret@localhost:5432/hrms",
        validation_alias=AliasChoices("DATABASE_URL", "POSTGRES_URL", "database_url"),
    )
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        return _normalize_database_url(self.database_url, driver="asyncpg")

    @property
    def sync_database_url(self) -> str:
        return _normalize_database_url(self.database_url, driver="psycopg2")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
