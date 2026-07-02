from datetime import date, datetime, time
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models.attendance import AttendanceStatus
from app.models.request import RequestStatus, RequestType
from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    company_id: Optional[UUID] = None
    created_at: datetime


class CompanyCreate(BaseModel):
    name: str
    slug: str
    location: str = "Saudi Arabia"


class CompanyRead(BaseModel):
    id: UUID
    name: str
    slug: str
    location: str
    created_at: datetime


class EmployeeContractRead(BaseModel):
    id: UUID
    contract_type: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    salary: Optional[float] = None
    currency: str


class EmployeeRead(BaseModel):
    id: UUID
    company_id: UUID
    user_id: Optional[UUID] = None
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    hire_date: Optional[date] = None
    status: str
    avatar_initials: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    manager_name: Optional[str] = None
    work_type: Optional[str] = None
    shift: Optional[str] = None
    contract: Optional[EmployeeContractRead] = None


class EmployeeUpdate(BaseModel):
    phone: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    manager_name: Optional[str] = None
    work_type: Optional[str] = None
    shift: Optional[str] = None


class EmployeeCreate(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    department: Optional[str] = None
    job_title: Optional[str] = None
    hire_date: Optional[date] = None


class RequestCreate(BaseModel):
    request_type: RequestType
    title: str
    description: Optional[str] = None


class RequestRead(BaseModel):
    id: UUID
    company_id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    request_type: RequestType
    title: str
    description: Optional[str] = None
    status: RequestStatus
    created_at: datetime
    reviewed_at: Optional[datetime] = None


class DashboardStats(BaseModel):
    employee_count: int
    pending_requests: int
    approved_requests: int
    rejected_requests: int


class AttendanceRead(BaseModel):
    id: UUID
    company_id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    work_date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    scheduled_start: time
    scheduled_end: time
    hours_worked: Optional[float] = None
    status: AttendanceStatus


class AttendanceTodayRead(BaseModel):
    record: Optional[AttendanceRead] = None
    can_check_in: bool
    can_check_out: bool
    is_working_day: bool = True
    schedule_start: str
    schedule_end: str


class AttendanceChartPoint(BaseModel):
    work_date: date
    hours_worked: float
    record_count: int
    avg_check_in: Optional[str] = None
    avg_check_out: Optional[str] = None


class AttendanceChartData(BaseModel):
    points: list[AttendanceChartPoint]
    schedule_start: str
    schedule_end: str
