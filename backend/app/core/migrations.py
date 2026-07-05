from __future__ import annotations

import asyncio
from pathlib import Path

from alembic import command
from alembic.config import Config

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def get_alembic_config() -> Config:
    return Config(str(BACKEND_ROOT / "alembic.ini"))


def run_migrations(revision: str = "head") -> None:
    """Apply Alembic migrations synchronously."""
    command.upgrade(get_alembic_config(), revision)


async def init_db() -> None:
    """Run pending migrations on application startup."""
    await asyncio.to_thread(run_migrations, "head")


def check_migrations() -> None:
    """Fail if SQLModel metadata differs from the latest migration."""
    command.check(get_alembic_config())


def create_revision(message: str, autogenerate: bool = True) -> None:
    """Generate a new migration revision."""
    if autogenerate:
        command.revision(get_alembic_config(), message=message, autogenerate=True)
    else:
        command.revision(get_alembic_config(), message=message)
