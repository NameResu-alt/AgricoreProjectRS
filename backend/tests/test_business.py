from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from httpx import AsyncClient, Response
from typing import Any
from app.models import (
    Farm,
    Equipment,
    EquipmentStatus,
    FieldHand,
    FieldJob,
    FieldJobPriority,
    FieldJobStatus,
    User
)
from app.schemas import EquipmentMetric, FarmMaintenaceRatio
import pytest
import pytest_asyncio

from .types import ColocationInformation, EquipmentModel, FarmEquipmentMaintenanceRatio, ReportingLinesSetup, ReportingLinesSetupV2, FarmSetup, FieldJobSetup

from collections.abc import Callable, Awaitable
from .conftest import auth_header


@pytest.mark.parametrize(
    "fuel_level, expected_count",
    (
        pytest.param(0, 0, id="No_Charge_Test-Expect0"),
        pytest.param(45, 3, id="Charge_45-Expect3"),
        pytest.param(90, 5, id="Charge_90-Expect5"),
        pytest.param(101, 6, id="Charge_101-Expect6"),
    ),
)
async def test_low_fuel_alert(
    fuel_level: int, expected_count: int, db_session: AsyncSession, client: AsyncClient, users: dict[str, User]
):
    farm = Farm(
        name="Farm", location_region="LocationRegion", capacity=20, supervisor_id=10
    )

    db_session.add(farm)
    await db_session.commit()
    await db_session.refresh(farm)

    db_session.add_all(
        [
            Equipment(
                serial_number="Serial1",
                model="Model1",
                status=EquipmentStatus.IN_USE,
                fuel_level=0,
                facility_id=1,
            ),
            Equipment(
                serial_number="Serial2",
                model="Model2",
                status=EquipmentStatus.IN_USE,
                fuel_level=20,
                facility_id=1,
            ),
            Equipment(
                serial_number="Serial3",
                model="Model3",
                status=EquipmentStatus.IN_USE,
                fuel_level=40,
                facility_id=1,
            ),
            Equipment(
                serial_number="Serial4",
                model="Model4",
                status=EquipmentStatus.IN_USE,
                fuel_level=60,
                facility_id=1,
            ),
            Equipment(
                serial_number="Serial5",
                model="Model5",
                status=EquipmentStatus.IN_USE,
                fuel_level=80,
                facility_id=1,
            ),
            Equipment(
                serial_number="Serial6",
                model="Model6",
                status=EquipmentStatus.IN_USE,
                fuel_level=100,
                facility_id=1,
            ),
        ]
    )

    await db_session.commit()

    result = await client.get(
        "/business/low_fuel_alert", params={"fuel_level": fuel_level}, headers=auth_header(users["admin"])
    )

    assert result.status_code == 200

    assert len(result.json()) == expected_count


@pytest_asyncio.fixture
async def colocation_information(db_session: AsyncSession) -> ColocationInformation:
    # Arrange
    farms = []

    for x in range(1, 6):
        farms.append(
            Farm(
                name=f"Farm{x}",
                location_region=f"Location_Region{x}",
                capacity=23,
                supervisor_id=1,
            )
        )

    db_session.add_all(farms)
    await db_session.commit()
    for f in farms:
        await db_session.refresh(f)

    equipment = []

    for x in range(1, 6):
        equipment.append(
            Equipment(
                serial_number=f"Serial_Number{x}",
                model=f"Model{x}",
                status=EquipmentStatus.IN_USE,
                fuel_level=0,
                farm=farms[x - 1],
            )
        )

    db_session.add_all(equipment)
    await db_session.commit()

    for e in equipment:
        await db_session.refresh(e)

    field_hands = []
    for x in range(1, 6):
        field_hands.append(FieldHand(name=f"FieldHand{x}", farm=farms[x - 1]))

    db_session.add_all(field_hands)
    await db_session.commit()

    for f in field_hands:
        await db_session.refresh(f)

    return ColocationInformation(
        farms=farms, equipment=equipment, field_hands=field_hands
    )


