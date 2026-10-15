from typing import TYPE_CHECKING
from .Base import Base
from datetime import datetime

from sqlalchemy import ForeignKey, Boolean, Integer, VARCHAR, DateTime, func, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .RolePermission import RolePermission
    from .User import User

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(100), unique=True)
    created_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


    permissions: Mapped[list["RolePermission"]] = relationship(back_populates="role")

    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())

    users: Mapped[list["User"]] = relationship(back_populates="role")