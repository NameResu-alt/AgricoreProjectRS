from pydantic import BaseModel, ConfigDict
from typing import TypedDict
from app.models import EquipmentStatus

class EquipmentBase(BaseModel):
    serial_number: str
    model: str
    status: EquipmentStatus
    fuel_level: int
    facility_id: int

class EquipmentRead(EquipmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(EquipmentBase):
    pass

class EquipmentMetric(BaseModel):
    completion: int
    failure: int