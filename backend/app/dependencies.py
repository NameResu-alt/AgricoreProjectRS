from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas import DataQuery
from app.models import Base
from .database import AsyncSessionLocal
from .security import decode_access_token, hash_password, verify_password
from .models import User, UserRole
from jwt.exceptions import InvalidTokenError
import boto3
from typing import Annotated, Any, Generator, TYPE_CHECKING, Literal
from mypy_boto3_s3 import S3Client

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

s3_client = boto3.client("s3")

def get_s3() -> Generator[S3Client, Any,None]:
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

        access_token = decode_access_token(token)
        username = access_token.get("sub")

        result = await db_session.execute(select(User).where(User.username == username))

        user: User | None = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find corresponding user"
            )
    except:
        #InvalidTokenError as ex
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to decode access_token JWT"
        )

    return user
    
def require_role(*role_list: UserRole):
    async def check_role(user: User = Depends(get_current_user)) -> User:
        if user.role not in role_list:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Current user doesn't have access to this resource"
            )
        return user

    return check_role

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


