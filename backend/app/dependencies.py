from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .database import AsyncSessionLocal
from .security import decode_access_token, hash_password, verify_password
from .models import User, UserRole
from jwt.exceptions import InvalidTokenError
import boto3
from typing import Any, Generator, TYPE_CHECKING
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

    


