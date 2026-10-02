from typing import TypedDict
from app.models import Farm, Equipment, FieldHand, FieldJobStatus
from enum import Enum
from pydantic import BaseModel, model_validator

class ColocationInformation(TypedDict):
    farms: list[Farm]
    equipment: list[Equipment]
    field_hands: list[FieldHand]

class EquipmentModel(str, Enum):
    MODEL1 = "Model1"
    MODEL2 = "Model2"
    MODEL3 = "Model3"
    MODEL4 = "Model4"
    MODEL5 = "Model5"

class FarmEquipmentMaintenanceRatio(TypedDict):
    name: str
    maintenance_count: int
    non_maintenance_count: int
    farm: Farm
    

class FarmSetup(BaseModel):
    supervisor_id: int
    equipment: list[str]
    field_hands: list[str]
    
    @model_validator(mode="after")
    def validate_setup(self):
        if len(self.equipment) != len(set(self.equipment)):
            raise ValueError("Duplicate equipment values are not allowed")
        
        if len(self.field_hands) != len(set(self.field_hands)):
            raise ValueError("Duplicate field hand values are not allowed")

        return self

class FieldJobSetup(BaseModel):
    equipment_id: str
    field_hand_id: str
    status: FieldJobStatus

class ReportingLinesSetupV2(BaseModel):
    
    farm_setup: list[FarmSetup]
    fieldjob_setup: list[FieldJobSetup]
    
    @model_validator(mode="after")
    def validate_self(self):

        
        all_equipments_set = set()
        all_field_hands_set = set()

        all_equipments = []
        all_field_hands = []
        
        for farm in self.farm_setup:
            all_equipments_set.update(farm.equipment)
            all_field_hands_set.update(farm.field_hands)

            all_equipments.extend(farm.equipment)
            all_field_hands.extend(farm.field_hands)

        if(len(all_equipments) != len(all_equipments_set)):
            raise ValueError("The same equipment can't be used for multiple farms")

        if(len(all_field_hands) != len(all_field_hands_set)):
            raise ValueError("The same field hand can't be used for multiple farms")
        
        for job in self.fieldjob_setup:
            if job.equipment_id not in all_equipments_set:
                raise ValueError(f"A matching equipment_id doesn't exist for the Job Setup: {job.equipment_id}")
            if job.field_hand_id not in all_field_hands_set:
                raise ValueError(f"A matching field_hand_id doesn't exist for the Job Setup: {job.field_hand_id}")
        
        return self
    
    
        
#farm(supervisor_id) -> Equipment -> Field Job <- Field Hand
# supervisor_id, how many farms. 
# how much equipment per farm
# how many field_hands
# I fill out the Field Jobs myself

class ReportingLinesSetup(BaseModel):
    """
    supervisor id -> how many farms they have
    """
    supervisor_info: dict[int, int]
    farm_equipment_count: list[int]
    farm_fieldhand_count: list[int]

    @model_validator(mode="after")
    def validate_farm_counts(self):
        farm_count = sum(self.supervisor_info.values())

        if len(self.farm_equipment_count) > farm_count:
            raise ValueError(
                "More equipment-count entries than farms"
            )

        if len(self.farm_fieldhand_count) > farm_count:
            raise ValueError(
                "More field-hand-count entries than farms"
            )

        return self
