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

class FarmBaseV2 {
    name: string;
    location_region: string;
    capacity: number;
    supervisor_id: number;

    constructor(
        name: string,
        location_region: string,
        capacity: number,
        supervisor_id: number
    ) {
        this.name = name;
        this.location_region = location_region;
        this.capacity = capacity;
        this.supervisor_id = supervisor_id;
    }
}

class FarmReadV2 extends FarmBaseV2{
    id: number;

    constructor(id: number, name: string, location_region: string, capacity: number, supervisor_id: number){
        super(name, location_region, capacity, supervisor_id)
        this.id = id
    }
}


interface FarmMaintenanceRatio{
    maintenance_count: number
    total: number
}

export type {FarmRead, FarmCreate, FarmMaintenanceRatio, FarmUpdate}