async def test_colocation_discrepancies_none(
    colocation_information: ColocationInformation,
    db_session: AsyncSession,
    client: AsyncClient,
    users: dict[str, User]
):
    # Farm -> Equipment -> FieldJob < - Field Hand. OUCH
    """
    *How many equipment units are assigned to farmhands who are NOT co-located at the same physical farm?*
    """
    # The field jobs are what actually determine what's going to get returned. The equipment units.
    # I expect to get back 3
    field_jobs = [
        FieldJob(
            title="FieldJob1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[0],
            field_hand=colocation_information.get("field_hands")[0],
        ),
        FieldJob(
            title="FieldJob2",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[1],
            field_hand=colocation_information.get("field_hands")[1],
        ),
        FieldJob(
            title="FieldJob3",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[2],
            field_hand=colocation_information.get("field_hands")[2],
        ),
        FieldJob(
            title="FieldJob4",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[3],
            field_hand=colocation_information.get("field_hands")[3],
        ),
        FieldJob(
            title="FieldJob5",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[4],
            field_hand=colocation_information.get("field_hands")[4],
        ),
    ]

    db_session.add_all(field_jobs)

    await db_session.commit()

    # Act
    result = await client.get("/business/colocation_discrepancies", headers=auth_header(users["admin"]))

    assert result.status_code == 200

    assert len(result.json()) == 0


async def test_colocation_discrepancies_all(
    colocation_information: ColocationInformation,
    db_session: AsyncSession,
    client: AsyncClient,
    users: dict[str, User]
):
    # Farm -> Equipment -> FieldJob < - Field Hand. OUCH
    """
    *How many equipment units are assigned to farmhands who are NOT co-located at the same physical farm?*
    """
    # The field jobs are what actually determine what's going to get returned. The equipment units.
    # I expect to get back 3
    field_jobs = [
        FieldJob(
            title="FieldJob1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[0],
            field_hand=colocation_information.get("field_hands")[4],
        ),
        FieldJob(
            title="FieldJob2",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[1],
            field_hand=colocation_information.get("field_hands")[3],
        ),
        FieldJob(
            title="FieldJob3",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[2],
            field_hand=colocation_information.get("field_hands")[1],
        ),
        FieldJob(
            title="FieldJob4",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[3],
            field_hand=colocation_information.get("field_hands")[1],
        ),
        FieldJob(
            title="FieldJob5",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[4],
            field_hand=colocation_information.get("field_hands")[0],
        ),
    ]

    db_session.add_all(field_jobs)

    await db_session.commit()

    # Act
    result = await client.get("/business/colocation_discrepancies", headers=auth_header(users["admin"]))

    assert result.status_code == 200

    assert len(result.json()) == len(field_jobs)


async def test_colocation_discrepancies_some(
    colocation_information: ColocationInformation,
    db_session: AsyncSession,
    client: AsyncClient,
    users: dict[str, User]
):
    # Farm -> Equipment -> FieldJob < - Field Hand. OUCH
    """
    *How many equipment units are assigned to farmhands who are NOT co-located at the same physical farm?*
    """
    # The field jobs are what actually determine what's going to get returned. The equipment units.
    # I expect to get back 3
    field_jobs = [
        FieldJob(
            title="FieldJob1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[0],
            field_hand=colocation_information.get("field_hands")[4],
        ),
        FieldJob(
            title="FieldJob2",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[1],
            field_hand=colocation_information.get("field_hands")[3],
        ),
        FieldJob(
            title="FieldJob3",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[2],
            field_hand=colocation_information.get("field_hands")[2],
        ),
        FieldJob(
            title="FieldJob4",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[3],
            field_hand=colocation_information.get("field_hands")[3],
        ),
        FieldJob(
            title="FieldJob5",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[4],
            field_hand=colocation_information.get("field_hands")[0],
        ),
        FieldJob(
            title="FieldJob6",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=colocation_information.get("equipment")[4],
            field_hand=colocation_information.get("field_hands")[4],
        ),
    ]

    db_session.add_all(field_jobs)

    await db_session.commit()

    # Act
    result = await client.get("/business/colocation_discrepancies", headers=auth_header(users["admin"]))

    assert result.status_code == 200

    assert len(result.json()) == 3


