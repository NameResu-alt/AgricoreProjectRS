import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { ServiceReportCreate, ServiceReportRead } from "../api/schemas/service_report";
import type { DialogDefinition } from "./DialogComponent";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton, type GenericGridColumn } from "./GenericDataGridComponent";
import { ApiRounded } from "@mui/icons-material";

export default function ServiceReportTab(){
    const {user} = useAuth()
    const [data, setData] = useState<ServiceReportRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)

    const functions = createDefaultFunctions("/service_reports", setData)

    const createDialog: DialogDefinition<ServiceReportCreate> = {
        title: () => "Create Service Report",
        fields: [
            {
                field: "file_url",
                headerName: "File URL",
                type: "text"
            },
            {
                field: "notes",
                headerName: "Notes",
                type: "text"
            },
            {
                field: "timestamp",
                headerName: "Timestamp",
                type: "text"
            },
            {
                field: "field_job_id",
                headerName: "Field Job ID",
                type: "number"
            }
        ],
        submitAction: async (value, id)=>{
            await functions.post(value)
        },
        actionName: "Create",
        onDialogClose: ()=>setDialogOpen(false),
        destroyDialog: ()=>setCurrentDialogDefinition(null),
        onErrorOccurred: (err, setErrorMessage)=>{
            if(err.code == "FOREIGN_KEY_VIOLATION"){
                setErrorMessage(`There's no matching field job with provided id`)
            }
            else{
                setErrorMessage("An error occurred")
            }
        }
    }


    const updateDialog: DialogDefinition<ServiceReportCreate> = {
        title: (start) => `Update Service Report ${start?.id}`,
        fields: [
            {
                field: "file_url",
                headerName: "File URL",
                type: "text"
            },
            {
                field: "notes",
                headerName: "Notes",
                type: "text"
            },
            {
                field: "timestamp",
                headerName: "Timestamp",
                type: "text"
            },
            {
                field: "field_job_id",
                headerName: "Field Job ID",
                type: "number"
            }
        ],
        submitAction: async (value, id)=>{
            await functions.put(value,id!)
        },
        actionName: "Update",
        onDialogClose: ()=>setDialogOpen(false),
        destroyDialog: ()=>setCurrentDialogDefinition(null),
        onErrorOccurred: (err, setErrorMessage)=>{
            if(err.code == "FOREIGN_KEY_VIOLATION"){
                setErrorMessage(`There's no matching field job with provided id`)
            }
            else{
                setErrorMessage("An error occurred")
            }
        }
    }

    const columnDefinitions: GenericGridColumn<ServiceReportRead>[] = [
        {
            field: "id",
            headerName: "ID",
            type:"number",
            width: 30
        },
        {
            field: "file_url",
            headerName: "File URL",
        },
        {
            field: "notes",
            headerName:"Notes"
        },
        {
            field:"timestamp",
            headerName:"Timestamp",
            type: "dateTime",
            valueGetter: (value, row, column, apiRef)=>{
                return new Date(value)
            }
        },
        {
            field: "field_job_id",
            headerName:"Field Job ID",
            type:"number"
        }
    ]

    if(user?.role == "Admin")
    {
        columnDefinitions.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        columnDefinitions.push(GenericDeleteButton(functions.delete))
    }

    useEffect(()=>{
        functions.get()
    }
    ,[])


    return (
        <GenericTabBody 
            userRole = {user?.role}
            data = {data}
            gridColumnDefinition = {columnDefinitions}
            createDialog = {createDialog}
            currentDialogDefinition = {currentDialogDefinition}
            setCurrentDialogDefinition = {setCurrentDialogDefinition}
            dialogOpen = {dialogOpen}
            setDialogOpen = {setDialogOpen}
        />
    )
}