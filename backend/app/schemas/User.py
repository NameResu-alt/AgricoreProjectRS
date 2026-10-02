from pydantic import BaseModel
from app.models import UserRole
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole

class UserRead(BaseModel):
    id: int
    username: str
    role: UserRole
    is_active: bool
    created_date: datetime
