import { Button } from "@mui/material";
import type { EquipmentRead, EquipmentCreate, EquipmentUpdate } from "../api/schemas/equipment";
import GenericDataGridComponent from "./GenericDataGridComponent";
import type { GenericGridColumn, GridActions } from "./GenericDataGridComponent";
import {DefaultUpdateButton, DefaultDeleteButton} from "./GenericDataGridComponent"
import { useAuth } from '../context/AuthContext';

export default function EquipmentTab() {
    const {user} = useAuth()

    function definition(actions: GridActions<EquipmentRead>) {
        const columns: GenericGridColumn<EquipmentRead>[] = [
            {
                field: "id",
                headerName: "ID",
                type: "number",
                width: 30
            },
            {
                field: "serial_number",
                headerName: "Serial Number"
            },
            {
                field: "model",
                headerName: "Model"
            },
            {
                field: "status",
                headerName: "Status"
            },
            {
                field: "fuel_level",
                headerName: "Fuel Level",
                type: "number"
            },
            {
                field: "facility_id",
                headerName: "Facility ID",
                type: "number"
            }
        ]

        if(user?.role == "Admin"){
            columns.push(DefaultDeleteButton(actions))
            columns.push(DefaultUpdateButton(actions, "Update Farm"))
        }

        return columns
    }

    /**
     * interface EquipmentBase{
    serial_number: string
    model: string
    status: string
    fuel_level: number
    facility_id: number
}

interface EquipmentRead extends EquipmentBase{
    id: number
}

     */

    const emptyModel: EquipmentRead = {
        id: 0,
        serial_number: "",
        model: "",
        status: "Idle",
        fuel_level: 0,
        facility_id: 0
    }


    return (
        <GenericDataGridComponent<EquipmentRead, EquipmentCreate, EquipmentUpdate> urlBase={"/equipment"} columnDefinitions={definition} emptyModel={emptyModel} />
    )
}