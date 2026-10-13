from .Base import Base

from sqlalchemy import func, DateTime, ForeignKey, Integer, Text, Boolean, true
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[str] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    expire_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    hashed_token: Mapped[str] = mapped_column(Text)
    #Note: user_id isn't passed to the frontend. Only the id of the current refresh token and the expire time are
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    valid: Mapped[bool] = mapped_column(Boolean, server_default=true())


