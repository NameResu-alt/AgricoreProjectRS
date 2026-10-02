from .Base import Base
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .Farm import Farm
    from .FieldJob import FieldJob

class FieldHand(Base):
    __tablename__="field_hands"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    facility_id: Mapped[int] = mapped_column(Integer, ForeignKey("farms.id"))
    
    farm: Mapped["Farm"] = relationship(back_populates="field_hands")
    field_jobs: Mapped[list["FieldJob"]] = relationship(back_populates="field_hand")