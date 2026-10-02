from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient

from app.models import Farm, User
from app.schemas import FarmRead
from .conftest import auth_header

async def test_get_farms(db_session: AsyncSession, users: dict[str, User], client: AsyncClient):
    farm = Farm(name="Farm", location_region="LocationRegion1", capacity=20, supervisor_id=1)
    
    db_session.add(farm)
    await db_session.commit()
    await db_session.refresh(farm)
    
    result = await client.get("/farms", headers=auth_header(users["admin"]))
    
    assert result.status_code == 200
    
    farm_read = FarmRead.model_validate(result.json()[0])
    
    assert farm.id == farm_read.id