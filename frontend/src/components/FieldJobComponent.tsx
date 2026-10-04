import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FieldJobPriority, FieldJobStatus, type FieldJobCreate, type FieldJobRead, type FieldJobUpdate, type FieldJobPatchStatus } from "../api/schemas/field_job";
import type { DialogDefinition } from "./DialogComponent";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import type { GenericGridColumn } from "./GenericDataGridComponent";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton } from "./GenericDataGridComponent";
import apiClient from "../api/client";
import Button from "@mui/material/Button";
import type { ServiceReportCreate } from "../api/schemas/service_report";

export default function FieldJobTab() {
    const { user } = useAuth()
    const [data, setData] = useState<FieldJobRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)

    const functions = createDefaultFunctions("/field_jobs", setData)

    const createDialog: DialogDefinition<FieldJobCreate> = {
        title: () => "Create Field Job",
        fields: [
            {
                field: "title",
                headerName: "Title",
                type: "text"
            },
            {
                field: "priority",
                headerName: "Priority",
                type: "text",
                options: Object.values(FieldJobPriority)
            },
            {
                field: "status",
                headerName: "Status",
                type: "text",
                options: Object.values(FieldJobStatus)
            },
            {
                field: "equipment_id",
                headerName: "Equipment ID",
                type: "number"
            },
            {
                field: "operator_id",
                headerName: "Operator ID",
                type: "number"
            }
        ],
        submitAction: async (value, id) => {
            await functions.post(value)
        },
        actionName: "Create",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
         onErrorOccurred: (err, setErrorMessage)=>{
            if(err.code == "FOREIGN_KEY_VIOLATION"){
                if(err.field == "equipment_id"){
                    setErrorMessage(`There's no matching equipment with provided id`)
                }
                else{
                    setErrorMessage(`There's no matching field hand with provided id`)
                }
                
            }
            else{
                setErrorMessage("An error occurred")
            }
        }
    }

    const updateDialog: DialogDefinition<FieldJobUpdate> = {
        title: (start) => `Update Field Job ${start?.id}`,
        fields: [
            {
                field: "title",
                headerName: "Title",
                type: "text"
            },
            {
                field: "priority",
                headerName: "Priority",
                type: "text",
                options: Object.values(FieldJobPriority)
            },
            {
                field: "status",
                headerName: "Status",
                type: "text",
                options: Object.values(FieldJobStatus)
            },
            {
                field: "equipment_id",
                headerName: "Equipment ID",
                type: "number"
            },
            {
                field: "operator_id",
                headerName: "Operator ID",
                type: "number"
            }
        ],
        submitAction: async (value, id) => {
            await functions.put(value, id!)
        },
        actionName: "Update",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
         onErrorOccurred: (err, setErrorMessage)=>{
            if(err.code == "FOREIGN_KEY_VIOLATION"){
                if(err.field == "equipment_id"){
                    setErrorMessage(`There's no matching equipment with provided id`)
                }
                else{
                    setErrorMessage(`There's no matching field hand with provided id`)
                }
                
            }
            else{
                setErrorMessage("An error occurred")
            }
        }
    }

    async function patchFieldJobStatus(value: FieldJobPatchStatus, id: number) {
        await apiClient.patch(`/field_jobs/${id}`, value)
        functions.get()
    }

    const fieldJobStatusPatchDialog: DialogDefinition<FieldJobPatchStatus> = {
        title: (start) => `Update Field Job Status ${start?.id}`,
        fields: [
            {
                field: "status",
                headerName: "Status",
                type: "text",
                options: Object.values(FieldJobStatus)
            }
        ],
        submitAction: async (value, id) => {
            await patchFieldJobStatus(value, id!)
        },
        actionName: "Update",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }

    const fieldJobAttachReportDialog: DialogDefinition<ServiceReportCreate> = {
        title: (start) => `Create Service Report For ${start?.value.field_job_id}`,
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
                type: "number",
                editable: false
            }
        ],
        submitAction: async (value, id) => {
            await apiClient.post("/service_reports", value)
        },
        actionName: "Create",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
         onErrorOccurred: (err, setErrorMessage)=>{
            if(err.code == "FOREIGN_KEY_VIOLATION"){
                if(err.field == "equipment_id"){
                    setErrorMessage(`There's no matching equipment with provided id`)
                }
                else{
                    setErrorMessage(`There's no matching field hand with provided id`)
                }
                
            }
            else{
                setErrorMessage("An error occurred")
            }
        }
    }

    const gridColumnDefinitions: GenericGridColumn<FieldJobRead>[] = [
        {
            field: "id",
            headerName: "ID",
            type: "number",
            width: 30
        },
        {
            field: "title",
            headerName: "Title"
        },
        {
            field: "priority",
            headerName: "Priority"
        },
        {
            field: "status",
            headerName: "Status"
        },
        {
            field: "equipment_id",
            headerName: "Equipment ID",
            type: "number"
        },
        {
            field: "operator_id",
            headerName: "Operator ID",
            type: "number"
        }
    ]

    const writeReport: GenericGridColumn<FieldJobRead> = {
        field: "create",
        headerName: "",
        type: "actions",
        width: 150,
        renderCell: (params) => {
            return (<Button variant={"outlined"} onClick={
                () => {
                    setCurrentDialogDefinition({
                        ...fieldJobAttachReportDialog,
                        startingValue: {
                            value: {
                                field_job_id: params.row.id
                            },
                            id: params.row.id
                        }
                    })
                    setDialogOpen(true)
                }
            }
            
            sx={{height: "90%", width:"100%"}}
            >
                Write Report</Button>)
        }
    }

    if (user?.role == "Admin") {
        gridColumnDefinitions.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        gridColumnDefinitions.push(writeReport)
        gridColumnDefinitions.push(GenericDeleteButton(functions.delete))
    }
    else if (user?.role == "Field_Hand") {
        const patchOnly: GenericGridColumn<FieldJobRead> = {
            field: "patch",
            headerName: "",
            type: "actions",
            width: 150,
            renderCell: (params) => {
                return (
                    <Button
                        onClick={() => {
                            setCurrentDialogDefinition({
                                ...fieldJobStatusPatchDialog,
                                startingValue: {
                                    value: params.row,
                                    id: params.row.id
                                }
                            })
                            setDialogOpen(true)
                        }}
                        sx={{ height: "100%", width: "100%", backgroundColor: "blue", color: "white" }}
                    >Update Status</Button>
                )
            }
        }

        gridColumnDefinitions.push(patchOnly)
        gridColumnDefinitions.push(writeReport)
    }


    useEffect(() => {
        functions.get()
    }, [])


    return (
        <GenericTabBody
            userRole={user?.role}
            data={data}
            gridColumnDefinition={gridColumnDefinitions}
            createDialog={createDialog}
            currentDialogDefinition={currentDialogDefinition}
            setCurrentDialogDefinition={setCurrentDialogDefinition}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
        />
    )



}