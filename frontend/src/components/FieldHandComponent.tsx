import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { type DialogDefinition } from "./DialogComponent";
import type { FieldHandCreate, FieldHandRead, FieldHandUpdate } from "../api/schemas/field_hand";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton, type GenericGridColumn, type SnackbarState } from "./GenericDataGridComponent";

export default function FieldHandTab() {
    const { user } = useAuth()
    const [data, setData] = useState<FieldHandRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)
    const [snackbarState, setCurrentSnackbarState] = useState<SnackbarState>({ open: false, options: null })
    const functions = createDefaultFunctions("/field_hands", setData)

    const createDialog: DialogDefinition<FieldHandCreate> = {
        title: () => "Create Field Hand",
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
        submitAction: async (value, id) => {
            await functions.post(value)
            setCurrentSnackbarState({
                open: true,
                options: {
                    message:`Successfully created Field Hand`,
                    severity:"success",
                    duration:2000
                }
            })
        },
        actionName: "Create",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
        onErrorOccurred: (error, setErrorMessage) => {
            if (error.code == "FOREIGN_KEY_VIOLATION") {
                setErrorMessage(`There's no matching facility with provided id`)
            }
            else {
                setErrorMessage("An error occurred")
            }
        }
    }

    const updateDialog: DialogDefinition<FieldHandUpdate> = {
        title: (start) => `Update Field Hand ${start?.id}`,
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
        submitAction: async (value, id) => {
            await functions.put(value, id!)
            setCurrentSnackbarState({
                open: true,
                options: {
                    message:`Successfully updated Field Hand ${id}`,
                    severity:"success",
                    duration:2000
                }
            })
        },
        actionName: "Create",
        onDialogClose: () => setDialogOpen(false),
        destroyDialog: () => setCurrentDialogDefinition(null),
        onErrorOccurred: (error, setErrorMessage) => {
            if (error.code == "FOREIGN_KEY_VIOLATION") {
                setErrorMessage(`There's no matching facility with provided id`)
            }
            else {
                setErrorMessage("An error occurred")
            }
        }
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


    if (user?.role == "Admin") {
        gridColumnDefinition.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        gridColumnDefinition.push(GenericDeleteButton(
            (id) => ({ message: `Successfully deleted Field Hand ${id}`, severity: "success", duration: 3000 }),
            (id, ex) => ({ message: `Failed to delete Field Hand ${id}`, severity: "error", duration: 3000 }),
            setCurrentSnackbarState, 
            functions.delete))
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
                snackbarState={snackbarState}
                setSnackbarState={setCurrentSnackbarState}
            />
        </>
    )

}