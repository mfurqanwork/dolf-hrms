from datetime import date, datetime, time, timedelta
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.deps import assert_company_access, get_current_user, get_user_employee
from app.models.attendance import (
    SCHEDULED_END,
    SCHEDULED_START,
    AttendanceRecord,
    AttendanceStatus,
    is_working_day,
)
from app.models.employee import Employee
from app.models.user import User, UserRole
from app.schemas import AttendanceChartData, AttendanceChartPoint, AttendanceRead, AttendanceTodayRead

router = APIRouter(tags=["attendance"])

LATE_GRACE_MINUTES = 15


def _format_time(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.strftime("%H:%M")


def _attendance_to_read(record: AttendanceRecord, employee: Employee | None = None) -> AttendanceRead:
    employee_name = None
    employee_code = None
    if employee is not None:
        employee_name = f"{employee.first_name} {employee.last_name}"
        employee_code = employee.employee_code
    elif record.employee is not None:
        employee_name = f"{record.employee.first_name} {record.employee.last_name}"
        employee_code = record.employee.employee_code

    return AttendanceRead(
        id=record.id,
        company_id=record.company_id,
        employee_id=record.employee_id,
        employee_name=employee_name,
        employee_code=employee_code,
        work_date=record.work_date,
        check_in=record.check_in,
        check_out=record.check_out,
        scheduled_start=record.scheduled_start,
        scheduled_end=record.scheduled_end,
        hours_worked=record.hours_worked,
        status=record.status,
    )


def _determine_status(check_in: datetime, work_date: date) -> AttendanceStatus:
    scheduled_start = datetime.combine(work_date, SCHEDULED_START)
    grace_end = scheduled_start + timedelta(minutes=LATE_GRACE_MINUTES)
    if check_in > grace_end:
        return AttendanceStatus.LATE
    return AttendanceStatus.PRESENT


def _compute_hours(check_in: datetime, check_out: datetime) -> float:
    delta = check_out - check_in
    return round(max(delta.total_seconds() / 3600, 0), 2)


async def _get_today_record(
    session: AsyncSession, employee_id: UUID, work_date: date
) -> AttendanceRecord | None:
    result = await session.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.employee_id == employee_id,
            AttendanceRecord.work_date == work_date,
        )
    )
    return result.scalar_one_or_none()


