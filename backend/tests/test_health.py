from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient, Response
import pytest
from .types import HealthTestParameters
from .conftest import auth_header

async def test_basic_health(db_session: AsyncSession, client: AsyncClient):
    result = await client.get("/health")

    assert result.status_code == 200

    assert result.json() == {"status":"OK"}

async def test_ready_health_success(db_session: AsyncSession, client: AsyncClient):

    result = await client.get("/health/ready")

    assert result.status_code == 200

@pytest.mark.parametrize(
        "parameter",(
            pytest.param(HealthTestParameters(db_up=True, s3_up=True, expected_status=200, outcome={"s3_healthy":True}), id="BothUp"),
            pytest.param(HealthTestParameters(db_up=True, s3_up=False, expected_status=200, outcome={"s3_healthy":False}), id="DB_UP,S3_DOWN"),
            pytest.param(HealthTestParameters(db_up=False, s3_up=True, expected_status=401), id="DB_DOWN,S3_UP"),
            pytest.param(HealthTestParameters(db_up=False, s3_up=False, expected_status=401), id="BothDown")
            ,)
)
async def test_health_details(parameter: HealthTestParameters, factory_faulty_client, users):
    async for client in factory_faulty_client(parameter):
        annotated_client: AsyncClient = client

        outcome: Response = await annotated_client.get("/health/details", headers=auth_header(users["admin"]))

        assert outcome.status_code == parameter.expected_status
        if parameter.outcome is not None:
            assert outcome.json() == parameter.outcome

        