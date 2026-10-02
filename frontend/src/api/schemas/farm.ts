interface FarmBase{
    name: string
    location_region: string
    capacity: number
    supervisor_id: number   
}

interface FarmRead extends FarmBase{
    id: number
}

interface FarmCreate extends FarmBase{

}

interface FarmUpdate extends FarmBase{

}

interface FarmMaintenanceRatio{
    maintenance_count: number
    total: number
}

export type {FarmRead, FarmCreate, FarmMaintenanceRatio, FarmUpdate}