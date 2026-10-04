import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole, type UserCreate, type UserRead } from "../api/schemas/auth";
import type { DialogDefinition } from "./DialogComponent";
import apiClient from "../api/client";
import { GenericDeleteButton, GenericTabBody, type GenericGridColumn } from "./GenericDataGridComponent";

export default function UserTab() {
    const { user } = useAuth()
    const [data, setData] = useState<UserRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)


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
        title: ()=>"Create User",
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
                field: "role",
                headerName: "Role",
                type: "text",
                options: Object.values(UserRole)
            }
        ],
        submitAction: async (value, id) => {
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
        GenericDeleteButton(deleteUser)
    ]

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
            />
        </>
    )

}