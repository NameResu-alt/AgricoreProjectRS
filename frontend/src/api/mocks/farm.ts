import { type FarmRead, type FarmCreate} from '../schemas/farm';

let farm_mocks: FarmRead[] = [
    {
        id: 1,
        name: "Farm1",
        location_region: "Location_Region",
        capacity: 20,
        supervisor_id: 1
    },
    {
        id: 2,
        name: "Farm2",
        location_region: "Location_Region",
        capacity: 10,
        supervisor_id: 1
    }
];

export {farm_mocks}