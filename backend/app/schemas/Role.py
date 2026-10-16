from pydantic import BaseModel, ConfigDict, field_validator
from app.models import Permission, RolePermission
from datetime import datetime

class RoleRead(BaseModel):
    id: int
    name: str
    created_date: datetime
    permissions: list[Permission]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

    @field_validator("permissions", mode="before")
    @classmethod
    def extract_permissions(cls, value):
        return [
            item.permission if isinstance(item, RolePermission) else item
            for item in value
        ]
    

class RoleCreate(BaseModel):
    name: str
    permissions: list[Permission]

class RoleUpdate(BaseModel):
    name: str
    permissions: list[Permission]