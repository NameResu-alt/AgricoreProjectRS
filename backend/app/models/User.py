from typing import TYPE_CHECKING
from .Base import Base
from sqlalchemy import Integer, String, Boolean, true, func, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.models import UserRole

if TYPE_CHECKING:
    from .Role import Role


class User(Base):
    __tablename__="users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(100))

    """
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(
            UserRole,
            name="user_role",
            values_callable= lambda enumcls: [x.value for x in enumcls]
        )
    )
    """
    role_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("roles.id", ondelete="SET NULL"))

    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())
    created_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    role: Mapped["Role | None"] = relationship(back_populates="users")

    #Just in case if I delete a role, what to do
    __table_args__ = (
        CheckConstraint(
            (role_id.is_not(None)) | (is_active == False),
            name="ck_user_role_required_for_active"
        ),
    )