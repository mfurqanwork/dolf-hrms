from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.deps import assert_company_access, get_current_user, get_user_employee, require_roles
from app.models.company import Company
from app.models.employee import Employee, EmployeeContract
from app.models.request import Request, RequestStatus
from app.models.user import User, UserRole
from app.schemas import (
    CompanyCreate,
    CompanyRead,
    DashboardStats,
    EmployeeCreate,
    EmployeeRead,
    EmployeeUpdate,
    RequestCreate,
    RequestRead,
)

router = APIRouter(tags=["core"])


def employee_to_read(employee: Employee) -> EmployeeRead:
    contract_read = None
    if employee.contract:
        contract_read = {
            "id": employee.contract.id,
            "contract_type": employee.contract.contract_type,
            "start_date": employee.contract.start_date,
            "end_date": employee.contract.end_date,
            "salary": employee.contract.salary,
            "currency": employee.contract.currency,
        }
    return EmployeeRead(
        id=employee.id,
        company_id=employee.company_id,
        user_id=employee.user_id,
        employee_code=employee.employee_code,
        first_name=employee.first_name,
        last_name=employee.last_name,
        email=employee.email,
        phone=employee.phone,
        department=employee.department,
        job_title=employee.job_title,
        hire_date=employee.hire_date,
        status=employee.status,
        avatar_initials=employee.avatar_initials,
        nationality=employee.nationality,
        date_of_birth=employee.date_of_birth,
        address=employee.address,
        manager_name=employee.manager_name,
        work_type=employee.work_type,
        shift=employee.shift,
        contract=contract_read,
    )


@router.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> DashboardStats:
    employee_query = select(func.count()).select_from(Employee)
    request_query = select(Request.status, func.count()).group_by(Request.status)

    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.company_id is None:
            raise HTTPException(status_code=400, detail="User has no company")
        employee_query = employee_query.where(Employee.company_id == current_user.company_id)
        request_query = request_query.where(Request.company_id == current_user.company_id)

    employee_count = (await session.execute(employee_query)).scalar_one()
    status_rows = (await session.execute(request_query)).all()
    counts = {status.value if hasattr(status, "value") else status: count for status, count in status_rows}

    return DashboardStats(
        employee_count=employee_count,
        pending_requests=counts.get(RequestStatus.PENDING.value, 0),
        approved_requests=counts.get(RequestStatus.APPROVED.value, 0),
        rejected_requests=counts.get(RequestStatus.REJECTED.value, 0),
    )


@router.get("/companies", response_model=list[CompanyRead])
async def list_companies(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(require_roles(UserRole.SUPER_ADMIN))],
) -> list[Company]:
    result = await session.execute(select(Company).order_by(Company.name))
    return list(result.scalars().all())


@router.post("/companies", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
async def create_company(
    payload: CompanyCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(require_roles(UserRole.SUPER_ADMIN))],
) -> Company:
    company = Company(name=payload.name, slug=payload.slug, location=payload.location)
    session.add(company)
    await session.commit()
    await session.refresh(company)
    return company


@router.get("/employees", response_model=list[EmployeeRead])
async def list_employees(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[EmployeeRead]:
    query = select(Employee).options(selectinload(Employee.contract)).order_by(Employee.first_name)

    if current_user.role == UserRole.EMPLOYEE:
        employee = await get_user_employee(session, current_user)
        if employee is None:
            return []
        return [employee_to_read(employee)]

    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.company_id is None:
            raise HTTPException(status_code=400, detail="User has no company")
        query = query.where(Employee.company_id == current_user.company_id)

    result = await session.execute(query)
    return [employee_to_read(emp) for emp in result.scalars().all()]


@router.post("/employees", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
async def create_employee(
    payload: EmployeeCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN))],
) -> EmployeeRead:
    if current_user.role == UserRole.COMPANY_ADMIN and current_user.company_id is None:
        raise HTTPException(status_code=400, detail="User has no company")

    company_id = current_user.company_id
    if current_user.role == UserRole.SUPER_ADMIN:
        first_company = (await session.execute(select(Company).limit(1))).scalar_one_or_none()
        if first_company is None:
            raise HTTPException(status_code=400, detail="Create a company first")
        company_id = first_company.id

    initials = f"{payload.first_name[:1]}{payload.last_name[:1]}".upper()
    employee = Employee(
        company_id=company_id,
        employee_code=payload.employee_code,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        department=payload.department,
        job_title=payload.job_title,
        hire_date=payload.hire_date,
        avatar_initials=initials,
    )
    session.add(employee)
    await session.commit()
    await session.refresh(employee)
    return employee_to_read(employee)


