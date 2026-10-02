from enum import Enum

#2. **Equipment:** Individual heavy machinery units (`id`, `serial_number`, `model`, `status`: *Idle* | *In-Use* | *Maintenance* | *Retired*, `fuel_level`, `facility_id`).
class EquipmentStatus(str, Enum):
    IDLE = "Idle"
    IN_USE = "In-Use"
    MAINTENANCE = "Maintenance"
    RETIRED = "Retired"

"""
`priority`: *Low* | *Medium* | *Critical*, `status`: *Pending* | *In-Progress* | *Completed* | *Failed*
"""
class FieldJobPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    CRITICAL = "Critical"
    
class FieldJobStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In-Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"

class UserRole(str, Enum):
    ADMIN = "Admin",
    FIELD_HAND = "Field_Hand",
    AUDITOR = "Auditor"