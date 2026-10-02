from .Base import Base
from sqlalchemy import Integer, Text, String, func, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .FieldJob import FieldJob

class ServiceReport(Base):
    __tablename__="service_reports"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    file_url: Mapped[str] = mapped_column(String(200))
    notes: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    field_job_id: Mapped[int] = mapped_column(Integer, ForeignKey("field_jobs.id"))
    
    field_job: Mapped["FieldJob"] = relationship(back_populates="service_reports")