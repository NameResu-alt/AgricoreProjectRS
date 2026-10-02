from pydantic import BaseModel, ConfigDict

class FieldHandBase(BaseModel):
    name: str
    facility_id: int

class FieldHandRead(FieldHandBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class FieldHandCreate(FieldHandBase):
    pass

class FieldHandUpdate(FieldHandBase):
    pass