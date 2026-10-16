from pydantic import BaseModel, ConfigDict
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class RoleRead(BaseModel):
    name: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class UserRead(BaseModel):
    id: int
    username: str
    role: RoleRead | None
    is_active: bool
    created_date: datetime

    model_config = ConfigDict(from_attributes=True)
