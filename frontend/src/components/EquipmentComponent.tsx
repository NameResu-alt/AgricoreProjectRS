import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { EquipmentStatus, type EquipmentCreate, type EquipmentRead, type EquipmentUpdate } from "../api/schemas/equipment";
import { type DialogDefinition } from "./DialogComponent";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import type { GenericGridColumn } from "./GenericDataGridComponent";
import { Button } from "@mui/material";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton } from "./GenericDataGridComponent";

export default function EquipmentTab(){
    const {user} = useAuth()
    const [data, setData] = useState<EquipmentRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)

    const functions = createDefaultFunctions("/equipment", setData)

    const createDialog: DialogDefinition<EquipmentCreate> = {
        title: "Create Equipment",
        fields: [
            {
                field: "serial_number",
                headerName: "Serial Number",
                type:"text"
            },
            {
                field: "model",
                headerName: "Model",
                type:"text"
            },
            {
                field: "status",
                headerName: "Status",
                type: "text",
                options: Object.values(EquipmentStatus)
            },
            {
                field: "fuel_level",
                headerName: "Fuel Level",
                type:"number"
            },
            {
                field: "facility_id",
                headerName: "Facility ID",
                type:"number"
            }
        ],
        submitAction: (value, id) => {
            functions.post(value)
            setDialogOpen(false)
        },
        actionName: "Create",
        onClose: ()=>setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }

    const updateDialog: DialogDefinition<EquipmentUpdate> = {
        title: "Update Equipment",
        fields: [
            {
                field: "serial_number",
                headerName: "Serial Number",
                type:"text"
            },
            {
                field: "model",
                headerName: "Model",
                type:"text"
            },
            {
                field: "status",
                headerName: "Status",
                type: "text",
                options: Object.values(EquipmentStatus)
            },
            {
                field: "fuel_level",
                headerName: "Fuel Level",
                type:"number"
            },
            {
                field: "facility_id",
                headerName: "Facility ID",
                type:"number"
            }
        ],
        submitAction: (value, id) => {
            functions.put(value,id!)
            setDialogOpen(false)
        },
        actionName: "Update",
        onClose: ()=>setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }


    const gridColumnDefinition: GenericGridColumn<EquipmentRead>[] = [
        {
            field:"id",
            headerName:"ID",
            width:30
        },
        {
            field:"serial_number",
            headerName: "Serial Number"
        },
        {
            field:"model",
            headerName:"Model",
        },
        {
            field:"status",
            headerName:"Status"
        },
        {
            field:"fuel_level",
            headerName:"Fuel Level"
        },
        {
            field: "facility_id",
            headerName:"Facility ID",
            type:"number"
        },
    ]

    if(user?.role == "Admin")
    {
        gridColumnDefinition.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        gridColumnDefinition.push(GenericDeleteButton(functions.delete))
    }

    useEffect(()=>{
        functions.get()
    },[])

    return (
        <>
            <GenericTabBody<EquipmentRead>
                userRole={user?.role} data={data}
                gridColumnDefinition={gridColumnDefinition}
                createDialog={createDialog}
                currentDialogDefinition={currentDialogDefinition}
                setCurrentDialogDefinition={setCurrentDialogDefinition}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
            />
        </>
    )

}