@router.get("/attendance/today", response_model=AttendanceTodayRead)
async def get_today_attendance(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AttendanceTodayRead:
    employee = await get_user_employee(session, current_user)
    if employee is None:
        raise HTTPException(status_code=403, detail="No employee profile linked to user")

    today = date.today()
    working_day = is_working_day(today)
    record = await _get_today_record(session, employee.id, today)
    record_read = _attendance_to_read(record, employee) if record else None

    return AttendanceTodayRead(
        record=record_read,
        can_check_in=working_day and (record is None or record.check_in is None),
        can_check_out=working_day
        and record is not None
        and record.check_in is not None
        and record.check_out is None,
        is_working_day=working_day,
        schedule_start=SCHEDULED_START.strftime("%H:%M"),
        schedule_end=SCHEDULED_END.strftime("%H:%M"),
    )


@router.post("/attendance/check-in", response_model=AttendanceRead)
async def check_in(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AttendanceRead:
    employee = await get_user_employee(session, current_user)
    if employee is None:
        raise HTTPException(status_code=403, detail="No employee profile linked to user")

    today = date.today()
    if not is_working_day(today):
        raise HTTPException(status_code=400, detail="Today is not a working day")

    record = await _get_today_record(session, employee.id, today)
    if record is not None and record.check_in is not None:
        raise HTTPException(status_code=400, detail="Already checked in today")

    now = datetime.utcnow()
    attendance_status = _determine_status(now, today)

    if record is None:
        record = AttendanceRecord(
            company_id=employee.company_id,
            employee_id=employee.id,
            work_date=today,
            check_in=now,
            scheduled_start=SCHEDULED_START,
            scheduled_end=SCHEDULED_END,
            status=attendance_status,
        )
    else:
        record.check_in = now
        record.status = attendance_status

    session.add(record)
    await session.commit()
    await session.refresh(record)
    return _attendance_to_read(record, employee)


@router.post("/attendance/check-out", response_model=AttendanceRead)
async def check_out(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AttendanceRead:
    employee = await get_user_employee(session, current_user)
    if employee is None:
        raise HTTPException(status_code=403, detail="No employee profile linked to user")

    today = date.today()
    if not is_working_day(today):
        raise HTTPException(status_code=400, detail="Today is not a working day")

    record = await _get_today_record(session, employee.id, today)
    if record is None or record.check_in is None:
        raise HTTPException(status_code=400, detail="Must check in before checking out")
    if record.check_out is not None:
        raise HTTPException(status_code=400, detail="Already checked out today")

    now = datetime.utcnow()
    record.check_out = now
    record.hours_worked = _compute_hours(record.check_in, now)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return _attendance_to_read(record, employee)


@router.get("/attendance", response_model=list[AttendanceRead])
async def list_attendance(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    from_date: Annotated[Optional[date], Query()] = None,
    to_date: Annotated[Optional[date], Query()] = None,
    employee_id: Annotated[Optional[UUID], Query()] = None,
) -> list[AttendanceRead]:
    if to_date is None:
        to_date = date.today()
    if from_date is None:
        from_date = to_date - timedelta(days=30)

    query = (
        select(AttendanceRecord, Employee)
        .join(Employee, AttendanceRecord.employee_id == Employee.id)
        .where(AttendanceRecord.work_date >= from_date, AttendanceRecord.work_date <= to_date)
        .order_by(AttendanceRecord.work_date.desc(), Employee.first_name)
    )

    if current_user.role == UserRole.EMPLOYEE:
        own = await get_user_employee(session, current_user)
        if own is None:
            return []
        query = query.where(AttendanceRecord.employee_id == own.id)
    elif current_user.role == UserRole.COMPANY_ADMIN:
        if current_user.company_id is None:
            raise HTTPException(status_code=400, detail="User has no company")
        query = query.where(AttendanceRecord.company_id == current_user.company_id)
        if employee_id is not None:
            query = query.where(AttendanceRecord.employee_id == employee_id)
    elif current_user.role == UserRole.SUPER_ADMIN:
        if employee_id is not None:
            query = query.where(AttendanceRecord.employee_id == employee_id)
    else:
        raise HTTPException(status_code=403, detail="Access denied")

    rows = (await session.execute(query)).all()
    return [
        _attendance_to_read(record, emp)
        for record, emp in rows
        if is_working_day(record.work_date)
    ]


@router.get("/attendance/chart", response_model=AttendanceChartData)
async def attendance_chart(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    from_date: Annotated[Optional[date], Query()] = None,
    to_date: Annotated[Optional[date], Query()] = None,
    employee_id: Annotated[Optional[UUID], Query()] = None,
) -> AttendanceChartData:
    if to_date is None:
        to_date = date.today()
    if from_date is None:
        from_date = to_date - timedelta(days=30)

    query = select(AttendanceRecord).where(
        AttendanceRecord.work_date >= from_date,
        AttendanceRecord.work_date <= to_date,
    )

    if current_user.role == UserRole.EMPLOYEE:
        own = await get_user_employee(session, current_user)
        if own is None:
            return AttendanceChartData(
                points=[],
                schedule_start=SCHEDULED_START.strftime("%H:%M"),
                schedule_end=SCHEDULED_END.strftime("%H:%M"),
            )
        query = query.where(AttendanceRecord.employee_id == own.id)
    elif current_user.role == UserRole.COMPANY_ADMIN:
        if current_user.company_id is None:
            raise HTTPException(status_code=400, detail="User has no company")
        query = query.where(AttendanceRecord.company_id == current_user.company_id)
        if employee_id is not None:
            query = query.where(AttendanceRecord.employee_id == employee_id)
    elif current_user.role == UserRole.SUPER_ADMIN:
        if employee_id is not None:
            query = query.where(AttendanceRecord.employee_id == employee_id)
    else:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await session.execute(query.order_by(AttendanceRecord.work_date))
    records = list(result.scalars().all())

    by_date: dict[date, list[AttendanceRecord]] = {}
    for record in records:
        if not is_working_day(record.work_date):
            continue
        by_date.setdefault(record.work_date, []).append(record)

    points: list[AttendanceChartPoint] = []
    current = from_date
    while current <= to_date:
        if not is_working_day(current):
            current += timedelta(days=1)
            continue

        day_records = by_date.get(current, [])
        total_hours = sum(r.hours_worked or 0 for r in day_records)
        check_ins = [r.check_in for r in day_records if r.check_in]
        check_outs = [r.check_out for r in day_records if r.check_out]

        avg_in = None
        avg_out = None
        if check_ins:
            avg_seconds = sum(
                (dt.hour * 3600 + dt.minute * 60 + dt.second) for dt in check_ins
            ) / len(check_ins)
            avg_in = time(int(avg_seconds // 3600), int((avg_seconds % 3600) // 60)).strftime("%H:%M")
        if check_outs:
            avg_seconds = sum(
                (dt.hour * 3600 + dt.minute * 60 + dt.second) for dt in check_outs
            ) / len(check_outs)
            avg_out = time(int(avg_seconds // 3600), int((avg_seconds % 3600) // 60)).strftime("%H:%M")

        points.append(
            AttendanceChartPoint(
                work_date=current,
                hours_worked=round(total_hours, 2),
                record_count=len(day_records),
                avg_check_in=avg_in,
                avg_check_out=avg_out,
            )
        )
        current += timedelta(days=1)

    return AttendanceChartData(
        points=points,
        schedule_start=SCHEDULED_START.strftime("%H:%M"),
        schedule_end=SCHEDULED_END.strftime("%H:%M"),
    )
