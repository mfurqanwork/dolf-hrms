from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class Company(SQLModel, table=True):
    __tablename__ = "companies"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    location: str = Field(default="Saudi Arabia")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    users: list["User"] = Relationship(back_populates="company")
    employees: list["Employee"] = Relationship(back_populates="company")
    attendance_records: list["AttendanceRecord"] = Relationship(back_populates="company")