@pytest_asyncio.fixture
async def reliability_information(
    db_session: AsyncSession,
) -> tuple[FieldHand, dict[EquipmentModel, Equipment]]:
    farm = Farm(
        name="Farm", location_region="Location_Region", capacity=20, supervisor_id=1
    )
    db_session.add(farm)
    await db_session.commit()
    await db_session.refresh(farm)

    field_hand = FieldHand(name="FieldHand", farm=farm)
    db_session.add(field_hand)
    await db_session.commit()
    await db_session.refresh(field_hand)

    equipment_list: dict[EquipmentStatus, Equipment] = dict()

    for enum in EquipmentModel:
        equipment_list[enum] = Equipment(
            serial_number="Serial_Number1",
            model=enum.value,
            status=EquipmentStatus.IDLE,
            fuel_level=20,
            farm=farm,
        )

    db_session.add_all(equipment_list.values())
    await db_session.commit()

    for equip in list(equipment_list.values()):
        await db_session.refresh(equip)

    return (field_hand, equipment_list)


async def test_reliability_metrics_no_jobs(reliability_information: tuple[FieldHand, dict[EquipmentModel, Equipment]],client: AsyncClient, users: dict[str, User]):
    """
    field_jobs: list[FieldJob] = [
        FieldJob(
            title="Title1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.FAILED,
            equipment=equipment_list[EquipmentModel.MODEL1],
            field_hand=field_hand,
        ),
        FieldJob(
            title="Title1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=equipment_list[EquipmentModel.MODEL1],
            field_hand=field_hand,
        ),
        FieldJob(
            title="Title1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.IN_PROGRESS,
            equipment=equipment_list[EquipmentModel.MODEL1],
            field_hand=field_hand,
        ),
    ]
    """

    # db_session.add_all(field_jobs)
    # await db_session.commit()

    # act
    result = await client.get("/business/reliability_metrics", headers=auth_header(users["admin"]))

    assert result.status_code == 200
    
    outcome_dict = {
        EquipmentModel(key): EquipmentMetric.model_validate(value)
        for key, value in result.json().items()
    }

    for enum in EquipmentModel:
        assert enum in outcome_dict
        assert outcome_dict[enum].completion == 0
        assert outcome_dict[enum].failure == 0


async def test_reliability_metrics_with_data(
    reliability_information: tuple[FieldHand, dict[EquipmentModel, Equipment]],
    db_session: AsyncSession,
    client: AsyncClient,
    users: dict[str,User]
):

    field_hand, equipment_list = reliability_information

    field_jobs: list[FieldJob] = [
        FieldJob(
            title="Title1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.FAILED,
            equipment=equipment_list[EquipmentModel.MODEL1],
            field_hand=field_hand,
        ),
        FieldJob(
            title="Title1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.COMPLETED,
            equipment=equipment_list[EquipmentModel.MODEL1],
            field_hand=field_hand,
        ),
        FieldJob(
            title="Title1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.IN_PROGRESS,
            equipment=equipment_list[EquipmentModel.MODEL1],
            field_hand=field_hand,
        ),
        FieldJob(
            title="Title1",
            priority=FieldJobPriority.LOW,
            status=FieldJobStatus.FAILED,
            equipment=equipment_list[EquipmentModel.MODEL2],
            field_hand=field_hand,
        ),
    ]

    db_session.add_all(field_jobs)
    await db_session.commit()

    # act
    result = await client.get("/business/reliability_metrics", headers=auth_header(users["admin"]))

    assert result.status_code == 200
    
    print(result.json())

    outcome_dict = {
        EquipmentModel(key): EquipmentMetric.model_validate(value)
        for key, value in result.json().items()
    }
    


    assert outcome_dict[EquipmentModel.MODEL1].completion == 1
    assert outcome_dict[EquipmentModel.MODEL1].failure == 1
    assert outcome_dict[EquipmentModel.MODEL2].completion == 0
    assert outcome_dict[EquipmentModel.MODEL2].failure == 1

