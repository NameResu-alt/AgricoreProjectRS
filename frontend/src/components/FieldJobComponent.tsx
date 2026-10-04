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
        title: "Create Field Job",
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
        submitAction: (value, id) => {
            functions.post(value)
            setDialogOpen(false)
        },
        actionName: "Create",
        onClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }

    const updateDialog: DialogDefinition<FieldJobUpdate> = {
        title: "Update Field Job",
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
        submitAction: (value, id) => {
            functions.put(value, id!)
            setDialogOpen(false)
        },
        actionName: "Update",
        onClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }

    async function patchFieldJobStatus(value: FieldJobPatchStatus, id: number) {
        await apiClient.patch(`/field_jobs/${id}`, value)
        functions.get()
    }

    const fieldJobStatusPatchDialog: DialogDefinition<FieldJobPatchStatus> = {
        title: "Update Field Job Status",
        fields: [
            {
                field: "status",
                headerName: "Status",
                type: "text",
                options: Object.values(FieldJobStatus)
            }
        ],
        submitAction: (value, id) => {
            patchFieldJobStatus(value, id!)
            functions.get()
            setDialogOpen(false)
        },
        actionName: "Update",
        onClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }

    const fieldJobAttachReportDialog: DialogDefinition<ServiceReportCreate> = {
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
                type: "number",
                editable: false
            }
        ],
        submitAction: async (value, id)=>{
            await apiClient.post("/service_reports", value)
            setDialogOpen(false)
        },
        actionName: "Create",
        onClose: ()=>setDialogOpen(false),
        destroyDialog: ()=>setCurrentDialogDefinition(null)
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

    if (user?.role == "Admin") {
        gridColumnDefinitions.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
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

        const writeReport: GenericGridColumn<FieldJobRead> = {
            field: "create",
            headerName:"",
            type:"actions",
            width: 150,
            renderCell: (params)=>{
                return (<Button variant={"outlined"} onClick={
                    ()=>{
                        setCurrentDialogDefinition({
                            ...fieldJobAttachReportDialog,
                            startingValue:{
                                value: {
                                    field_job_id: params.row.id
                                },
                                id: params.row.id
                            }
                        })
                        setDialogOpen(true)
                    }
                }>
                Write Report</Button>)
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