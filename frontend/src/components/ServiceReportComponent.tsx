import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { ServiceReportCreate, ServiceReportRead } from "../api/schemas/service_report";
import type { DialogDefinition } from "./DialogComponent";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton, type GenericGridColumn } from "./GenericDataGridComponent";

export default function ServiceReportTab(){
    const {user} = useAuth()
    const [data, setData] = useState<ServiceReportRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)

    const functions = createDefaultFunctions("/service_reports", setData)

    const createDialog: DialogDefinition<ServiceReportCreate> = {
        title: "Create Service Report",
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
        submitAction: (value, id)=>{
            functions.post(value)
            setDialogOpen(false)
        },
        actionName: "Create",
        onClose: ()=>setDialogOpen(false),
        destroyDialog: ()=>setCurrentDialogDefinition(null)
    }


    const updateDialog: DialogDefinition<ServiceReportCreate> = {
        title: "Update Service Report",
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
        submitAction: (value, id)=>{
            functions.put(value,id!)
            setDialogOpen(false)
        },
        actionName: "Update",
        onClose: ()=>setDialogOpen(false),
        destroyDialog: ()=>setCurrentDialogDefinition(null)
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
            headerName:"Timestamp"
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