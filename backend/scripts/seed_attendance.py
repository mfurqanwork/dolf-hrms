import random
from datetime import date, datetime, time, timedelta

from app.models.attendance import (
    SCHEDULED_END,
    SCHEDULED_START,
    AttendanceRecord,
    AttendanceStatus,
    is_working_day,
)
from app.models.employee import Employee


def _combine(work_date: date, hour: int, minute: int) -> datetime:
    return datetime.combine(work_date, time(hour, minute))


def _recent_working_days(end_date: date, count: int) -> list[date]:
    """Walk backwards from end_date and collect the most recent working days."""
    days: list[date] = []
    current = end_date
    while len(days) < count:
        if is_working_day(current):
            days.append(current)
        current -= timedelta(days=1)
    days.reverse()
    return days


def generate_attendance_records(
    company_id,
    employees: list[Employee],
    *,
    days_back: int = 45,
    include_today: bool = False,
) -> list[AttendanceRecord]:
    """Generate attendance for the most recent N working days (Sun–Thu), excluding Fri/Sat."""
    records: list[AttendanceRecord] = []
    today = date.today()
    end_date = today if include_today else today - timedelta(days=1)
    if not is_working_day(end_date):
        end_date -= timedelta(days=1)
        while not is_working_day(end_date):
            end_date -= timedelta(days=1)
    work_dates = _recent_working_days(end_date, days_back)

    for work_date in work_dates:
        for emp in employees:
            roll = random.random()

            if roll < 0.03:
                records.append(
                    AttendanceRecord(
                        company_id=company_id,
                        employee_id=emp.id,
                        work_date=work_date,
                        scheduled_start=SCHEDULED_START,
                        scheduled_end=SCHEDULED_END,
                        status=AttendanceStatus.ABSENT,
                    )
                )
                continue

            if roll < 0.06:
                records.append(
                    AttendanceRecord(
                        company_id=company_id,
                        employee_id=emp.id,
                        work_date=work_date,
                        scheduled_start=SCHEDULED_START,
                        scheduled_end=SCHEDULED_END,
                        status=AttendanceStatus.ON_LEAVE,
                    )
                )
                continue

            if roll < 0.09:
                check_in = _combine(work_date, 8, random.randint(30, 55))
                check_out = _combine(work_date, 13, random.randint(0, 30))
                hours = round((check_out - check_in).total_seconds() / 3600, 2)
                records.append(
                    AttendanceRecord(
                        company_id=company_id,
                        employee_id=emp.id,
                        work_date=work_date,
                        check_in=check_in,
                        check_out=check_out,
                        scheduled_start=SCHEDULED_START,
                        scheduled_end=SCHEDULED_END,
                        hours_worked=hours,
                        status=AttendanceStatus.HALF_DAY,
                    )
                )
                continue

            if roll < 0.22:
                check_in = _combine(work_date, 8, random.randint(16, 50))
                status = AttendanceStatus.LATE
            else:
                check_in_minute = random.randint(0, 10)
                if check_in_minute >= 50:
                    check_in = _combine(work_date, 7, random.randint(45, 59))
                else:
                    check_in = _combine(work_date, 8, check_in_minute)
                status = AttendanceStatus.PRESENT

            check_out_hour = 17
            check_out_minute = random.randint(15, 45)
            if random.random() < 0.08:
                check_out_hour = 18
                check_out_minute = random.randint(0, 30)
            check_out = _combine(work_date, check_out_hour, check_out_minute)

            hours = round((check_out - check_in).total_seconds() / 3600, 2)
            records.append(
                AttendanceRecord(
                    company_id=company_id,
                    employee_id=emp.id,
                    work_date=work_date,
                    check_in=check_in,
                    check_out=check_out,
                    scheduled_start=SCHEDULED_START,
                    scheduled_end=SCHEDULED_END,
                    hours_worked=hours,
                    status=status,
                )
            )

    return records
