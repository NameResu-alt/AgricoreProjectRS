import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import SettingsIcon from '@mui/icons-material/Settings';
import type { RoleRead } from "../../api/schemas/role";
import { Alert, Button, Snackbar } from "@mui/material";
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import type { GenericGridColumn, SnackbarState } from "../datagrid/GenericDataGridComponent";
import type { DataEnvelope } from "../../api/schemas/dataEnvelope";
import GenericDataGridV3 from "../datagrid/GenericDataGridComponent";
import RoleDialogComponent from "./RoleDialogComponent";
import apiClient from "../../api/client";
import { hasPermission } from "../../context/AuthContext";
import { Permission } from "../../api/schemas/auth";
import WysiwygIcon from '@mui/icons-material/Wysiwyg';


export default function RoleComponent() {

    const [data, setData] = useState<DataEnvelope<RoleRead>>(() => ({
        total: 0,
        data: []
    }))
    const [currentUpdateRole, setCurrentUpdateRole] = useState<RoleRead | undefined>(undefined)
    const [snackbarState, setCurrentSnackbarState] = useState<SnackbarState>({ open: false, options: null })
    const [getSignal, setGetSignal] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [readOnlyMode, setReadOnlyMode] = useState(false)

    const updateButton: GenericGridColumn<RoleRead> = {
        field: "update",
        headerName: "",
        type: "actions",
        width: 75,
        renderCell: (params) => {
            return (
                <Button onClick={() => {
                    setCurrentUpdateRole(params.row)
                    setReadOnlyMode(false)
                    setDialogOpen(true)
                }
                }
                    sx={{ height: "75%", width: "50%" }}
                    variant={"contained"}
                    color={"primary"}
                >
                    <SettingsIcon sx={{ color: "text.primary" }}></SettingsIcon>
                </Button>
            )
            //<button onClick={()=>actions.onDelete(Number(params.id))}>Test</button>
        },
    }

    const viewPermissionsButton: GenericGridColumn<RoleRead> = {
        field: "patch",
        headerName: "",
        type: "actions",
        width: 75,
        renderCell: (params) => {
            return (
                <Button onClick={() => {
                    setCurrentUpdateRole(params.row)
                    setReadOnlyMode(true)
                    setDialogOpen(true)
                }
                }
                    sx={{ height: "75%", width: "50%" }}
                    variant={"contained"}
                    color={"secondary"}
                >
                    <WysiwygIcon sx={{ color: "text.primary" }}></WysiwygIcon>
                </Button>
            )
        }
    }

    const deleteButton: GenericGridColumn<RoleRead> = {
        field: "delete",
        headerName: "",
        type: "actions",
        width: 75,
        renderCell: (params) => {
            return (
                <Button
                    onClick={async () => {

                        try {
                            await apiClient.delete(`/roles/${params.row.id}`)
                            setGetSignal((prev) => prev + 1)
                            setCurrentSnackbarState({
                                open: true,
                                options: {
                                    message: `Successfully deleted Role ${params.row.id}`,
                                    severity: "success",
                                    duration: 3000,
                                }
                            })
                        }
                        catch (ex) {
                            setCurrentSnackbarState(
                                {
                                    open: true,
                                    options: {
                                        message: `Failed to delete Role ${params.row.id}`,
                                        severity: "error",
                                        duration: 3000
                                    }
                                }
                            )
                        }
                    }}
                    sx={{ height: "75%", width: "50%" }}
                    variant={"contained"}
                    color={"error"}
                >
                    <DeleteIcon sx={{ color: "text.primary" }}></DeleteIcon>
                </Button>
            )
        }
    }

    const gridColumns: GenericGridColumn<RoleRead>[] = [
        {
            field: "id",
            headerName: "ID",
            type: "number"
        },
        {
            field: "name",
            headerName: "Name"
        },
        {
            field: "created_date",
            headerName: "Created Date",
            type: "dateTime",
            valueGetter: (value, _) => {
                return new Date(value)
            }
        },
        viewPermissionsButton,
        {
            field: "is_active",
            headerName: "Is Active",
            type: "boolean"
        },
    ]

    if (hasPermission(Permission.ROLE_UPDATE)) {
        gridColumns.push(updateButton)
    }
    if (hasPermission(Permission.ROLE_DELETE)) {
        gridColumns.push(deleteButton)
    }


    return (
        <>
            {
                hasPermission(Permission.ROLE_CREATE) &&
                <Button
                    onClick={() => {
                        setReadOnlyMode(false)
                        setDialogOpen(true)
                    }}
                    variant={"contained"}
                    color={"success"}
                    fullWidth
                >
                    Create
                </Button>
            }
            <GenericDataGridV3
                dataEnvelope={data}
                columns={gridColumns}
                setData={setData}
                getURL="/roles"
                getSignal={getSignal}
            />

            <RoleDialogComponent
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false)

                }}
                onExited={() => {
                    setCurrentUpdateRole(undefined)
                }}
                role={currentUpdateRole}
                setGetSignal={setGetSignal}
                setSnackbarState={setCurrentSnackbarState}
                readOnly={readOnlyMode}
            />

            <Snackbar
                open={snackbarState.open}
                autoHideDuration={snackbarState.options?.duration ?? 3000}
                onClose={() => setCurrentSnackbarState({ open: false, options: snackbarState.options })}
                slotProps={{
                    transition: {
                        onExited: () => setCurrentSnackbarState({ open: false, options: null })
                    }
                }}
            >
                <Alert severity={snackbarState.options?.severity} variant={"filled"}>{snackbarState.options?.message}</Alert>
            </Snackbar>
        </>

    )

}