from fastapi import APIRouter, Depends, status, HTTPException

from app.dependencies import get_db, get_current_user, require_role
from app.models import FieldHand, User, UserRole
from app.schemas import FieldHandRead, FieldHandUpdate, FieldHandCreate

from sqlalchemy.ext.asyncio  import AsyncSession
from sqlalchemy import select, delete


router = APIRouter(
    prefix="/field_hands",
    tags=["field_hands"]
)

@router.get("",response_model=list[FieldHandRead])
async def get_field_hands(db_session: AsyncSession = Depends(get_db),
                          _:User = Depends(get_current_user)):
    stmt = select(FieldHand)
    
    result = await db_session.execute(stmt)
    
    return list(result.scalars().all())

@router.delete("/{field_hand_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field_hand(field_hand_id: int,
                            db_session: AsyncSession = Depends(get_db),
                            _:User = Depends(require_role(UserRole.ADMIN))):
    await db_session.execute(delete(FieldHand).where(FieldHand.id == field_hand_id))
    await db_session.commit()

@router.post("", response_model=FieldHandRead)
async def create_field_hand(payload: FieldHandCreate,
                            db_session: AsyncSession = Depends(get_db),
                            _:User = Depends(require_role(UserRole.ADMIN))):
    new_field_hand = FieldHand(**payload.model_dump())

    db_session.add(new_field_hand)
    await db_session.commit()
    await db_session.refresh(new_field_hand)

    return new_field_hand

@router.put("/{field_hand_id}", response_model= FieldHandRead)
async def update_field_hand(field_hand_id: int,
                            payload: FieldHandUpdate,
                            db_session: AsyncSession = Depends(get_db),
                            _:User = Depends(require_role(UserRole.ADMIN))):
    result = await db_session.execute(select(FieldHand).where(FieldHand.id == field_hand_id))

    current_field_hand = result.scalar_one_or_none()

    if current_field_hand is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Field Hand with provided id was found"
        )

    for field, value in payload.model_dump().items():
        setattr(current_field_hand, field, value)

    await db_session.commit()
    await db_session.refresh(current_field_hand)

    return current_field_hand