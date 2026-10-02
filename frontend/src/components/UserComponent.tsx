import { Button } from "@mui/material";
import { UserRole, type UserCreate, type UserRead, type UserUpdate } from "../api/schemas/auth";
import { useAuth } from "../context/AuthContext";
import GenericDataGridComponent, { DefaultDeleteButton, type GenericGridColumn, type GridActions } from "./GenericDataGridComponent";

export default function UserTab() {
    const { user } = useAuth()

    function definition(actions: GridActions<UserRead>) {
        const columns: GenericGridColumn<UserRead>[] = [
            {
                field: "id",
                headerName: "ID",
                type: "number",
                width: 30
            },
            {
                field: "role",
                headerName: "Role"
            },
            {
                field: "is_active",
                headerName: "Active",
                width: 100
            },
            {
                field: "created_date",
                headerName: "Created Date"
            },
            DefaultDeleteButton(actions)
        ]

        return columns;
    }

    const emptyModel: UserRead = {
        id: 0,
        username: "",
        is_active: false,
        created_date: "",
        role: UserRole.AUDITOR
    }

    return (
        <GenericDataGridComponent<UserRead, UserCreate, UserUpdate> urlBase="/auth" postUrl="/auth/register" columnDefinitions={definition} emptyModel={emptyModel} />
    )

}