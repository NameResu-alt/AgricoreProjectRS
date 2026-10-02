from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.dependencies import get_db, require_role, get_current_user
from app.models import Equipment, User, UserRole
from app.schemas import EquipmentRead, EquipmentUpdate, EquipmentCreate

router = APIRouter(
    prefix="/equipment",
    tags=["equipment"]
)

@router.get("", response_model=list[EquipmentRead])
async def get_equipment(db_session: AsyncSession = Depends(get_db),
                        _:User = Depends(get_current_user)):
    stmt = select(Equipment)
    
    result = await db_session.execute(stmt)
    
    return list(result.scalars().all())

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(equipment_id: int, db_session: AsyncSession = Depends(get_db),
                           _:User = Depends(require_role(UserRole.ADMIN))):
    stmt = delete(Equipment).where(Equipment.id == equipment_id)
    await db_session.execute(stmt)
    await db_session.commit()

@router.post("", response_model=EquipmentRead)
async def create_equipment(payload: EquipmentCreate,
                           db_session: AsyncSession = Depends(get_db),
                           _:User = Depends(require_role(UserRole.ADMIN))):
    new_equipment = Equipment(**payload.model_dump())
    db_session.add(new_equipment)
    await db_session.commit()
    await db_session.refresh(new_equipment)

    return new_equipment

@router.put("/{equipment_id}", response_model=EquipmentRead)
async def update_equipment(equipment_id: int, payload: EquipmentUpdate,
                           db_session: AsyncSession = Depends(get_db),
                           _:User = Depends(require_role(UserRole.ADMIN))):
    current_equipment = await db_session.get(Equipment, equipment_id)

    if current_equipment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment with provided id doesn't exist"
        )

    for field, value in payload.model_dump().items():
        setattr(current_equipment, field, value)

    await db_session.commit()
    await db_session.refresh(current_equipment)

    return current_equipment