import asyncio
from datetime import date

from sqlalchemy import delete, select

from app.core.database import async_session_maker, init_db
from app.core.security import get_password_hash
from app.models.company import Company
from app.models.employee import Employee, EmployeeContract
from app.models.request import Request, RequestStatus, RequestType
from app.models.user import User, UserRole

DEFAULT_PASSWORD = "DolfTech123!"


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


async def seed() -> None:
    await init_db()

    async with async_session_maker() as session:
        existing = (await session.execute(select(Company).where(Company.slug == "dolf-technologies"))).scalar_one_or_none()
        if existing:
            print("Resetting existing Dolf Technologies seed data...")
            await session.execute(delete(Request).where(Request.company_id == existing.id))
            await session.execute(
                delete(EmployeeContract).where(
                    EmployeeContract.employee_id.in_(select(Employee.id).where(Employee.company_id == existing.id))
                )
            )
            await session.execute(delete(Employee).where(Employee.company_id == existing.id))
            await session.execute(delete(User).where(User.company_id == existing.id))
            await session.execute(delete(Company).where(Company.id == existing.id))
            await session.commit()

        company = Company(
            name="Dolf Technologies",
            slug="dolf-technologies",
            location="Saudi Arabia",
        )
        session.add(company)
        await session.flush()

        super_admin = User(
            email="admin@dolftech.com",
            hashed_password=get_password_hash(DEFAULT_PASSWORD),
            full_name="Dolf Super Admin",
            role=UserRole.SUPER_ADMIN,
        )
        session.add(super_admin)
        await session.flush()

        employees: list[Employee] = []
        users: list[User] = []

        for index, (first_name, last_name, job_title, department) in enumerate(TEAM, start=1):
            email = make_email(first_name, last_name)
            role = UserRole.COMPANY_ADMIN if job_title == "HR Manager" else UserRole.EMPLOYEE

            user = User(
                email=email,
                hashed_password=get_password_hash(DEFAULT_PASSWORD),
                full_name=f"{first_name} {last_name}",
                role=role,
                company_id=company.id,
            )
            users.append(user)
            session.add(user)
            await session.flush()

            employee = Employee(
                user_id=user.id,
                company_id=company.id,
                employee_code=f"EMP-{index:03d}",
                first_name=first_name,
                last_name=last_name,
                email=email,
                department=department,
                job_title=job_title,
                hire_date=date(2022, 1, 1 + (index % 28)),
                avatar_initials=initials(first_name, last_name),
                nationality="Saudi Arabia",
                address="Riyadh, Saudi Arabia",
                work_type="On-site",
                shift="Day",
            )
            employees.append(employee)
            session.add(employee)

        await session.flush()

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

        await session.commit()
        print("Seed data created successfully.")
        print(f"Default password for all accounts: {DEFAULT_PASSWORD}")
        print("Demo logins:")
        print("  Super Admin: admin@dolftech.com")
        print("  HR Manager:  b.alobaidan@dolftech.com")
        print("  Developer:   m.furqan@dolftech.com")


if __name__ == "__main__":
    asyncio.run(seed())
