from datetime import date, datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.attendance import AttendanceRecord
    from app.models.company import Company
    from app.models.request import Request
    from app.models.user import User


class Employee(SQLModel, table=True):
    __tablename__ = "employees"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id", unique=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    employee_code: str = Field(index=True)
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    hire_date: Optional[date] = None
    status: str = Field(default="active")
    avatar_initials: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    manager_name: Optional[str] = None
    work_type: Optional[str] = None
    shift: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    company: "Company" = Relationship(back_populates="employees")
    user: Optional["User"] = Relationship(back_populates="employee")
    contract: Optional["EmployeeContract"] = Relationship(back_populates="employee")
    requests: list["Request"] = Relationship(back_populates="employee")
    attendance_records: list["AttendanceRecord"] = Relationship(back_populates="employee")


class EmployeeContract(SQLModel, table=True):
    __tablename__ = "employee_contracts"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    employee_id: UUID = Field(foreign_key="employees.id", unique=True)
    contract_type: str = Field(default="full_time")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    salary: Optional[float] = None
    currency: str = Field(default="SAR")

    employee: Employee = Relationship(back_populates="contract")
