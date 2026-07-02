from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.security import decode_access_token
from app.models.employee import Employee
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except ValueError as exc:
        raise credentials_exception from exc

    result = await session.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_roles(*roles: UserRole):
    async def role_checker(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return role_checker


async def get_user_employee(session: AsyncSession, user: User) -> Employee | None:
    if user.role != UserRole.EMPLOYEE:
        return None
    result = await session.execute(
        select(Employee).where(Employee.user_id == user.id).options(selectinload(Employee.contract))
    )
    return result.scalar_one_or_none()


def assert_company_access(user: User, company_id: UUID) -> None:
    if user.role == UserRole.SUPER_ADMIN:
        return
    if user.company_id != company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-tenant access denied")
