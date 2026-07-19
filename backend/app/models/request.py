import enum
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from app.models.enums import pg_enum


class RequestType(str, enum.Enum):
    DOCUMENT = "document"
    SHIFT = "shift"
    WORK_TYPE = "work_type"


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Request(SQLModel, table=True):
    __tablename__ = "requests"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    employee_id: UUID = Field(foreign_key="employees.id", index=True)
    request_type: RequestType = Field(
        sa_column=Column(pg_enum(RequestType, "requesttype"), nullable=False),
    )
    title: str
    description: Optional[str] = None
    status: RequestStatus = Field(
        default=RequestStatus.PENDING,
        sa_column=Column(
            pg_enum(RequestStatus, "requeststatus"),
            nullable=False,
            server_default="pending",
        ),
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_by_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    reviewed_at: Optional[datetime] = None

    employee: "Employee" = Relationship(back_populates="requests")