@router.get("/employees/{employee_id}", response_model=EmployeeRead)
async def get_employee(
    employee_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> EmployeeRead:
    result = await session.execute(
        select(Employee).where(Employee.id == employee_id).options(selectinload(Employee.contract))
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    if current_user.role == UserRole.EMPLOYEE:
        own = await get_user_employee(session, current_user)
        if own is None or own.id != employee.id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        assert_company_access(current_user, employee.company_id)

    return employee_to_read(employee)


@router.patch("/employees/{employee_id}", response_model=EmployeeRead)
async def update_employee(
    employee_id: UUID,
    payload: EmployeeUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> EmployeeRead:
    result = await session.execute(
        select(Employee).where(Employee.id == employee_id).options(selectinload(Employee.contract))
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    if current_user.role == UserRole.EMPLOYEE:
        own = await get_user_employee(session, current_user)
        if own is None or own.id != employee.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.COMPANY_ADMIN:
        assert_company_access(current_user, employee.company_id)
    elif current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)

    session.add(employee)
    await session.commit()
    await session.refresh(employee)
    result = await session.execute(
        select(Employee).where(Employee.id == employee_id).options(selectinload(Employee.contract))
    )
    employee = result.scalar_one()
    return employee_to_read(employee)


@router.get("/requests", response_model=list[RequestRead])
async def list_requests(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[RequestRead]:
    query = select(Request, Employee).join(Employee, Request.employee_id == Employee.id).order_by(Request.created_at.desc())

    if current_user.role == UserRole.EMPLOYEE:
        own = await get_user_employee(session, current_user)
        if own is None:
            return []
        query = query.where(Request.employee_id == own.id)
    elif current_user.role != UserRole.SUPER_ADMIN:
        if current_user.company_id is None:
            raise HTTPException(status_code=400, detail="User has no company")
        query = query.where(Request.company_id == current_user.company_id)

    rows = (await session.execute(query)).all()
    return [
        RequestRead(
            id=req.id,
            company_id=req.company_id,
            employee_id=req.employee_id,
            employee_name=f"{emp.first_name} {emp.last_name}",
            request_type=req.request_type,
            title=req.title,
            description=req.description,
            status=req.status,
            created_at=req.created_at,
            reviewed_at=req.reviewed_at,
        )
        for req, emp in rows
    ]


@router.post("/requests", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: RequestCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> RequestRead:
    employee = await get_user_employee(session, current_user)
    if employee is None and current_user.role in {UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN}:
        first_emp = (
            await session.execute(
                select(Employee).where(
                    Employee.company_id == current_user.company_id if current_user.company_id else True
                ).limit(1)
            )
        ).scalar_one_or_none()
        employee = first_emp

    if employee is None:
        raise HTTPException(status_code=400, detail="No employee profile linked to user")

    request = Request(
        company_id=employee.company_id,
        employee_id=employee.id,
        request_type=payload.request_type,
        title=payload.title,
        description=payload.description,
    )
    session.add(request)
    await session.commit()
    await session.refresh(request)
    return RequestRead(
        id=request.id,
        company_id=request.company_id,
        employee_id=request.employee_id,
        employee_name=f"{employee.first_name} {employee.last_name}",
        request_type=request.request_type,
        title=request.title,
        description=request.description,
        status=request.status,
        created_at=request.created_at,
        reviewed_at=request.reviewed_at,
    )


async def _review_request(
    request_id: UUID,
    new_status: RequestStatus,
    session: AsyncSession,
    current_user: User,
) -> RequestRead:
    result = await session.execute(
        select(Request, Employee)
        .join(Employee, Request.employee_id == Employee.id)
        .where(Request.id == request_id)
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=404, detail="Request not found")
    request, employee = row

    if current_user.role not in {UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN}:
        raise HTTPException(status_code=403, detail="Only admins can review requests")
    if current_user.role == UserRole.COMPANY_ADMIN:
        assert_company_access(current_user, request.company_id)

    from datetime import datetime

    request.status = new_status
    request.reviewed_by_id = current_user.id
    request.reviewed_at = datetime.utcnow()
    session.add(request)
    await session.commit()
    await session.refresh(request)

    return RequestRead(
        id=request.id,
        company_id=request.company_id,
        employee_id=request.employee_id,
        employee_name=f"{employee.first_name} {employee.last_name}",
        request_type=request.request_type,
        title=request.title,
        description=request.description,
        status=request.status,
        created_at=request.created_at,
        reviewed_at=request.reviewed_at,
    )


@router.patch("/requests/{request_id}/approve", response_model=RequestRead)
async def approve_request(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN))],
) -> RequestRead:
    return await _review_request(request_id, RequestStatus.APPROVED, session, current_user)


@router.patch("/requests/{request_id}/reject", response_model=RequestRead)
async def reject_request(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN))],
) -> RequestRead:
    return await _review_request(request_id, RequestStatus.REJECTED, session, current_user)


@router.get("/recruitment")
async def recruitment_placeholder() -> dict[str, str]:
    return {"message": "Recruitment module coming soon"}


@router.get("/onboarding")
async def onboarding_placeholder() -> dict[str, str]:
    return {"message": "Onboarding module coming soon"}
