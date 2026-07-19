"""SQLAlchemy helpers for Postgres enums that store Enum.value (not Enum.name)."""

from enum import Enum
from typing import Type

from sqlalchemy import Enum as SAEnum


def pg_enum(enum_cls: Type[Enum], name: str) -> SAEnum:
    """Bind a Python Enum to an existing Postgres TYPE using its values."""
    return SAEnum(
        enum_cls,
        name=name,
        values_callable=lambda members: [member.value for member in members],
        create_type=False,
    )
