from app.schemas import FarmRead, FarmUpdate, FarmCreate
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Farm, User, UserRole, Permission
from app.dependencies import data_query_for, get_db, permission_endpoint
from app.schemas.Envelope import DataQuery, DataEnvelope

router = APIRouter(
    prefix="/farms",
    tags=["farms"]
)

@router.get("", response_model=DataEnvelope[FarmRead], **permission_endpoint(Permission.FARM_READ))
async def get_farms(db_session: AsyncSession = Depends(get_db),
                          searchQueries: DataQuery = Depends(data_query_for(Farm, FarmRead))) -> list[Farm]:
    stmt = select(Farm).where(searchQueries.filterQuery).order_by(*searchQueries.sortQueries)

    count_stmt = select(func.count()).select_from(
        stmt.order_by(None).subquery()
    )

    total_count = await db_session.scalar(count_stmt) or 0

    result = await db_session.execute(
        stmt
        .offset(searchQueries.page_size * searchQueries.page)
        .limit(searchQueries.page_size)
                                     )    
    items = list(result.scalars().all())

    return DataEnvelope[FarmRead](
        total=total_count,
        data=items # type: ignore
    )

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT, **permission_endpoint(Permission.FARM_DELETE))
async def delete_farm(farm_id: int,
                      db_session: AsyncSession = Depends(get_db)):
    await db_session.execute(delete(Farm).where(Farm.id == farm_id))
    await db_session.commit()

@router.post("", response_model=FarmRead, **permission_endpoint(Permission.FARM_CREATE))
async def create_farm(payload: FarmCreate,
                      db_session: AsyncSession = Depends(get_db)):
    new_farm = Farm(**payload.model_dump())

    db_session.add(new_farm)

    await db_session.commit()
    await db_session.refresh(new_farm)

    return new_farm

@router.put("/{farm_id}", response_model=FarmRead, **permission_endpoint(Permission.FARM_UPDATE))
async def update_farm(
    farm_id: int,
    payload: FarmUpdate,
    db_session: AsyncSession = Depends(get_db)
):
    result = await db_session.execute(select(Farm).where(Farm.id == farm_id))

    current_farm = result.scalar_one_or_none()

    if current_farm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm with provided id doesn't exist"
        )

    for field, value in payload.model_dump().items():
        setattr(current_farm, field, value)

    await db_session.commit()
    await db_session.refresh(current_farm)

    return current_farm