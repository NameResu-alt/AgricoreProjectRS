import { useEffect, useState } from "react";
import { hasPermission, useAuth } from "../context/AuthContext";
import { type DialogDefinition } from "./DialogComponent";
import type { FieldHandCreate, FieldHandRead, FieldHandUpdate } from "../api/schemas/field_hand";
import createDefaultFunctions from "../api/genericCRUDFunctions";
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton, type GenericGridColumn, type SnackbarState } from "./datagrid/GenericDataGridComponent";
import type { DataEnvelope } from "../api/schemas/dataEnvelope";
import { Permission } from "../api/schemas/auth";

export default function FieldHandTab() {
    const { user } = useAuth()
    const [data, setData] = useState<DataEnvelope<FieldHandRead>>({
        total: 0,
        data: []
    })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)
    const [snackbarState, setCurrentSnackbarState] = useState<SnackbarState>({ open: false, options: null })
    const [getSignal, setGetSignal] = useState(0)

    const functions = createDefaultFunctions("/field_hands", setGetSignal)

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
        submitAction: async (value, _) => {
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

    if(hasPermission(Permission.FIELD_HAND_UPDATE)){
        gridColumnDefinition.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        
    }

    if (hasPermission(Permission.FIELD_HAND_DELETE)) {
        gridColumnDefinition.push(GenericDeleteButton(
            (id) => ({ message: `Successfully deleted Field Hand ${id}`, severity: "success", duration: 3000 }),
            (id, _) => ({ message: `Failed to delete Field Hand ${id}`, severity: "error", duration: 3000 }),
            setCurrentSnackbarState, 
            functions.delete))
    }

    return (
        <>
            <GenericTabBody<FieldHandRead>
                createPermission={Permission.FIELD_HAND_CREATE}
                dataEnvelope={data}
                gridColumnDefinition={gridColumnDefinition}
                createDialog={createDialog}
                currentDialogDefinition={currentDialogDefinition}
                setCurrentDialogDefinition={setCurrentDialogDefinition}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                snackbarState={snackbarState}
                setSnackbarState={setCurrentSnackbarState}

                setData={setData}
                getURL="/field_hands"
                getSignal={getSignal}
            />
        </>
    )

}