from fastapi import APIRouter, Depends, status, HTTPException

from app.dependencies import data_query_for, get_db, permission_endpoint
from app.models import FieldHand, User, UserRole, Permission
from app.schemas import FieldHandRead, FieldHandUpdate, FieldHandCreate

from sqlalchemy.ext.asyncio  import AsyncSession
from sqlalchemy import select, delete, func

from app.schemas import DataEnvelope, DataQuery


router = APIRouter(
    prefix="/field_hands",
    tags=["field_hands"]
)

@router.get("",response_model=DataEnvelope[FieldHandRead], **permission_endpoint(Permission.FIELD_HAND_READ))
async def get_field_hands(db_session: AsyncSession = Depends(get_db),
                          searchQueries: DataQuery = Depends(data_query_for(FieldHand, FieldHandRead))):
    stmt = select(FieldHand).where(searchQueries.filterQuery).order_by(*searchQueries.sortQueries)

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
    #list(result.scalars().all())
    return DataEnvelope[FieldHandRead](
        total=total_count,
        data=list(items) # type: ignore
    )

@router.delete("/{field_hand_id}", status_code=status.HTTP_204_NO_CONTENT, **permission_endpoint(Permission.FIELD_HAND_DELETE))
async def delete_field_hand(field_hand_id: int,
                            db_session: AsyncSession = Depends(get_db)):
    await db_session.execute(delete(FieldHand).where(FieldHand.id == field_hand_id))
    await db_session.commit()

@router.post("", response_model=FieldHandRead, **permission_endpoint(Permission.FIELD_HAND_CREATE))
async def create_field_hand(payload: FieldHandCreate,
                            db_session: AsyncSession = Depends(get_db)):
    new_field_hand = FieldHand(**payload.model_dump())

    db_session.add(new_field_hand)
    await db_session.commit()
    await db_session.refresh(new_field_hand)

    return new_field_hand

@router.put("/{field_hand_id}", response_model= FieldHandRead, **permission_endpoint(Permission.FIELD_HAND_UPDATE))
async def update_field_hand(field_hand_id: int,
                            payload: FieldHandUpdate,
                            db_session: AsyncSession = Depends(get_db)):
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