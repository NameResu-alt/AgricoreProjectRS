from .Base import Base
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .Equipment import Equipment
    from .FieldHand import FieldHand

class Farm(Base):
    __tablename__="farms"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    location_region: Mapped[str] = mapped_column(String(100))
    capacity: Mapped[int] = mapped_column(Integer)
    supervisor_id: Mapped[int] = mapped_column(Integer)
    
    equipment_list: Mapped[list["Equipment"]] = relationship(back_populates="farm")
    field_hands: Mapped[list["FieldHand"]] = relationship(back_populates="farm")
    