from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

import enum
from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from app.models.company import Company
from app.models.enums import pg_enum


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    COMPANY_ADMIN = "company_admin"
    EMPLOYEE = "employee"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str
    role: UserRole = Field(
        default=UserRole.EMPLOYEE,
        sa_column=Column(
            pg_enum(UserRole, "userrole"),
            nullable=False,
            server_default="employee",
        ),
    )
    is_active: bool = Field(default=True)
    company_id: Optional[UUID] = Field(default=None, foreign_key="companies.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    company: Optional[Company] = Relationship(back_populates="users")
    employee: Optional["Employee"] = Relationship(back_populates="user")
