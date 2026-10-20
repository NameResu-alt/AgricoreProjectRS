export interface LoginCredentials {
    username: string
    password: string
}

const Permission = {
    HEALTH_READ: "health:read",
    BUSINESS_READ: "business:read",

    USER_ALL: "user:*",
    USER_READ: "user:read",
    USER_CREATE: "user:create",
    USER_DELETE: "user:delete",
    USER_UPDATE: "user:update",

    ROLE_ALL: "role:*",
    ROLE_READ: "role:read",
    ROLE_CREATE: "role:create",
    ROLE_DELETE: "role:delete",
    ROLE_UPDATE: "role:update",

    FARM_ALL: "farm:*",
    FARM_READ: "farm:read",
    FARM_CREATE: "farm:create",
    FARM_DELETE: "farm:delete",
    FARM_UPDATE: "farm:update",

    EQUIPMENT_ALL: "equipment:*",
    EQUIPMENT_READ: "equipment:read",
    EQUIPMENT_CREATE: "equipment:create",
    EQUIPMENT_DELETE: "equipment:delete",
    EQUIPMENT_UPDATE: "equipment:update",

    FIELD_HAND_ALL: "field_hand:*",
    FIELD_HAND_READ: "field_hand:read",
    FIELD_HAND_CREATE: "field_hand:create",
    FIELD_HAND_DELETE: "field_hand:delete",
    FIELD_HAND_UPDATE: "field_hand:update",

    FIELD_JOB_ALL: "field_job:*",
    FIELD_JOB_READ: "field_job:read",
    FIELD_JOB_CREATE: "field_job:create",
    FIELD_JOB_DELETE: "field_job:delete",
    FIELD_JOB_UPDATE: "field_job:update",
    FIELD_JOB_CHANGE_STATUS: "field_job:change_status",
    FIELD_JOB_ASSIGN_SERVICE_REPORT: "field_job:assign_service_report",

    SERVICE_REPORT_ALL: "service_report:*",
    SERVICE_REPORT_READ: "service_report:read",
    SERVICE_REPORT_CREATE: "service_report:create",
    SERVICE_REPORT_DELETE: "service_report:delete",
    SERVICE_REPORT_UPDATE: "service_report:update",
} as const;

export const PermissionGroups = {
    HEALTH: [
        Permission.HEALTH_READ
    ],
    BUSINESS: [
        Permission.BUSINESS_READ
    ],
    USERS: [
        Permission.USER_ALL,
        Permission.USER_READ,
        Permission.USER_CREATE,
        Permission.USER_DELETE,
        Permission.USER_UPDATE
    ],
    ROLES: [
        Permission.ROLE_ALL,
        Permission.ROLE_READ,
        Permission.ROLE_CREATE,
        Permission.ROLE_DELETE,
        Permission.ROLE_UPDATE
    ],
    FARMS: [
        Permission.FARM_ALL,
        Permission.FARM_READ,
        Permission.ROLE_CREATE,
        Permission.ROLE_DELETE,
        Permission.ROLE_UPDATE
    ],
    EQUIPMENT: [
        Permission.EQUIPMENT_ALL,
        Permission.EQUIPMENT_READ,
        Permission.EQUIPMENT_CREATE,
        Permission.EQUIPMENT_DELETE,
        Permission.EQUIPMENT_UPDATE
    ],
    FIELD_HANDS: [
        Permission.FIELD_HAND_ALL,
        Permission.FIELD_HAND_READ,
        Permission.FIELD_HAND_CREATE,
        Permission.FIELD_HAND_DELETE,
        Permission.FIELD_HAND_UPDATE,
        Permission.FIELD_JOB_CHANGE_STATUS,
        Permission.FIELD_JOB_ASSIGN_SERVICE_REPORT
    ],
    FIELD_JOBS: [
        Permission.FIELD_JOB_ALL,
        Permission.FIELD_JOB_READ,
        Permission.FIELD_JOB_CREATE,
        Permission.FIELD_JOB_DELETE,
        Permission.FIELD_JOB_UPDATE
    ],
    SERVICE_REPORTS: [
        Permission.SERVICE_REPORT_ALL,
        Permission.SERVICE_REPORT_READ,
        Permission.SERVICE_REPORT_CREATE,
        Permission.SERVICE_REPORT_DELETE,
        Permission.SERVICE_REPORT_UPDATE
    ]
}

export interface JWTPayload {
    sub: string
    role: string
    permissions: string[]
    exp: number
}

export interface UserInformation {
    sub: string
    role: string
    permissions: Permission[]
    exp: number
}
/**
 * 
 * class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole

class UserRead(BaseModel):
    username: str
    role: UserRole
    is_active: bool
    created_date: datetime
 */


interface UserCreate {
    username: string
    password: string
    confirm_password: string
    role: string
}

/**
 * class RoleRead(BaseModel):
    name: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
 */

interface RoleRead {
    name: string,
    permissions: string[]
    is_active: boolean
}

interface RoleCreate{
    name: string,
    permissions: string[]
}

interface RoleUpdate{
    name: string,
    permissions: string[]
}

interface UserRead {
    id: number
    username: string
    is_active: boolean
    created_date: string
    role: RoleRead

}

interface UserUpdate {

}

//type UserRole = typeof UserRole[keyof typeof UserRole]
type Permission = typeof Permission[keyof typeof Permission]

export type { UserRead, UserCreate, UserUpdate }
//export {UserRole}
export { Permission }