@pytest.mark.parametrize(
    "expected_ratio, farm_equipment_ratios",
    (pytest.param(0, [FarmEquipmentMaintenanceRatio(name="Farm1",maintenance_count=1,non_maintenance_count=1)],id="One_Farm1:1"),
     pytest.param(60, [FarmEquipmentMaintenanceRatio(name="Farm1",maintenance_count=100,non_maintenance_count=0)],id="One_Farm1:1"),
     pytest.param(10, [FarmEquipmentMaintenanceRatio(name="Farm1",maintenance_count=20,non_maintenance_count=100)],id="One_Farm120:100"),
     pytest.param(50, [FarmEquipmentMaintenanceRatio(name="Farm1",maintenance_count=20,non_maintenance_count=100), FarmEquipmentMaintenanceRatio(name="Farm2",maintenance_count=20,non_maintenance_count=100), FarmEquipmentMaintenanceRatio(name="Farm2",maintenance_count=100,non_maintenance_count=0)],id="Multi_Farm")
    )
)
    
async def test_maintenance_flags(expected_ratio: int, farm_equipment_ratios: list[FarmEquipmentMaintenanceRatio],db_session: AsyncSession, client: AsyncClient, users: dict[str,User]):
    farms: list[Farm] = []
    meets_expected_ratio_count = 0
    
    for ratio in farm_equipment_ratios:
        new_farm = Farm(name= ratio.get("name"), location_region = "Location_Region", capacity=20, supervisor_id=1)
        farms.append(new_farm)
        ratio["farm"] = new_farm
        
        total = ratio.get("maintenance_count") + ratio.get("non_maintenance_count")
        
        div = (ratio.get("maintenance_count")/total * 100) if total > 0 else 0
        
        if div >= expected_ratio:
            meets_expected_ratio_count += 1
    
    db_session.add_all(farms)
    
    await db_session.commit()
    
    for farm in farms:
        await db_session.refresh(farm)
        
    ratio_to_id: dict[int, FarmEquipmentMaintenanceRatio] = {
        ratio.get("farm").id: ratio
        for ratio in farm_equipment_ratios
    }
    
    for ratio in farm_equipment_ratios:
        maintenance_equipment: list[Equipment] = []
        non_maintenance_equipment: list[Equipment] = []

        for _ in range(ratio.get("maintenance_count")):
            maintenance_equipment.append(
                Equipment(
                    serial_number="SerialNumber",
                    model="Model",
                    status=EquipmentStatus.MAINTENANCE,
                    fuel_level=0,
                    farm=ratio.get("farm"),
                )
            )

        for _ in range(ratio.get("non_maintenance_count")):
            non_maintenance_equipment.append(
                Equipment(
                    serial_number="SerialNumber",
                    model="Model",
                    status=EquipmentStatus.IN_USE,
                    fuel_level=0,
                    farm=ratio.get("farm"),
                )
            )

        db_session.add_all(
            maintenance_equipment + non_maintenance_equipment
        )

    await db_session.commit()
    
    result = await client.get("/business/maintenance_flags", params={"ratio":expected_ratio}, headers=auth_header(users["admin"]))
    
    assert result.status_code == 200
    
    assert len(result.json()) == meets_expected_ratio_count
    
    json_dict_results = {
        key: FarmMaintenaceRatio.model_validate(value)
        for key, value in result.json().items()
    }
    
        
    for key in json_dict_results:
        assert int(key) in ratio_to_id
        
        json_ratio = json_dict_results.get(key)
        true_ratio = ratio_to_id.get(int(key))
        
        assert json_ratio.maintenance_count == true_ratio.get("maintenance_count")
        assert json_ratio.total == true_ratio.get("maintenance_count") +  true_ratio.get("non_maintenance_count")

