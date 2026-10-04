from fastapi import Depends, APIRouter, HTTPException, status

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models import ServiceReport, User, UserRole
from app.schemas import ServiceReportRead, ServiceReportUpdate, ServiceReportCreate

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
async def create_service_report(payload: ServiceReportCreate,
                                db_session: AsyncSession = Depends(get_db),
                                _:User = Depends(require_role(UserRole.ADMIN, UserRole.FIELD_HAND))):
    new_service_report = ServiceReport(**payload.model_dump())

    db_session.add(new_service_report)
    await db_session.commit()
    await db_session.refresh(new_service_report)

    return new_service_report

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
