from app.models import Base
from app.database import AsyncSessionLocal, engine
import asyncio

async def create_tables():
    async with engine.begin() as session:
        
        await session.run_sync(Base.metadata.drop_all)
        
        await session.run_sync(Base.metadata.create_all)
    

if __name__ == "__main__":
    asyncio.run(create_tables())