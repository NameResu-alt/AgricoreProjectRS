from .Base import Base
from sqlalchemy import String, Boolean, true, func, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.models import UserRole


class User(Base):
    __tablename__="users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(100))

    role: Mapped[UserRole] = mapped_column(
        SQLEnum(
            UserRole,
            name="user_role",
            values_callable= lambda enumcls: [x.value for x in enumcls]
        )
    )

    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())
    created_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

