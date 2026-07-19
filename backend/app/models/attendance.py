import uuid
from datetime import date, datetime, time
from enum import Enum
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from app.models.enums import pg_enum

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.employee import Employee

SCHEDULED_START = time(8, 0)
SCHEDULED_END = time(17, 30)


def is_working_day(d: date) -> bool:
    """Saudi Arabia weekend: Friday and Saturday are non-working days."""
    return d.weekday() not in (4, 5)


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    LATE = "late"
    ABSENT = "absent"
    ON_LEAVE = "on_leave"
    HALF_DAY = "half_day"


class AttendanceRecord(SQLModel, table=True):
    __tablename__ = "attendance_records"
    __table_args__ = (UniqueConstraint("employee_id", "work_date", name="uq_attendance_employee_date"),)

    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    employee_id: UUID = Field(foreign_key="employees.id", index=True)
    work_date: date = Field(index=True)
    check_in: datetime | None = None
    check_out: datetime | None = None
    scheduled_start: time = Field(default=SCHEDULED_START)
    scheduled_end: time = Field(default=SCHEDULED_END)
    hours_worked: float | None = None
    status: AttendanceStatus = Field(
        default=AttendanceStatus.PRESENT,
        sa_column=Column(
            pg_enum(AttendanceStatus, "attendancestatus"),
            nullable=False,
            server_default="present",
        ),
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)

    company: Optional["Company"] = Relationship(back_populates="attendance_records")
    employee: Optional["Employee"] = Relationship(back_populates="attendance_records")
