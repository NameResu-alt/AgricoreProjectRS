import { Permission } from "./auth"

interface RoleRead{
    id: number
    name: string
    created_date: string
    permissions: string[]
    is_active: boolean
}

interface RoleCreate{
    name: string
    permissions: string[]
}

interface RoleUpdate{
    name: string
    permissions: string[]
}

export type {RoleRead, RoleCreate, RoleUpdate}