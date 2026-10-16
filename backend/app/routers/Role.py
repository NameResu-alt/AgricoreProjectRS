from fastapi import APIRouter, Depends, HTTPException, status
from app.models import Role, Permission, RolePermission
from app.schemas import RoleRead, RoleCreate, RoleUpdate, DataEnvelope, DataQuery
from app.dependencies import get_db, permission_endpoint, data_query_for

from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload

from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/roles",
    tags=["roles"]
)

@router.get("",response_model= DataEnvelope[RoleRead], **permission_endpoint(Permission.ROLE_READ))
async def get_roles(
    db_session: AsyncSession = Depends(get_db),
    search_queries: DataQuery = Depends(data_query_for(Role, RoleRead))
):
    stmt = select(Role).where(search_queries.filterQuery).order_by(*search_queries.sortQueries)

    count_stmt = select(func.count()).select_from(
        stmt.order_by(None).subquery()
    )

    total_count = await db_session.scalar(count_stmt) or 0

    result = await db_session.execute(
        stmt.offset(search_queries.page * search_queries.page_size)
        .limit(search_queries.page_size).options(selectinload(Role.permissions))
    )

    items = list(result.scalars().all())

    return DataEnvelope[RoleRead](
        total=total_count,
        data=items # type: ignore
    )

@router.post("", response_model=RoleRead, **permission_endpoint(Permission.ROLE_CREATE))
async def create_role(
    role_payload: RoleCreate, 
    db_session: AsyncSession = Depends(get_db)):

    new_role = Role(
        name=role_payload.name,
        permissions=[
            RolePermission(permission=perm)
            for perm in role_payload.permissions
        ]
    )

    db_session.add(new_role)
    await db_session.commit()

    #Important to know, need to refresh for that list.
    await db_session.refresh(new_role, attribute_names=["permissions"])

    return new_role

@router.put("/{role_id}", response_model=RoleRead, **permission_endpoint(Permission.ROLE_UPDATE))
async def update_role(role_update: RoleUpdate, role_id: int, db_session: AsyncSession = Depends(get_db)):
    result = await db_session.execute(select(Role).where(Role.id == role_id).options(selectinload(Role.permissions)))

    role = result.scalar_one_or_none()

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No role found with provided id"
        )

    current_permissions: set[Permission] = set()
    for perm in role.permissions:
        current_permissions.add(perm.permission)

        if(perm.permission not in role_update.permissions):
            await db_session.delete(perm)
        pass

    for perm in role_update.permissions:
        if(perm in current_permissions): 
            continue
        db_session.add(RolePermission(permission=perm, role=role))
        pass

    await db_session.commit()
    await db_session.refresh(role, attribute_names=["permissions"])
    
    return role

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT, **permission_endpoint(Permission.ROLE_DELETE))
async def delete_role(role_id: int, db_session: AsyncSession = Depends(get_db)):

    result = await db_session.execute(select(Role).where(Role.id == role_id))

    role = result.scalar_one_or_none()

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role with provided id not found"
        )

    await db_session.delete(role)
    await db_session.commit()