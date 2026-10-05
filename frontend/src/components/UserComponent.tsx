import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole, type UserCreate, type UserRead } from "../api/schemas/auth";
import type { DialogDefinition } from "./DialogComponent";
import apiClient from "../api/client";
import { GenericDeleteButton, GenericTabBody, type GenericGridColumn, type SnackbarState } from "./GenericDataGridComponent";
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from "@mui/material";
export default function UserTab() {
    const { user } = useAuth()
    const [data, setData] = useState<UserRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)
    const [snackbarState, setCurrentSnackbarState] = useState<SnackbarState>({ open: false, options: null })

    async function getUsers() {
        const response = await apiClient.get<UserRead[]>("/auth")
        setData(response.data)
    }

    async function createUser(value: UserCreate) {
        await apiClient.post<UserRead>("/auth/register", value)
        getUsers()
    }

    async function deleteUser(id: number) {
        await apiClient.delete(`/auth/${id}`)
        getUsers()
    }

    const createDialog: DialogDefinition<UserCreate> = {
        title: () => "Create User",
        fields: [
            {
                field: "username",
                headerName: "Username",
                type: "text"
            },
            {
                field: "password",
                headerName: "Password",
                type: "password"
            },
            {
                field: "confirm_password",
                headerName: "Confirm Password",
                type: "password"
            },
            {
                field: "role",
                headerName: "Role",
                type: "text",
                options: Object.values(UserRole)
            }
        ],
        submitAction: async (value, id) => {
            if (value.password != value.confirm_password) {

                setCurrentSnackbarState({
                    open: true,
                    options: {
                        message: "Password doesn't match",
                        severity: "error",
                        duration: 3000
                    }
                })
                return
            }
            await createUser(value)
        },
        actionName: "Create",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }

    const columnDefinitions: GenericGridColumn<UserRead>[] = [
        {
            field: "id",
            headerName: "ID",
            type: "number",
            width: 30
        },
        {
            field: "username",
            headerName: "Username"
        },
        {
            field: "role",
            headerName: "Role"
        },
        {
            field: "is_active",
            headerName: "Active"
        },
        {
            field: "created_date",
            headerName: "Created Date"
        },
        {
            field: "delete",
            headerName: "",
            type: "actions",
            width: 75,
            renderCell: (params) => {
                const button = <Button
                        onClick={async () => {
                            try {
                                await deleteUser(params.row.id)
                                setCurrentSnackbarState({
                                    open: true,
                                    options: {message:`Successfully deleted User ${params.row.id}`, severity:"success", duration: 3000}
                                })
                            }
                            catch (ex) {
                                setCurrentSnackbarState(
                                    {
                                        open: true,
                                        options: {message:`Failed to delete User ${params.row.id}`, severity:"error", duration: 3000}
                                    }
                                )
                            }

                        }}
                        sx={{ height: "75%", width: "50%" }}
                        variant={"contained"}
                        color={"error"}
                    >
                        <DeleteIcon></DeleteIcon>
                    </Button>

                return (
                    <>
                        {params.row.role != UserRole.ADMIN &&
                            button
                        }
                    </>
                )
            }
        }
    ]

    /** 
     * GenericDeleteButton((id)=>({message:`Successfully deleted User ${id}`, severity:"success", duration: 3000}),
            (id, ex)=>({message:`Failed to delete User ${id}`, severity:"error", duration: 3000}),
            setCurrentSnackbarState,
            deleteUser)
     * 
    */

    /** 
     * 
     * {
        field: "delete",
        headerName: "",
        type: "actions",
        width: 75,
        renderCell: (params) => {
            return (
                <Button
                    onClick={async () => {
                        try {
                            await deleteFunction(params.row.id)
                            setCurrentSnackbarState({
                                open: true,
                                options: successSnackbar(params.row.id)
                            })
                        }
                        catch (ex) {
                            setCurrentSnackbarState(
                                {
                                    open: true,
                                    options: failureSnackbar(params.row.id, ex)
                                }
                            )
                        }

                    }}
                    sx={{ height: "75%", width: "50%" }}
                    variant={"contained"}
                    color={"error"}
                >
                    <DeleteIcon></DeleteIcon>
                </Button>
            )
        }
    }
     * 
    */

    useEffect(() => {
        getUsers()
    }, [])


    return (
        <>
            <GenericTabBody
                userRole={user?.role}
                data={data}
                createDialog={createDialog}
                gridColumnDefinition={columnDefinitions}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                currentDialogDefinition={currentDialogDefinition}
                setCurrentDialogDefinition={setCurrentDialogDefinition}
                snackbarState={snackbarState}
                setSnackbarState={setCurrentSnackbarState}
            />
        </>
    )

}