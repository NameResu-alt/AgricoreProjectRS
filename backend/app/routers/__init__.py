from .Farm import router as FarmRouter
from .FieldHand import router as FieldHandRouter
from .Equipment import router as EquipmentRouter
from .FieldJob import router as FieldJobRouter
from .ServiceReport import router as ServiceReportRouter
from .Business import router as BusinessRouter
from .auth import router as AuthRouter

__all__ = [
    "FarmRouter",
    "FieldHandRouter",
    "EquipmentRouter",
    "FieldJobRouter",
    "ServiceReportRouter",
    "BusinessRouter",
    "AuthRouter"
]