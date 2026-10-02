import asyncio
from app.security import hash_password
from app.database import AsyncSessionLocal
from app.models import User, UserRole

async def create_users():
    async with AsyncSessionLocal() as session:
        users = [
            User(username="admin", hashed_password=hash_password("pw"), role = UserRole.ADMIN),
            User(username="fieldhand", hashed_password=hash_password("pw"), role = UserRole.FIELD_HAND),
            User(username="auditor", hashed_password=hash_password("pw"), role = UserRole.AUDITOR)
        ]

        session.add_all(users)

        await session.commit()

if __name__ == "__main__":
    asyncio.run(create_users())