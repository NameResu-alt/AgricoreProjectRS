from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_current_user, get_db, require_role
from app.security import hash_password, verify_password, create_access_token
from app.models import User, UserRole
from app.schemas import Token, UserCreate, UserRead

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.get("", response_model=list[UserRead])
async def get_users(db_session: AsyncSession = Depends(get_db),
                    _:User = Depends(require_role(UserRole.ADMIN))):
    result = await db_session.execute(select(User))

    return list(result.scalars().all())

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db_session: AsyncSession = Depends(get_db),
                           _:User = Depends(require_role(UserRole.ADMIN))):
    stmt = delete(User).where(User.id == user_id)
    await db_session.execute(stmt)
    await db_session.commit()

@router.post("/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db_session: AsyncSession = Depends(get_db)):
    result = await db_session.execute(select(User).where(User.username == form.username))

    user: User | None = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided username doesn't exist"
        )

    if not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )

    data = {"sub": user.username, "role": user.role}

    access_token = create_access_token(data)

    return Token(access_token=access_token)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, 
                   db_session: AsyncSession = Depends(get_db),
                   _:User = Depends(require_role(UserRole.ADMIN))):
    new_user = User(username = payload.username, hashed_password = hash_password(payload.password), role = payload.role)
    db_session.add(new_user)
    await db_session.commit()
