from io import BytesIO

from fastapi import Depends, APIRouter, File, Form, HTTPException, status, UploadFile

from fastapi.responses import StreamingResponse
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import data_query_for, get_db, get_s3, permission_endpoint
from app.models import ServiceReport, User, UserRole, Permission
from app.schemas import ServiceReportRead, ServiceReportUpdate, ServiceReportCreate
from uuid import uuid4

from app.config import settings
from app.schemas import DataQuery, DataEnvelope

router = APIRouter(
    prefix="/service_reports",
    tags=["service_reports"]
)

@router.get("",response_model=DataEnvelope[ServiceReportRead], **permission_endpoint(Permission.SERVICE_REPORT_READ))
async def get_service_reports(db_session: AsyncSession = Depends(get_db),
                              searchQueries: DataQuery = Depends(data_query_for(ServiceReport, ServiceReportRead))):
    stmt = select(ServiceReport).where(searchQueries.filterQuery).order_by(*searchQueries.sortQueries)

    count_stmt = select(func.count()).select_from(
        stmt.order_by(None).subquery()
    )

    result = await db_session.execute(
        stmt
        .offset(searchQueries.page_size * searchQueries.page)
        .limit(searchQueries.page_size)
    )

    total_count = await db_session.scalar(count_stmt) or 0
    items = list(result.scalars().all())
    
    return DataEnvelope[ServiceReportRead](
        total=total_count,
        data=items # type: ignore
    )

@router.delete("/{service_report_id}", status_code=status.HTTP_204_NO_CONTENT, **permission_endpoint(Permission.SERVICE_REPORT_DELETE))
async def delete_service_report(service_report_id: int,
                                db_session: AsyncSession = Depends(get_db)):
    await db_session.execute(delete(ServiceReport).where(ServiceReport.id == service_report_id))
    await db_session.commit()

@router.post("", response_model=ServiceReportRead, **permission_endpoint(Permission.SERVICE_REPORT_CREATE, Permission.FIELD_JOB_ASSIGN_SERVICE_REPORT))
async def create_service_report(
                                payload: str = Form(...),
                                diagnostic_report: UploadFile = File(...),
                                s3_client = Depends(get_s3),
                                db_session: AsyncSession = Depends(get_db)):

    report_data = ServiceReportCreate.model_validate_json(payload)
    report_data.file_url = report_data.file_url.removeprefix("/").removesuffix("/")
    new_service_report = ServiceReport(**report_data.model_dump())

    print("Got to this point")
    file_location = f"{report_data.file_url}/{report_data.field_job_id}/{uuid4()}-{diagnostic_report.filename}"
    new_service_report.file_url = f"s3://rs-agricore-uploads/{file_location}"    

    s3_client.upload_fileobj(
        Fileobj=diagnostic_report.file,
        Bucket=settings.s3_bucket_name,
        Key=file_location
    )

    print("Got as far as adding the new service report")
    db_session.add(new_service_report)
    await db_session.commit()
    await db_session.refresh(new_service_report)

    return new_service_report

@router.get("/{service_report_id}/download", **permission_endpoint(Permission.SERVICE_REPORT_READ))
async def download_service_report_file(
    service_report_id:int,
    s3_client = Depends(get_s3),
    db_session: AsyncSession = Depends(get_db)
):
    service_report = await db_session.get(ServiceReport, service_report_id)

    if service_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No service report with provided id was found"
        )

    prefix = f"s3://{settings.s3_bucket_name}/"

    if not service_report.file_url.startswith(prefix):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The service report doesn't contain a valid s3 link"
        )

    s3_file_key = service_report.file_url.removeprefix(prefix).lstrip("/")

    print(f"S3 Key: {s3_file_key}")
    file_buffer = BytesIO()

    try:
        print(f"Before Download Attempt - Bucket_Name: {settings.s3_bucket_name}, KEY: {s3_file_key}")
        s3_client.download_fileobj(settings.s3_bucket_name, s3_file_key, file_buffer)
        print("PleaseCheck")
    except s3_client.exceptions.NoSuchKey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The file was not found in S3",
        )

    print("After download attempt")

    file_buffer.seek(0)

    filename = s3_file_key.split("/")[-1]

    print(f"File Name: {filename}")

    return StreamingResponse(
        file_buffer,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
    

@router.put("/{service_report_id}", response_model=ServiceReportRead, **permission_endpoint(Permission.SERVICE_REPORT_UPDATE))
async def update_service_report(service_report_id: int,
                                payload: ServiceReportUpdate,
                                db_session: AsyncSession = Depends(get_db)):
    result = await db_session.execute(select(ServiceReport).where(ServiceReport.id == service_report_id))

    current_service_report = result.scalar_one_or_none()

    if current_service_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Service Report with provided id was found"
        )

    for field, value in payload.model_dump().items():
        setattr(current_service_report, field, value)

    await db_session.commit()
    await db_session.refresh(current_service_report)

    return current_service_report
