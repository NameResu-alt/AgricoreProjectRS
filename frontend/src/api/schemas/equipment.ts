const EquipmentStatus = {
    IDLE:"Idle",
    IN_USE:"In-Use",
    MAINTENANCE:"Maintenance",
    RETIRED:"Retired"
} as const;

interface EquipmentBase{
    serial_number: string
    model: string
    status: string
    fuel_level: number
    facility_id: number
}

interface EquipmentRead extends EquipmentBase{
    id: number
}

interface EquipmentCreate extends EquipmentBase{

}

interface EquipmentUpdate extends EquipmentBase{

}

interface EquipmentMetric{
    completion: number
    failure: number
}

type EquipmentStatus = typeof EquipmentStatus[keyof typeof EquipmentStatus];

export {EquipmentStatus}

export type {EquipmentRead, EquipmentCreate, EquipmentMetric, EquipmentUpdate}