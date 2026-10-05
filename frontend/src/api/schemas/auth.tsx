export interface LoginCredentials{
    username: string
    password: string
}

export interface JWTPayload{
    sub: string,
    role: UserRole,
    exp: number
}

/**
 * class UserRole(str, Enum):
    ADMIN = "Admin",
    FIELD_HAND = "Field_Hand",
    AUDITOR = "Auditor"
 */

const UserRole = {
    ADMIN:"Admin",
    FIELD_HAND: "Field_Hand",
    AUDITOR: "Auditor"

}as const;

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

interface UserBase{
    username: string
    role: UserRole
}

interface UserCreate extends UserBase{
    password: string
    confirm_password: string
}

interface UserRead extends UserBase{
    id: number
    is_active: boolean
    created_date: string
}

interface UserUpdate{

}

type UserRole = typeof UserRole[keyof typeof UserRole]

export type {UserRead, UserCreate, UserUpdate}
export {UserRole}