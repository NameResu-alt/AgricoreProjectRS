import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { type DialogDefinition } from "./DialogComponent";
import type { FieldHandCreate, FieldHandRead, FieldHandUpdate } from "../api/schemas/field_hand";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton, type GenericGridColumn } from "./GenericDataGridComponent";

export default function FieldHandTab() {
    const { user } = useAuth()
    const [data, setData] = useState<FieldHandRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)

    const functions = createDefaultFunctions("/field_hands", setData)

    const createDialog: DialogDefinition<FieldHandCreate> = {
        title: "Create Field Hand",
        fields: [
            {
                field: "name",
                headerName: "Name",
                type: "text"
            },
            {
                field: "facility_id",
                headerName: "Facility ID",
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

    const updateDialog: DialogDefinition<FieldHandUpdate> = {
        title: "Create Field Hand",
        fields: [
            {
                field: "name",
                headerName: "Name",
                type: "text"
            },
            {
                field: "facility_id",
                headerName: "Facility ID",
                type: "number"
            }
        ],
        submitAction: (value, id) => {
            functions.put(value, id!)
            setDialogOpen(false)
        },
        actionName: "Create",
        onClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null)
    }

    const gridColumnDefinition: GenericGridColumn<FieldHandRead>[] = [
        {
            field: "id",
            headerName: "ID",
            type: "number",
            width: 30
        },
        {
            field: "name",
            headerName: "Name"
        },
        {
            field: "facility_id",
            headerName: "Facility ID",
            type: "number"
        }
    ]


    if(user?.role == "Admin")
    {
        gridColumnDefinition.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        gridColumnDefinition.push(GenericDeleteButton(functions.delete))
    }



    useEffect(() => {
        functions.get()
    }, [])

    return (
        <>
            <GenericTabBody<FieldHandRead>
                userRole={user?.role} data={data}
                gridColumnDefinition={gridColumnDefinition}
                createDialog={createDialog}
                currentDialogDefinition={currentDialogDefinition}
                setCurrentDialogDefinition={setCurrentDialogDefinition}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
            />
        </>
    )

}