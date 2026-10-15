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

class Permission(str, Enum):
    HEALTH_READ = "health:read"
    BUSINESS_READ="business:read"

    USER_ALL="user:*"
    USER_READ="user:read"
    USER_CREATE="user:create"
    USER_DELETE="user:delete"
    USER_UPDATE="user:update"

    ROLE_ALL = "role:*"
    ROLE_READ = "role:read"
    ROLE_CREATE = "role:create"
    ROLE_DELETE = "role:delete"
    ROLE_UPDATE = "role:update"

    FARM_ALL="farm:*"
    FARM_READ="farm:read"
    FARM_CREATE="farm:create"
    FARM_DELETE="farm:delete"
    FARM_UPDATE="farm:update"

    EQUIPMENT_ALL="equipment:*"
    EQUIPMENT_READ="equipment:read"
    EQUIPMENT_CREATE="equipment:create"
    EQUIPMENT_DELETE="equipment:delete"
    EQUIPMENT_UPDATE="equipment:update"

    FIELD_HAND_ALL="field_hand:*"
    FIELD_HAND_READ = "field_hand:read"
    FIELD_HAND_CREATE = "field_hand:create"
    FIELD_HAND_DELETE = "field_hand:delete"
    FIELD_HAND_UPDATE = "field_hand:update"

    FIELD_JOB_ALL="field_job:*"
    FIELD_JOB_READ = "field_job:read"
    FIELD_JOB_CREATE = "field_job:create"
    FIELD_JOB_DELETE = "field_job:delete"
    FIELD_JOB_UPDATE = "field_job:update"
    FIELD_JOB_CHANGE_STATUS = "field_job:change_status"
    FIELD_JOB_ASSIGN_SERVICE_REPORT = "field_job:assign_service_report"

    SERVICE_REPORT_ALL="service_report:*"
    SERVICE_REPORT_READ = "service_report:read"
    SERVICE_REPORT_CREATE = "service_report:create"
    SERVICE_REPORT_DELETE = "service_report:delete"
    SERVICE_REPORT_UPDATE = "service_report:update"
