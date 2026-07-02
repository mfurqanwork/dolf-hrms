import asyncio
from datetime import date

from sqlalchemy import delete, select

from app.core.database import async_session_maker, init_db
from app.core.security import get_password_hash
from app.models.attendance import AttendanceRecord
from app.models.company import Company
from app.models.employee import Employee, EmployeeContract
from app.models.request import Request, RequestStatus, RequestType
from app.models.user import User, UserRole
from scripts.seed_attendance import generate_attendance_records

DEFAULT_PASSWORD = "DolfTech123!"
COMPANY_SLUG = "dolf-technologies"
SUPER_ADMIN_EMAIL = "admin@dolftech.com"


def make_email(first_name: str, last_name: str) -> str:
    return f"{first_name[0].lower()}.{last_name.lower()}@dolftech.com"


def initials(first_name: str, last_name: str) -> str:
    return f"{first_name[0]}{last_name[0]}".upper()


TEAM = [
    ("Moath", "Qwaqneh", "VR Team Lead", "VR"),
    ("Abdelmoaty", "Almasah", "Training Manager", "Training"),
    ("Abdulrahman", "Salem", "Product Lead", "Product"),
    ("Mansour", "Alzawad", "XR Developer", "XR"),
    ("Reda", "Ghareeb", "CTO", "Executive"),
    ("Ayman", "Salah", "Security Engineer", "Security"),
    ("Osama", "Elhosary", "E-Learning Specialist", "E-Learning"),
    ("Mohamed", "Merghani", "Business Analyst", "Business"),
    ("Abdulmalik", "Aleid", "Network Engineer", "IT"),
    ("Mohammad", "Fakhruddin", "COO", "Executive"),
    ("Muhammad", "Furqan", "AI Engineer", "AI"),
    ("Wasan", "Aldossary", "AI/ML Engineer", "AI"),
    ("Nasser", "Alharbi", "Studio Assistant", "Studio"),
    ("Bushra", "Alobaidan", "HR Manager", "HR"),
    ("Abdelmonaem", "Abdallah", "QA Engineer", "QA"),
    ("Mahmoud", "Alshalalfeh", "Business Development", "Business Development"),
]


async def upsert_company(session) -> Company:
    company = (
        await session.execute(select(Company).where(Company.slug == COMPANY_SLUG))
    ).scalar_one_or_none()

    if company is None:
        company = Company(
            name="Dolf Technologies",
            slug=COMPANY_SLUG,
            location="Saudi Arabia",
        )
        session.add(company)
        print("Creating company: Dolf Technologies")
    else:
        company.name = "Dolf Technologies"
        company.location = "Saudi Arabia"
        session.add(company)
        print("Updating company: Dolf Technologies")

    await session.flush()
    return company


async def upsert_user(
    session,
    *,
    email: str,
    full_name: str,
    role: UserRole,
    company_id=None,
) -> User:
    password_hash = get_password_hash(DEFAULT_PASSWORD)
    user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            hashed_password=password_hash,
            full_name=full_name,
            role=role,
            company_id=company_id,
            is_active=True,
        )
        session.add(user)
    else:
        user.hashed_password = password_hash
        user.full_name = full_name
        user.role = role
        user.company_id = company_id
        user.is_active = True
        session.add(user)

    await session.flush()
    return user


