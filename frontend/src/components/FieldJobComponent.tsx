
import { Button } from "@mui/material";
import { UserRole } from "../api/schemas/auth";
import type { FieldJobRead, FieldJobCreate, FieldJobUpdate } from "../api/schemas/field_job"
import { FieldJobStatus, FieldJobPriority } from "../api/schemas/field_job"
import { useAuth } from "../context/AuthContext";
import GenericDataGridComponent, { DefaultDeleteButton, DefaultUpdateButton, type GenericGridColumn, type GridActions } from "./GenericDataGridComponent";

export default function FieldJobTab() {
    const { user } = useAuth()

    function definition(actions: GridActions<FieldJobRead>) {
        const columns: GenericGridColumn<FieldJobRead>[] = [
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
                headerName: "Status",
                patchable:true
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

        if (user?.role == UserRole.ADMIN) {
            columns.push(DefaultDeleteButton(actions))
            columns.push(DefaultUpdateButton(actions, "Update Field Job"))
        }

        if (user?.role == UserRole.FIELD_HAND) {
            columns.push(

                {
                    field: "patch",
                    headerName: "",
                    type: "actions",
                    width: 150,
                    renderCell: (params) => {
                        return (
                            <Button onClick={() => { actions.openDialog(params.row, "Update Job Status", "patch") }} sx={{ height: "100%", width: "100%", backgroundColor: "blue", color: "white" }}>Update Status</Button>
                        )
                        //<button onClick={()=>actions.onDelete(Number(params.id))}>Test</button>
                    }
                }
            )
        }

        return columns
    }

    const emptyModel: FieldJobRead = {
        id: 0,
        title: "",
        priority: FieldJobPriority.LOW,
        status: FieldJobStatus.IN_PROGRESS,
        equipment_id: 0,
        operator_id: 0
    }


    return (<GenericDataGridComponent<FieldJobRead, FieldJobCreate, FieldJobUpdate> urlBase={"/field_jobs"} emptyModel={emptyModel} columnDefinitions={definition} />)
}