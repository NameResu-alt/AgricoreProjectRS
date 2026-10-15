from typing import TYPE_CHECKING
from .Base import Base
from .Enums import Permission
from sqlalchemy import Integer, ForeignKey, VARCHAR, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .Role import Role

class RolePermission(Base):
    __tablename__="role_permissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"))
    permission: Mapped[Permission] = mapped_column(
        SQLEnum(
            Permission,
            name="role_permission",
            values_callable= lambda enumCls: [enum.value for enum in enumCls]
        )
    )

    role: Mapped["Role"] = relationship(back_populates="permissions")