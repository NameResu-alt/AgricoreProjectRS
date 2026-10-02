from .Base import Base
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .Enums import FieldJobPriority, FieldJobStatus

if TYPE_CHECKING:
    from .Equipment import Equipment
    from .FieldHand import FieldHand
    from .ServiceReport import ServiceReport

class FieldJob(Base):
    __tablename__ = "field_jobs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title:  Mapped[str] = mapped_column(String(100))
    priority: Mapped["FieldJobPriority"] = mapped_column(SQLEnum(
        FieldJobPriority,
        name="field_job_priority",
        values_callable = lambda enumcls: [x.value for x in enumcls]
    ))
    status: Mapped["FieldJobStatus"] = mapped_column(SQLEnum(
        FieldJobStatus,
        name="field_job_status",
        values_callable= lambda enumcls: [x.value for x in enumcls]
    ))
    equipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("equipment.id"))
    operator_id: Mapped[int] = mapped_column(Integer, ForeignKey("field_hands.id"))
    
    equipment: Mapped["Equipment"] = relationship(back_populates="field_jobs")
    field_hand: Mapped["FieldHand"] = relationship(back_populates="field_jobs")
    service_reports: Mapped[list["ServiceReport"]] = relationship(back_populates="field_job")