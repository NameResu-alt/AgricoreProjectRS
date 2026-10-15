from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, delete, func

from app.dependencies import get_current_user, get_db, data_query_for, permission_endpoint
from app.security import hash_password, verify_password, create_access_token, create_refresh_token, hash_refresh_token
from app.models import User, UserRole, RefreshToken, Permission, Role, RolePermission
from app.schemas import Token, UserCreate, UserRead, RefreshTokenRequest, InvalidateRefreshTokenRequest
from app.schemas import DataQuery
from app.schemas import DataEnvelope

from datetime import datetime


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

async def create_user_token(user: User, db_session: AsyncSession) -> Token:
    if user.role is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User has no active role"
        )

    if user.role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )
    
    data = {"sub": user.username, "role": user.role.name, "permissions": [perm.permission.value for perm in user.role.permissions]}

    access_token = create_access_token(data)

    (token_obj, token_str) = create_refresh_token(user,)

    db_session.add(token_obj)
    await db_session.commit()


    return Token(access_token=access_token, refresh_token=token_str)

#require_role(UserRole.ADMIN)
@router.get("", response_model=DataEnvelope[UserRead], **permission_endpoint(Permission.USER_READ))
async def get_users(db_session: AsyncSession = Depends(get_db),
                    searchQueries: DataQuery = Depends(data_query_for(User, UserRead))):
    stmt = select(User).where(searchQueries.filterQuery).order_by(*searchQueries.sortQueries)
    count_stmt = select(func.count()).select_from(
        stmt.order_by(None).subquery()
    )

    total_count = await db_session.scalar(count_stmt) or 0
    result = await db_session.execute(stmt
                                      .offset(searchQueries.page_size*searchQueries.page)
                                      .limit(searchQueries.page_size).options(selectinload(User.role)))

    items = list(result.scalars().all())
    
    return DataEnvelope[UserRead](
        total=total_count,
        data= items # type: ignore
    )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, **permission_endpoint(Permission.USER_DELETE))
async def delete_user(user_id: int, db_session: AsyncSession = Depends(get_db)):
    stmt = delete(User).where(User.id == user_id)
    await db_session.execute(stmt)
    await db_session.commit()

#I need to return two tokens here. The refresh Token, and the access Token
@router.post("/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db_session: AsyncSession = Depends(get_db)):
    result = await db_session.execute(select(User).where(User.username == form.username).options(selectinload(User.role).selectinload(Role.permissions)))

    user: User | None = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided username doesn't exist"
        )

    if not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )

    return await create_user_token(user, db_session)

@router.post("/register", status_code=status.HTTP_201_CREATED, **permission_endpoint(Permission.USER_CREATE))
async def register(payload: UserCreate, 
                   db_session: AsyncSession = Depends(get_db)):
    new_user = User(username = payload.username, hashed_password = hash_password(payload.password), role = payload.role)
    db_session.add(new_user)
    await db_session.commit()


@router.post("/invalidate", status_code=status.HTTP_204_NO_CONTENT)
async def invalidate(request: InvalidateRefreshTokenRequest, 
                     db_session: AsyncSession = Depends(get_db)):
    hash_token = hash_refresh_token(request.refresh_token)
    
    result = await db_session.execute(select(RefreshToken).where(RefreshToken.hashed_token == hash_token))
    record = result.scalar_one_or_none()

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided Refresh token has no matching record"
        )

    if not record.valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided Refresh token has already been invalidated"
        )

    record.valid = False

    await db_session.commit()

@router.post("/refresh", response_model=Token)
async def refresh(request: RefreshTokenRequest, db_session: AsyncSession = Depends(get_db)):
    hash_token = hash_refresh_token(request.refresh_token)

    result = await db_session.execute(select(RefreshToken).where(RefreshToken.hashed_token == hash_token))
    record = result.scalar_one_or_none()

    if record is None:
        print("There is no matching record")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided Refresh token has no matching record"
        )

    if not record.valid:
        print("The refresh token is alraedy invalidated")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided Refresh token has already been invalidated"
        )

    record.valid = False
    await db_session.commit()

    if datetime.now() > record.expire_time:
        print("The refresh token is expired")
        record.valid = False
        await db_session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided Refresh token is expired"
        )

    user_result = await db_session.execute(select(User).where(User.id == record.user_id))

    user = user_result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User of refresh token doesn't exist"
        )

    
    return await create_user_token(user, db_session)
