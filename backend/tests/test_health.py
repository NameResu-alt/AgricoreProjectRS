from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient, Response
from fastapi import status
import pytest
from .types import HealthTestParameters
from .conftest import auth_header

async def test_basic_health(client: AsyncClient):
    result = await client.get("/health")

    assert result.status_code == 200

    assert result.json() == {"status":"OK"}

@pytest.mark.parametrize(
        "db_up, expected_status",[
            pytest.param(True, 200, id="DBUpExpect200"),
            pytest.param(False, 503, id="DBDownExpect503")
        ]
)
async def test_ready_health_success(db_up: bool, expected_status:int, factory_faulty_client):
    param = HealthTestParameters(db_up=db_up, s3_up=True)

    async with factory_faulty_client(param) as client:
        result = await client.get("/health/ready")
        assert result.status_code == expected_status


@pytest.mark.parametrize(
        "role_name, expected_status",(
            pytest.param("field_hand", status.HTTP_403_FORBIDDEN , id="Field_Hand-Should403"),
            pytest.param("auditor", status.HTTP_403_FORBIDDEN, id="Auditor-Should403"),
            pytest.param("admin", status.HTTP_200_OK, id="Admin-Should200")
        )
)
async def test_health_details_requires_admin(role_name, expected_status, factory_faulty_client, users):

    param = HealthTestParameters(db_up=True, s3_up=True)
    #Note, I need to use factory_faulty_client rather than client, since factory lets me set the boto3 mock
    async with factory_faulty_client(param) as client:
        result: Response = await client.get("/health/details", headers=auth_header(users[role_name]))
        assert result.status_code == expected_status


@pytest.mark.parametrize(
        "parameter",(
            pytest.param(HealthTestParameters(db_up=True, s3_up=True, expected_status=200, outcome={"s3_healthy":True}), id="BothUp"),
            pytest.param(HealthTestParameters(db_up=True, s3_up=False, expected_status=200, outcome={"s3_healthy":False}), id="DB_UP,S3_DOWN"),
            pytest.param(HealthTestParameters(db_up=False, s3_up=True, expected_status=401), id="DB_DOWN,S3_UP"),
            pytest.param(HealthTestParameters(db_up=False, s3_up=False, expected_status=401), id="BothDown")
            ,)
)
async def test_health_details(parameter: HealthTestParameters, factory_faulty_client, users):
    async with factory_faulty_client(parameter) as client:
        annotated_client: AsyncClient = client
        

        outcome: Response = await annotated_client.get("/health/details", headers=auth_header(users["admin"]))

        assert outcome.status_code == parameter.expected_status
        if parameter.outcome is not None:
            assert outcome.json() == parameter.outcome

        