from pydantic import BaseModel, ConfigDict
from app.models import FieldJobStatus, FieldJobPriority

class FieldJobBase(BaseModel):
    title: str
    priority: FieldJobPriority
    status: FieldJobStatus
    equipment_id: int
    operator_id: int

class FieldJobRead(FieldJobBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class FieldJobCreate(FieldJobBase):
    pass
    
class FieldJobUpdate(FieldJobBase):
    pass

class FieldJobPatchStatus(BaseModel):
    status: FieldJobStatus