@pytest.fixture
async def create_reporting_lines(db_session: AsyncSession) -> Callable[[ReportingLinesSetupV2], Awaitable[dict[int, int]]]:
    async def _create(setup: ReportingLinesSetupV2) -> dict[int, int]:

        all_farms: list[Farm] = []

        for index, farm_s in enumerate(setup.farm_setup):
            new_farm = Farm(name=f"Farm-{index+1}", location_region="Location_Region", capacity=20, supervisor_id=farm_s.supervisor_id)
            all_farms.append(new_farm)


        db_session.add_all(all_farms)
        await db_session.commit()

        for f in all_farms:
            await db_session.refresh(f)

        equipment_dict: dict[str,Equipment] = dict()
        field_hand_dict: dict[str, FieldHand] = dict()

        for index, farm_s in enumerate(setup.farm_setup):
            farm = all_farms[index]

            equipment_list: list[Equipment] = []
            field_hand_list: list[FieldHand] = []

            for equipment_id in farm_s.equipment:
                new_equipment = Equipment(serial_number=equipment_id,model="Model",status=EquipmentStatus.IDLE, fuel_level=20,farm=farm)
                equipment_list.append(new_equipment)

            db_session.add_all(equipment_list)
            await db_session.commit()

            for field_hand_id in farm_s.field_hands:
                new_field_hand = FieldHand(name=field_hand_id, farm=farm)
                field_hand_list.append(new_field_hand)

            db_session.add_all(field_hand_list)
            await db_session.commit()

            for equipment in equipment_list:
                await db_session.refresh(equipment)
                equipment_dict[equipment.serial_number] = equipment

            for field_hand in field_hand_list:
                await db_session.refresh(field_hand)
                field_hand_dict[field_hand.name] = field_hand

            pass

        expected_supervisor_count: dict[int,int] = dict()

        all_jobs: list[FieldJob] = []
        for index, job_setup in enumerate(setup.fieldjob_setup):
            new_field_job = FieldJob(title=f"FieldJob{index+1}", priority = FieldJobPriority.LOW, status=job_setup.status, equipment=equipment_dict[job_setup.equipment_id], field_hand=field_hand_dict[job_setup.field_hand_id])
            all_jobs.append(new_field_job)

            farm = equipment_dict[job_setup.equipment_id].farm
            amount_to_add = 1 if job_setup.status == FieldJobStatus.IN_PROGRESS else 0
            expected_supervisor_count[farm.supervisor_id] = expected_supervisor_count.get(farm.supervisor_id, 0) + amount_to_add


        db_session.add_all(all_jobs)
        await db_session.commit()

        return expected_supervisor_count

    return _create


reporting_lines_cases: dict[str, ReportingLinesSetupV2] = {
    "nodata": ReportingLinesSetupV2(farm_setup=[],fieldjob_setup=[]),
    "complex_1": ReportingLinesSetupV2(
                        farm_setup=[
                            FarmSetup(supervisor_id=1, equipment=["E1","E2","E3"], field_hands=["F1","F2","F3"]),
                            FarmSetup(supervisor_id=2, equipment=["E4"], field_hands=["F4"]),
                            FarmSetup(supervisor_id=3, equipment=["E5","E6"], field_hands=["F5","F6"]),
                            FarmSetup(supervisor_id=1, equipment=["E7"], field_hands=["F7"])
                        ],
                        fieldjob_setup=[
                            FieldJobSetup(equipment_id="E1", field_hand_id="F1", status=FieldJobStatus.IN_PROGRESS),
                            FieldJobSetup(equipment_id="E7", field_hand_id="F7", status=FieldJobStatus.IN_PROGRESS),
                            FieldJobSetup(equipment_id="E4", field_hand_id="F4", status=FieldJobStatus.PENDING),
                            FieldJobSetup(equipment_id="E7", field_hand_id="F7", status=FieldJobStatus.PENDING)
                        ]
                    )
}


@pytest.mark.parametrize(
        "supervisor_id, setup",
        (
            pytest.param(
                1,
                reporting_lines_cases["nodata"]
                , id="No_Data"),
            pytest.param(
                1,
                reporting_lines_cases["complex_1"],
                id="Complex_1Super1"
            ),
            pytest.param(
                100,
                reporting_lines_cases["complex_1"],
                id="Complex_1Super100Missing"
            ),
             pytest.param(
                3,
                reporting_lines_cases["complex_1"],
                id="Complex_1Super3"
            )
        ,)
)
async def test_reporting_lines_v2(supervisor_id:int, setup: ReportingLinesSetupV2, create_reporting_lines, client: AsyncClient, users: dict[str, User]):
    
    expected_supervisor_count: dict[int,int] = await create_reporting_lines(setup)

    result = await client.get("/business/reporting_lines", params={"supervisor_id":supervisor_id}, headers=auth_header(users["admin"]))

    assert result.status_code == 200

    count = result.json()

    assert expected_supervisor_count.get(supervisor_id, 0) == count