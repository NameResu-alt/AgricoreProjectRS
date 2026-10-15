from fastapi import APIRouter, Depends, UploadFile, status, HTTPException

from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import FieldJob, User, UserRole, Permission
from app.schemas import FieldJobRead, FieldJobUpdate, FieldJobCreate, FieldJobPatchStatus
from app.dependencies import data_query_for, get_db, permission_endpoint
from app.schemas import DataQuery, DataEnvelope

router = APIRouter(
    prefix="/field_jobs",
    tags=["field_jobs"]
)

@router.get("", response_model=DataEnvelope[FieldJobRead], **permission_endpoint(Permission.FIELD_JOB_READ))
async def get_field_jobs(db_session: AsyncSession = Depends(get_db),
                          searchQueries: DataQuery = Depends(data_query_for(FieldJob, FieldJobRead))):

    stmt = select(FieldJob).where(searchQueries.filterQuery).order_by(*searchQueries.sortQueries)

    count_stmt = select(func.count()).select_from(
            stmt.order_by(None).subquery()
        )

    total_count = await db_session.scalar(count_stmt) or 0

    result = await db_session.execute(
        stmt
        .offset(searchQueries.page_size * searchQueries.page)
        .limit(searchQueries.page_size)
    )

    items = result.scalars().all()

    return DataEnvelope[FieldJobRead](
        total=total_count,
        data=list(items) # type: ignore
    )

@router.delete("/{field_job_id}", status_code=status.HTTP_204_NO_CONTENT, **permission_endpoint(Permission.FIELD_JOB_DELETE))
async def delete_field_job(field_job_id: int,
                           db_session: AsyncSession = Depends(get_db)):
    await db_session.execute(delete(FieldJob).where(FieldJob.id == field_job_id))
    await db_session.commit()

@router.post("", response_model=FieldJobRead, **permission_endpoint(Permission.FIELD_JOB_CREATE))
async def create_field_job(payload: FieldJobCreate,
                           db_session: AsyncSession = Depends(get_db)):
    new_field_job = FieldJob(**payload.model_dump())

    db_session.add(new_field_job)

    await db_session.commit()
    await db_session.refresh(new_field_job)

    return new_field_job

@router.put("/{field_job_id}", response_model=FieldJobRead, **permission_endpoint(Permission.FIELD_JOB_UPDATE))
async def update_field_job(field_job_id: int,
                           payload: FieldJobUpdate,
                           db_session: AsyncSession = Depends(get_db)):
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

@router.patch("/{field_job_id}", status_code=status.HTTP_204_NO_CONTENT, **permission_endpoint(Permission.FIELD_JOB_CHANGE_STATUS))
async def patch_field_job_status(
                                field_job_id: int,
                                payload: FieldJobPatchStatus,
                                 db_session: AsyncSession = Depends(get_db)):
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