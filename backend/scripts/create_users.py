import asyncio
import argparse
from argparse import Namespace
from app.security import hash_password
from app.database import AsyncSessionLocal
from app.models import User, UserRole
from sqlalchemy import exists,select, text

async def create_users(args: Namespace):
    async with AsyncSessionLocal() as session:

        if args.reset:
            print("Reset flag set, deleting all users and repopulating")
            await session.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE;"))
            await session.commit()

        users = [
            User(username="admin", hashed_password=hash_password("pw"), role = UserRole.ADMIN),
            User(username="fieldhand", hashed_password=hash_password("pw"), role = UserRole.FIELD_HAND),
            User(username="auditor", hashed_password=hash_password("pw"), role = UserRole.AUDITOR)
        ]

        added_anyone: bool = False

        for user in users:
            result = await session.execute(select(exists(User).where(User.username == user.username)))

            already_present: bool = result.scalar_one_or_none() or False

            if not already_present:
                added_anyone = True
                session.add(user)


        #session.add_all(users)
        if added_anyone:
            await session.commit()
        else:
            print("Didn't add any new users")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Settings for user creation")
    parser.add_argument('-r','--reset', action="store_true", help = 'Whether users should be wiped')
    args = parser.parse_args()

    asyncio.run(create_users(args))