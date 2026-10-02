from fastapi import Depends, APIRouter, Query

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.dependencies import get_current_user
from app.models import User

from app.models import (
    Equipment,
    EquipmentStatus,
    FieldJob,
    FieldHand,
    FieldJobStatus,
    Farm,
)
from app.schemas import (
    EquipmentRead,
    FieldJobRead,
    EquipmentMetric,
    FarmMaintenaceRatio,
)
from app.dependencies import get_db

router = APIRouter(prefix="/business", tags=["business"])


@router.get("/low_fuel_alert", response_model=list[EquipmentRead])
async def get_low_fuel_alert(
    fuel_level: int = Query(default=20, ge=0),
    _: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db),
):
    """
    **Low Fuel Alert:** *Which active equipment units are operating below a 20% fuel level across all farms?*
    """
    stmt = select(Equipment).where(
        Equipment.status == EquipmentStatus.IN_USE, Equipment.fuel_level < fuel_level
    )

    result = await db_session.execute(stmt)

    return list(result.scalars().all())


@router.get("/colocation_discrepancies", response_model=list[FieldJobRead])
async def get_colocation_discrepancies(db_session: AsyncSession = Depends(get_db),
                                       _: User = Depends(get_current_user)):
    stmt = (
        select(FieldJob)
        .join(Equipment)
        .join(FieldHand)
        .where(Equipment.facility_id != FieldHand.facility_id)
    )

    result = await db_session.execute(stmt)

    return list(result.scalars().all())


@router.get("/reliability_metrics", response_model=dict[str, EquipmentMetric])
async def get_reliability_metrics(db_session: AsyncSession = Depends(get_db),
                                  _: User = Depends(get_current_user)):
    stmt = (
        select(
            Equipment.model,
            func.count()
            .filter(FieldJob.status == FieldJobStatus.COMPLETED)
            .label("completed"),
            func.count()
            .filter(FieldJob.status == FieldJobStatus.FAILED)
            .label("failed"),
        )
        .select_from(Equipment)
        .outerjoin(FieldJob)
        .group_by(Equipment.model)
        .order_by(Equipment.model)
    )

    result = await db_session.execute(stmt)

    outcome: dict[str, EquipmentMetric] = dict()

    for model, completed, failed in result.all():
        outcome[model] = EquipmentMetric(completion=completed, failure=failed)

    return outcome


@router.get("/maintenance_flags", response_model=dict[int,FarmMaintenaceRatio])
async def get_maintenance_flags(
    ratio: int = Query(default=30, ge=0), db_session: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)
):
    stmt = (
        select(
            Farm.id,
            Farm.name.label("farm_name"),
            func.count()
            .filter(Equipment.status == EquipmentStatus.MAINTENANCE)
            .label("maintenance_count"),
            func.count().label("total"),
        )
        .select_from(Farm)
        .join(Equipment)
        .group_by(Farm.id)
        .having(
            (func.count().filter(Equipment.status == EquipmentStatus.MAINTENANCE)
            / func.nullif(func.count(), 0)) * 100
            >= ratio
        )
    )
    
    result = await db_session.execute(stmt)
    
    """
    outcome_dict: dict[int, FarmMaintenaceRatio] = {
        id: FarmMaintenaceRatio(maintenance_count=maintenance_count, total=total)
        for id, maintenance_count, total in result
    }
    """
    outcome_dict: dict[int, FarmMaintenaceRatio] = {
        row.id: FarmMaintenaceRatio.model_validate(row)
        for row in result.mappings()
    }
    
    return outcome_dict
    
@router.get("/reporting_lines", response_model=int)
async def get_reporting_lines(supervisor_id: int, db_session: AsyncSession = Depends(get_db),
                              _: User = Depends(get_current_user)) -> int:
    #active field jobs.
    #farm(supervisor_id) -> Equipment -> Field Job <- Field Hand
    stmt = select(func.count(FieldJob.id.distinct())).select_from(Farm).join(Equipment).join(FieldJob).join(FieldHand).where(FieldJob.status == FieldJobStatus.IN_PROGRESS, Farm.supervisor_id == supervisor_id).distinct()
    
    result = await db_session.execute(stmt)
    
    return result.scalar_one_or_none()