"""initial_schema

Revision ID: f9d607e50fd9
Revises:
Create Date: 2026-07-05 08:45:44.953201

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f9d607e50fd9"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

userrole = sa.Enum("super_admin", "company_admin", "employee", name="userrole")
attendancestatus = sa.Enum(
    "present", "late", "absent", "on_leave", "half_day", name="attendancestatus"
)
requesttype = sa.Enum("document", "shift", "work_type", name="requesttype")
requeststatus = sa.Enum("pending", "approved", "rejected", name="requeststatus")


def upgrade() -> None:
    bind = op.get_bind()
    userrole.create(bind, checkfirst=True)
    attendancestatus.create(bind, checkfirst=True)
    requesttype.create(bind, checkfirst=True)
    requeststatus.create(bind, checkfirst=True)

    op.create_table(
        "companies",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("location", sa.String(), nullable=False, server_default="Saudi Arabia"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_companies_name", "companies", ["name"], unique=False)
    op.create_index("ix_companies_slug", "companies", ["slug"], unique=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column(
            "role",
            userrole,
            nullable=False,
            server_default="employee",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("company_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "employees",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("company_id", sa.Uuid(), nullable=False),
        sa.Column("employee_code", sa.String(), nullable=False),
        sa.Column("first_name", sa.String(), nullable=False),
        sa.Column("last_name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("department", sa.String(), nullable=True),
        sa.Column("job_title", sa.String(), nullable=True),
        sa.Column("hire_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("avatar_initials", sa.String(), nullable=True),
        sa.Column("nationality", sa.String(), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("manager_name", sa.String(), nullable=True),
        sa.Column("work_type", sa.String(), nullable=True),
        sa.Column("shift", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_employees_company_id", "employees", ["company_id"], unique=False)
    op.create_index("ix_employees_employee_code", "employees", ["employee_code"], unique=False)

    op.create_table(
        "employee_contracts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("employee_id", sa.Uuid(), nullable=False),
        sa.Column("contract_type", sa.String(), nullable=False, server_default="full_time"),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("salary", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(), nullable=False, server_default="SAR"),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("employee_id"),
    )

    op.create_table(
        "attendance_records",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("company_id", sa.Uuid(), nullable=False),
        sa.Column("employee_id", sa.Uuid(), nullable=False),
        sa.Column("work_date", sa.Date(), nullable=False),
        sa.Column("check_in", sa.DateTime(), nullable=True),
        sa.Column("check_out", sa.DateTime(), nullable=True),
        sa.Column("scheduled_start", sa.Time(), nullable=False, server_default=sa.text("'08:00:00'")),
        sa.Column("scheduled_end", sa.Time(), nullable=False, server_default=sa.text("'17:30:00'")),
        sa.Column("hours_worked", sa.Float(), nullable=True),
        sa.Column(
            "status",
            attendancestatus,
            nullable=False,
            server_default="present",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("employee_id", "work_date", name="uq_attendance_employee_date"),
    )
    op.create_index("ix_attendance_records_company_id", "attendance_records", ["company_id"], unique=False)
    op.create_index("ix_attendance_records_employee_id", "attendance_records", ["employee_id"], unique=False)
    op.create_index("ix_attendance_records_work_date", "attendance_records", ["work_date"], unique=False)

    op.create_table(
        "requests",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("company_id", sa.Uuid(), nullable=False),
        sa.Column("employee_id", sa.Uuid(), nullable=False),
        sa.Column("request_type", requesttype, nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "status",
            requeststatus,
            nullable=False,
            server_default="pending",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("reviewed_by_id", sa.Uuid(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_requests_company_id", "requests", ["company_id"], unique=False)
    op.create_index("ix_requests_employee_id", "requests", ["employee_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_requests_employee_id", table_name="requests")
    op.drop_index("ix_requests_company_id", table_name="requests")
    op.drop_table("requests")

    op.drop_index("ix_attendance_records_work_date", table_name="attendance_records")
    op.drop_index("ix_attendance_records_employee_id", table_name="attendance_records")
    op.drop_index("ix_attendance_records_company_id", table_name="attendance_records")
    op.drop_table("attendance_records")

    op.drop_table("employee_contracts")

    op.drop_index("ix_employees_employee_code", table_name="employees")
    op.drop_index("ix_employees_company_id", table_name="employees")
    op.drop_table("employees")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    op.drop_index("ix_companies_slug", table_name="companies")
    op.drop_index("ix_companies_name", table_name="companies")
    op.drop_table("companies")

    bind = op.get_bind()
    requeststatus.drop(bind, checkfirst=True)
    requesttype.drop(bind, checkfirst=True)
    attendancestatus.drop(bind, checkfirst=True)
    userrole.drop(bind, checkfirst=True)
