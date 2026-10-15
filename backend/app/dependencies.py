from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.schemas import DataQuery
from app.models import Base, Role
from .database import AsyncSessionLocal
from .security import decode_token, hash_password, verify_password
from .models import User, UserRole, Permission
from jwt.exceptions import InvalidTokenError
import boto3
from typing import Annotated, Any, Generator, TYPE_CHECKING, Literal
from mypy_boto3_s3 import S3Client
from jwt.exceptions import ExpiredSignatureError

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

s3_client = boto3.client("s3")

def get_s3() -> S3Client:
    return s3_client


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def check_db_state(db_session: AsyncSession = Depends(get_db)):
    try:
        await db_session.execute(select(1))
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is down, cannot authenticate user"
        )

async def get_current_user(token: str = Depends(oauth2_scheme), db_session: AsyncSession = Depends(get_db)) -> User:
    try:

        access_token = decode_token(token)
        username = access_token.get("sub")

        result = await db_session.execute(select(User).where(User.username == username).options(selectinload(User.role).selectinload(Role.permissions)))

        user: User | None = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find corresponding user"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is no longer active"
            )
        
    except:
        #InvalidTokenError as ex
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to decode access_token JWT"
        )

    return user

from collections.abc import Callable
from fastapi import Depends
from typing import Any

def permission_endpoint(*permissions: Permission) -> dict[str, Any]:
    return {
        "dependencies": [Depends(require_permission(*permissions))],
        "openapi_extra": {
            "x-required-permissions": [p.value for p in permissions],
        },
    }

def require_permission(*permission_list: Permission):
    async def check_permission(user: User = Depends(get_current_user), require_all: bool = False) -> User:
        if user.role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Current user does not have an active role"
            )
        
        user_permissions = {perm.permission for perm in user.role.permissions}

        
        unmatched_permissions = set(permission_list) - user_permissions

        if not unmatched_permissions:
            return user

        if not require_all and len(unmatched_permissions) < len(permission_list):
            return user

        found_a_match = False

        for missing_permission in unmatched_permissions:
            wildcard_value = f"{missing_permission.value.split(':', 1)[0]}:*"
            wildcard = Permission._value2member_map_.get(wildcard_value)

            if wildcard is None or wildcard not in user_permissions:
                if require_all:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="User does not have permission to access this resource"
                    )
            else:
                found_a_match = True

        if not found_a_match:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have permission to access this resource"
            )

        return user
    return check_permission

"""
def require_role(*role_list: UserRole):
    async def check_role(user: User = Depends(get_current_user)) -> User:
        if user.role not in role_list:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Current user doesn't have access to this resource"
            )
        return user

    return check_role
"""

def data_query_for(model: type[Base], schema: type[BaseModel]):
    def dependency(
        page: Annotated[int, Query(ge=0)] = 0,
        page_size: Annotated[int, Query(gt=0)] = 5,
        sort: Annotated[list[str] | None, Query()] = None,
        filter: Annotated[list[str] | None, Query()] = None,
        filter_mode: Annotated[
            Literal["and", "or"], Query()
        ] = "and",
    ) -> DataQuery:
        return DataQuery(
            model=model,
            schema=schema,
            page=page,
            page_size=page_size,
            sort=sort,
            filter=filter,
            filter_mode=filter_mode,
        )

    return dependency


