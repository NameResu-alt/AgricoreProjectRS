from fastapi import APIRouter, status,Depends,HTTPException;
from app.dependencies import get_db, require_role, get_s3, check_db_state
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import UserRole, User
from app.schemas import HealthDetailReport
from typing import TYPE_CHECKING
from app.config import settings

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

router = APIRouter(
    prefix="/health",
    tags=["/health"]
)

@router.get("", status_code=status.HTTP_200_OK)
async def basic_health():
    return {"status":"OK"}

@router.get("/ready", status_code=200)
async def db_health_check(dbSession: AsyncSession = Depends(get_db)):
    try:
        await dbSession.execute(select(1))
    except:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="database is down"
        )

@router.get("/details", response_model=HealthDetailReport)
async def comprehensive_health_check(
    _ = Depends(check_db_state),
    dbSession: AsyncSession = Depends(get_db),
    s3_client: S3Client = Depends(get_s3),
    _1: User = Depends(require_role(UserRole.ADMIN))
    ):
    
    s3_healthy = True

    """
    This is redundant. If the db is down, I can't authenticate at all.
    That means, that require_role is going to boot the user out with a 401_UNAUTHORIZED regardless
    db_healthy = True
    try:
        await dbSession.execute(select(1))
    except Exception as e:
        print(f"An error occurred for db: {e}")
    """
    try:
        s3_client.head_bucket(Bucket=settings.s3_bucket_name)
    except Exception as e:
        s3_healthy = False

    return HealthDetailReport(s3_healthy=s3_healthy)