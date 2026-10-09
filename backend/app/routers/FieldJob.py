from fastapi import APIRouter, Depends, UploadFile, status, HTTPException

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import FieldJob, User, UserRole
from app.schemas import FieldJobRead, FieldJobUpdate, FieldJobCreate, FieldJobPatchStatus
from app.dependencies import get_db, get_current_user, require_role

router = APIRouter(
    prefix="/field_jobs",
    tags=["field_jobs"]
)

@router.get("", response_model=list[FieldJobRead])
async def get_field_jobs(db_session: AsyncSession = Depends(get_db),
                         _:User = Depends(get_current_user)):
    result = await db_session.execute(select(FieldJob))
    
    return list(result.scalars().all())

@router.delete("/{field_job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field_job(field_job_id: int,
                           db_session: AsyncSession = Depends(get_db),
                           _:User = Depends(require_role(UserRole.ADMIN))):
    await db_session.execute(delete(FieldJob).where(FieldJob.id == field_job_id))
    await db_session.commit()

@router.post("", response_model=FieldJobRead)
async def create_field_job(payload: FieldJobCreate,
                           db_session: AsyncSession = Depends(get_db),
                           _:User = Depends(require_role(UserRole.ADMIN))):
    new_field_job = FieldJob(**payload.model_dump())

    db_session.add(new_field_job)

    await db_session.commit()
    await db_session.refresh(new_field_job)

    return new_field_job

@router.put("/{field_job_id}", response_model=FieldJobRead)
async def update_field_job(field_job_id: int,
                           payload: FieldJobUpdate,
                           db_session: AsyncSession = Depends(get_db),
                           _:User = Depends(require_role(UserRole.ADMIN))):
    result = await db_session.execute(select(FieldJob).where(FieldJob.id == field_job_id))

    current_field_job = result.scalar_one_or_none()

    if current_field_job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Field Job with provided id was found"
        )

    for field, value in payload.model_dump().items():
        setattr(current_field_job, field, value)

    await db_session.commit()
    await db_session.refresh(current_field_job)

    return current_field_job

@router.patch("/{field_job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def patch_field_job_status(
                                field_job_id: int,
                                payload: FieldJobPatchStatus,
                                 db_session: AsyncSession = Depends(get_db),
                                 _:User = Depends(require_role(UserRole.FIELD_HAND, UserRole.ADMIN))):
    result = await db_session.execute(select(FieldJob).where(FieldJob.id == field_job_id))

    current_field_job = result.scalar_one_or_none()

    if current_field_job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Field Job with provided id was found"
        )

    current_field_job.status  = payload.status

    await db_session.commit()
    await db_session.refresh(current_field_job)

    return current_field_job

@router.post("/test_file", status_code=200)
async def test_file_works(diagnostic_report: UploadFile):
    contents = await diagnostic_report.read()
    text = contents.decode("utf-8")

    print(text)

    return {"contents": text}