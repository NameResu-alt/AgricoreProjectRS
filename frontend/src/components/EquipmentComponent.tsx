import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { EquipmentStatus, type EquipmentCreate, type EquipmentRead, type EquipmentUpdate } from "../api/schemas/equipment";
import { type DialogDefinition } from "./DialogComponent";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import type { GenericGridColumn } from "./GenericDataGridComponent";
import { Button } from "@mui/material";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton } from "./GenericDataGridComponent";
import { HTTPException } from "../api/schemas/errors";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

export default function EquipmentTab(){
    const {user} = useAuth()
    const [data, setData] = useState<EquipmentRead[]>([])
    const [errorOccurred, setErrorOccurred] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)

    const functions = createDefaultFunctions("/equipment", setData)

    const createDialog: DialogDefinition<EquipmentCreate> = {
        title: () => "Create Equipment",
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
        submitAction: async (value, id) => {
            await functions.post(value)
        },
        actionName: "Create",
        onDialogClose: ()=>setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
        onErrorOccurred: (err, setErrorMessage)=>{
            if(err.code == "FOREIGN_KEY_VIOLATION"){
                setErrorMessage(`There's no matching facility with provided id`)
            }
            else{
                setErrorMessage("An error occurred")
            }
        }
    }

    const updateDialog: DialogDefinition<EquipmentUpdate> = {
        title: (start) => `Update Equipment ${start?.id}`,
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
        submitAction: async (value, id) => {
            await functions.put(value,id!)
        },
        actionName: "Update",
        onDialogClose: ()=>setDialogOpen(false),
        setErrorState: setErrorOccurred,
        onErrorOccurred: (err, setErrorMessage)=>{
            if(err.code == "FOREIGN_KEY_VIOLATION"){
                setErrorMessage(`There's no matching facility with provided id`)
            }
            else{
                setErrorMessage("An error occurred")
            }
        },
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
            headerName:"Fuel Level",
            renderCell: (params)=>{
                return (
                    <CircularProgressWithLabel sx={{alignSelf:"center"}} value={params.row.fuel_level}></CircularProgressWithLabel>
                )
            }
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