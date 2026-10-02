from .Base import Base
from .Enums import EquipmentStatus
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .Farm import Farm
    from .FieldJob import FieldJob
    

class Equipment(Base):
    __tablename__="equipment"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    serial_number: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    status: Mapped["EquipmentStatus"] = mapped_column(SQLEnum(
        EquipmentStatus,
        name="equipment_status",
        values_callable= lambda enumcls: [x.value for x in enumcls]
    ))
    fuel_level: Mapped[int] = mapped_column(Integer)
    facility_id: Mapped[int] = mapped_column(Integer, ForeignKey("farms.id"))
    
    farm: Mapped["Farm"] = relationship(back_populates="equipment_list")
    field_jobs: Mapped[list["FieldJob"]] = relationship(back_populates="equipment")