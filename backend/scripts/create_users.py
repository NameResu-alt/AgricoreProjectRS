import asyncio
import argparse
from argparse import Namespace
from app.security import hash_password
from app.database import AsyncSessionLocal
from app.models import User, UserRole, Role, RolePermission, Permission
from sqlalchemy import exists,select, text

async def create_base_roles() -> dict[UserRole, Role]:
    async with AsyncSessionLocal() as session:
        roles = [
            Role(name=UserRole.ADMIN, permissions=[
                RolePermission(permission=Permission.HEALTH_READ),
                RolePermission(permission=Permission.BUSINESS_READ),
                RolePermission(permission=Permission.ROLE_ALL),
                RolePermission(permission=Permission.USER_ALL),
                RolePermission(permission=Permission.FIELD_HAND_ALL),
                RolePermission(permission=Permission.FARM_ALL),
                RolePermission(permission=Permission.EQUIPMENT_ALL),
                RolePermission(permission=Permission.FIELD_JOB_ALL),
                RolePermission(permission=Permission.SERVICE_REPORT_ALL)
            ]),
            Role(name=UserRole.FIELD_HAND, permissions=[
                RolePermission(permission=Permission.BUSINESS_READ),
                RolePermission(permission=Permission.FARM_READ),
                RolePermission(permission=Permission.EQUIPMENT_READ),
                RolePermission(permission=Permission.FIELD_JOB_READ),
                RolePermission(permission=Permission.FIELD_JOB_ASSIGN_SERVICE_REPORT),
                RolePermission(permission=Permission.FIELD_JOB_CHANGE_STATUS),
                RolePermission(permission=Permission.SERVICE_REPORT_READ)
            ]),
            Role(name=UserRole.AUDITOR, permissions=[
                RolePermission(permission=Permission.BUSINESS_READ),
                RolePermission(permission=Permission.FIELD_HAND_READ),
                RolePermission(permission=Permission.FARM_READ),
                RolePermission(permission=Permission.EQUIPMENT_READ),
                RolePermission(permission=Permission.FIELD_JOB_READ),
                RolePermission(permission=Permission.SERVICE_REPORT_READ)
            ])
        ]

        session.add_all(roles)
        await session.commit()

        mapped_roles: dict[UserRole, Role] = dict()

        for role in roles:
            await session.refresh(role)
            mapped_roles[UserRole(role.name)] = role

        return mapped_roles



async def create_users(args: Namespace):

    roles = await create_base_roles()

    async with AsyncSessionLocal() as session:

        if args.reset:
            print("Reset flag set, deleting all users and repopulating")
            await session.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE;"))
            await session.commit()

        users = [
            User(username="admin", hashed_password=hash_password("pw"), role = roles[UserRole.ADMIN]),
            User(username="fieldhand", hashed_password=hash_password("pw"), role = roles[UserRole.FIELD_HAND]),
            User(username="auditor", hashed_password=hash_password("pw"), role = roles[UserRole.AUDITOR])
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