from io import BytesIO

from fastapi import Depends, APIRouter, File, Form, HTTPException, status, UploadFile

from fastapi.responses import StreamingResponse
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role, get_s3
from app.models import ServiceReport, User, UserRole
from app.schemas import ServiceReportRead, ServiceReportUpdate, ServiceReportCreate
from uuid import uuid4

from app.config import settings

router = APIRouter(
    prefix="/service_reports",
    tags=["service_reports"]
)

@router.get("",response_model=list[ServiceReportRead])
async def get_service_reports(db_session: AsyncSession = Depends(get_db),
                              _:User = Depends(get_current_user)):
    result = await db_session.execute(select(ServiceReport))
    
    return list(result.scalars().all())

@router.delete("/{service_report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_report(service_report_id: int,
                                db_session: AsyncSession = Depends(get_db),
                                _:User = Depends(require_role(UserRole.ADMIN))):
    await db_session.execute(delete(ServiceReport).where(ServiceReport.id == service_report_id))
    await db_session.commit()

@router.post("", response_model=ServiceReportRead)
async def create_service_report(
                                payload: str = Form(...),
                                diagnostic_report: UploadFile = File(...),
                                s3_client = Depends(get_s3),
                                db_session: AsyncSession = Depends(get_db),
                                _:User = Depends(require_role(UserRole.ADMIN, UserRole.FIELD_HAND))):

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

@router.get("/{service_report_id}/download")
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
    

@router.put("/{service_report_id}", response_model=ServiceReportRead)
async def update_service_report(service_report_id: int,
                                payload: ServiceReportUpdate,
                                db_session: AsyncSession = Depends(get_db),
                                _:User = Depends(require_role(UserRole.ADMIN))):
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
