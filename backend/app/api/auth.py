from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas import LoginRequest, Token, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(
    session: Annotated[AsyncSession, Depends(get_session)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    result = await session.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    token = create_access_token(str(user.id), {"role": user.role.value})
    return Token(access_token=token)


@router.post("/login/json", response_model=Token)
async def login_json(
    payload: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Token:
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    token = create_access_token(str(user.id), {"role": user.role.value})
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
async def read_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user