async def upsert_employee(
    session,
    *,
    company_id,
    user: User,
    employee_code: str,
    first_name: str,
    last_name: str,
    email: str,
    department: str,
    job_title: str,
    hire_date: date,
) -> Employee:
    employee = (
        await session.execute(select(Employee).where(Employee.email == email))
    ).scalar_one_or_none()

    if employee is None:
        employee = (
            await session.execute(select(Employee).where(Employee.employee_code == employee_code))
        ).scalar_one_or_none()

    if employee is None:
        employee = Employee(
            user_id=user.id,
            company_id=company_id,
            employee_code=employee_code,
            first_name=first_name,
            last_name=last_name,
            email=email,
            department=department,
            job_title=job_title,
            hire_date=hire_date,
            avatar_initials=initials(first_name, last_name),
            nationality="Saudi Arabia",
            address="Riyadh, Saudi Arabia",
            work_type="On-site",
            shift="Day",
            status="active",
        )
        session.add(employee)
    else:
        employee.user_id = user.id
        employee.company_id = company_id
        employee.employee_code = employee_code
        employee.first_name = first_name
        employee.last_name = last_name
        employee.email = email
        employee.department = department
        employee.job_title = job_title
        employee.hire_date = hire_date
        employee.avatar_initials = initials(first_name, last_name)
        employee.nationality = "Saudi Arabia"
        employee.address = "Riyadh, Saudi Arabia"
        employee.work_type = "On-site"
        employee.shift = "Day"
        employee.status = "active"
        session.add(employee)

    await session.flush()
    return employee


async def refresh_company_seed_data(session, company_id) -> None:
    """Replace requests, contracts, and attendance so re-seeding stays idempotent."""
    await session.execute(delete(Request).where(Request.company_id == company_id))
    await session.execute(delete(AttendanceRecord).where(AttendanceRecord.company_id == company_id))
    await session.execute(
        delete(EmployeeContract).where(
            EmployeeContract.employee_id.in_(
                select(Employee.id).where(Employee.company_id == company_id)
            )
        )
    )
    await session.flush()


async def seed() -> None:
    await init_db()

    async with async_session_maker() as session:
        company = await upsert_company(session)

        await upsert_user(
            session,
            email=SUPER_ADMIN_EMAIL,
            full_name="Dolf Super Admin",
            role=UserRole.SUPER_ADMIN,
            company_id=None,
        )

        employees: list[Employee] = []

        for index, (first_name, last_name, job_title, department) in enumerate(TEAM, start=1):
            email = make_email(first_name, last_name)
            role = UserRole.COMPANY_ADMIN if job_title == "HR Manager" else UserRole.EMPLOYEE

            user = await upsert_user(
                session,
                email=email,
                full_name=f"{first_name} {last_name}",
                role=role,
                company_id=company.id,
            )

            employee = await upsert_employee(
                session,
                company_id=company.id,
                user=user,
                employee_code=f"EMP-{index:03d}",
                first_name=first_name,
                last_name=last_name,
                email=email,
                department=department,
                job_title=job_title,
                hire_date=date(2022, 1, 1 + (index % 28)),
            )
            employees.append(employee)

        await refresh_company_seed_data(session, company.id)

        session.add(
            EmployeeContract(
                employee_id=employees[10].id,
                contract_type="full_time",
                start_date=date(2023, 6, 1),
                salary=18000,
                currency="SAR",
            )
        )

        requests = [
            Request(
                company_id=company.id,
                employee_id=employees[10].id,
                request_type=RequestType.DOCUMENT,
                title="Salary Certificate",
                description="Need salary certificate for bank",
                status=RequestStatus.PENDING,
            ),
            Request(
                company_id=company.id,
                employee_id=employees[3].id,
                request_type=RequestType.SHIFT,
                title="Evening shift request",
                description="Prefer evening shift next sprint",
                status=RequestStatus.APPROVED,
            ),
            Request(
                company_id=company.id,
                employee_id=employees[14].id,
                request_type=RequestType.WORK_TYPE,
                title="Remote Fridays",
                description="Work remotely on Fridays",
                status=RequestStatus.REJECTED,
            ),
        ]
        session.add_all(requests)

        attendance_records = generate_attendance_records(company.id, employees, days_back=45)
        session.add_all(attendance_records)

        await session.commit()
        print("Seed data upserted successfully.")
        print(f"  Employees: {len(employees)}")
        print(f"  Attendance records: {len(attendance_records)}")
        print(f"Default password for all accounts: {DEFAULT_PASSWORD}")
        print("Demo logins:")
        print("  Super Admin: admin@dolftech.com")
        print("  HR Manager:  b.alobaidan@dolftech.com")
        print("  Developer:   m.furqan@dolftech.com")


if __name__ == "__main__":
    asyncio.run(seed())
