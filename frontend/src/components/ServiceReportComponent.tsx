import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { ServiceReportCreate, ServiceReportRead } from "../api/schemas/service_report";
import type { DialogDefinition } from "./DialogComponent";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton, type GenericGridColumn, type SnackbarState } from "./datagrid/GenericDataGridComponent";
import apiClient from "../api/client";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Button } from "@mui/material";

export default function ServiceReportTab() {
    const { user } = useAuth()
    const [data, setData] = useState<ServiceReportRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)
    const [snackbarState, setCurrentSnackbarState] = useState<SnackbarState>({ open: false, options: null })
    const[getSignal, setGetSignal] = useState(0)
    

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
            },
            {
                field: "diagnostic_report",
                headerName: "",
                type: "file"
            }
        ],
        submitAction: async (value, _) => {
            const formData = new FormData();

            const { diagnostic_report, ...payload } = value;

            formData.append("payload", JSON.stringify(payload));

            if (diagnostic_report instanceof File) {
                formData.append("diagnostic_report", diagnostic_report);
            }

            const result = await apiClient.post<ServiceReportRead>("/service_reports", formData);

            setData((prev) => [...prev, result.data])

            setCurrentSnackbarState({
                open: true,
                options: {
                    message: `Successfully created Service Report`,
                    severity: "success",
                    duration: 2000
                }
            })
        },
        actionName: "Create",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
        onErrorOccurred: (err, setErrorMessage) => {
            if (err.code == "FOREIGN_KEY_VIOLATION") {
                setErrorMessage(`There's no matching field job with provided id`)
            }
            else {
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
        submitAction: async (value, id) => {
            await functions.put(value, id!)
            setCurrentSnackbarState({
                open: true,
                options: {
                    message: `Successfully updated Service Report ${id}`,
                    severity: "success",
                    duration: 2000
                }
            })
        },
        actionName: "Update",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
        onErrorOccurred: (err, setErrorMessage) => {
            if (err.code == "FOREIGN_KEY_VIOLATION") {
                setErrorMessage(`There's no matching field job with provided id`)
            }
            else {
                setErrorMessage("An error occurred")
            }
        }
    }

    const columnDefinitions: GenericGridColumn<ServiceReportRead>[] = [
        {
            field: "id",
            headerName: "ID",
            type: "number",
            width: 30
        },
        {
            field: "file_url",
            headerName: "File URL",
        },
        {
            field: "notes",
            headerName: "Notes"
        },
        {
            field: "timestamp",
            headerName: "Timestamp",
            type: "dateTime",
            valueGetter: (value, _) => {
                return new Date(value)
            }
        },
        {
            field: "field_job_id",
            headerName: "Field Job ID",
            type: "number"
        },
        {
            field: "download",
            headerName: "",
            type: "actions",
            width: 75,
            renderCell: (params) => {
                return (
                    <Button
                        sx={{ height: "75%", width: "50%" }}
                        variant={"contained"}
                        color={"success"}
                        onClick={async () => {
                            const result = await apiClient.get(`/service_reports/${params.id}/download`, {
                                responseType: "blob",
                            });

                            const blobUrl = window.URL.createObjectURL(result.data);
                            const disposition = result.headers["content-disposition"];
                            
                            const match = disposition?.match(/filename="([^"]+)"/);
                            const filename = match?.[1] ?? "diagnostic-report";

                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = filename;

                            document.body.appendChild(link);
                            link.click();
                            link.remove();

                            window.URL.revokeObjectURL(blobUrl);

                        }}
                    >
                        <CloudDownloadIcon sx={{ color: "text.primary" }} />
                    </Button>
                )
            }
        }
    ]

    if (user?.role == "Admin") {
        columnDefinitions.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        columnDefinitions.push(GenericDeleteButton(
            (id) => ({ message: `Successfully deleted Service Report ${id}`, severity: "success", duration: 3000 }),
            (id, _) => ({ message: `Failed to delete Service Report ${id}`, severity: "error", duration: 3000 }),
            setCurrentSnackbarState,
            functions.delete))
    }

    useEffect(() => {
        functions.get()
    }
        , [])


    return (
        <GenericTabBody
            userRole={user?.role}
            data={data}
            gridColumnDefinition={columnDefinitions}
            createDialog={createDialog}
            currentDialogDefinition={currentDialogDefinition}
            setCurrentDialogDefinition={setCurrentDialogDefinition}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            snackbarState={snackbarState}
            setSnackbarState={setCurrentSnackbarState}

            setData={setData}
            getSignal={getSignal}
            getURL="/service_reports"
        />
    )
}