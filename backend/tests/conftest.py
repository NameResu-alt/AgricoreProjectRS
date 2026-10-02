import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import NullPool
from app.models import Base, User, UserRole
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.security import hash_password, create_access_token
from app.main import app

from httpx import ASGITransport, AsyncClient

import pytest_asyncio

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:password@127.0.0.1:5432/agricore_test"
)

engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

@pytest_asyncio.fixture
async def db_session():
    async with engine.begin() as session:
        await session.run_sync(Base.metadata.create_all)
    
    async with TestSessionLocal() as session:
        yield session
    
    async with engine.begin() as session:
        await session.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session
        
    app.dependency_overrides[get_db] = override_get_db
    
        
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
        
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def users(db_session: AsyncSession) -> dict[str, User]:
    unsafe_pw = hash_password("pw")
    users = {
        "admin": User(username="admin", hashed_password = unsafe_pw, role = UserRole.ADMIN),
        "field_hand": User(username="field_hand", hashed_password = unsafe_pw, role = UserRole.FIELD_HAND),
        "auditor": User(username="auditor", hashed_password=unsafe_pw, role = UserRole.ADMIN)
    }

    db_session.add_all(list(users.values()))

    await db_session.commit()

    for user in users.values():
        await db_session.refresh(user)

    return users


def auth_header(user: User) -> dict[str,str]:
    access_token = create_access_token(data={"sub":user.username, "role":user.role})
    return {"Authorization" : f"Bearer {access_token}"}