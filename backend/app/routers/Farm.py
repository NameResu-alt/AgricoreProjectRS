from app.schemas import FarmRead, FarmUpdate, FarmCreate
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Farm, User, UserRole
from app.dependencies import get_db, get_current_user, require_role

router = APIRouter(
    prefix="/farms",
    tags=["farms"]
)

@router.get("", response_model=list[FarmRead])
async def get_farms(db_session: AsyncSession = Depends(get_db),
                    _: User = Depends(get_current_user)) -> list[Farm]:
    stmt = select(Farm)
    
    result = await db_session.execute(stmt)
    return list(result.scalars().all())

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm(farm_id: int,
                      db_session: AsyncSession = Depends(get_db),
                      _: User = Depends(require_role(UserRole.ADMIN))):
    await db_session.execute(delete(Farm).where(Farm.id == farm_id))
    await db_session.commit()

@router.post("", response_model=FarmRead)
async def create_farm(payload: FarmCreate,
                      db_session: AsyncSession = Depends(get_db),
                      _:User = Depends(require_role(UserRole.ADMIN))):
    new_farm = Farm(**payload.model_dump())

    db_session.add(new_farm)

    await db_session.commit()
    await db_session.refresh(new_farm)

    return new_farm

@router.put("/{farm_id}", response_model=FarmRead)
async def update_farm(
    farm_id: int,
    payload: FarmUpdate,
    db_session: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN))
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