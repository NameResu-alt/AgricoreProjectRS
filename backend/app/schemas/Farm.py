from pydantic import BaseModel, ConfigDict, Field

class FarmBase(BaseModel):
    name: str
    location_region: str
    capacity: int = Field(ge=0)
    supervisor_id: int
    
class FarmRead(FarmBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class FarmCreate(FarmBase):
    pass

class FarmUpdate(FarmBase):
    pass

class FarmMaintenaceRatio(BaseModel):
    farm_name: str
    maintenance_count: int
    total: int