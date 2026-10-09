import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { FarmCreate, FarmRead, FarmUpdate } from "../api/schemas/farm";
import type { GenericGridColumn, SnackbarState } from "./datagrid/GenericDataGridComponent"
import { GenericDeleteButton, GenericTabBody, GenericUpdateButton } from "./datagrid/GenericDataGridComponent";
import {type DialogDefinition} from "./DialogComponent"
import createDefaultFunctions from "../api/genericCRUDFunctions";

export default function FarmTab() {
    const { user } = useAuth()

    const [data, setData] = useState<FarmRead[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentDialogDefinition, setCurrentDialogDefinition] = useState<DialogDefinition<any> | null>(null)
    const [snackbarState, setCurrentSnackbarState] = useState<SnackbarState>({open:false, options: null})
    const[getSignal, setGetSignal] = useState(0)
    
    const functions = createDefaultFunctions("/farms", setData)

    const updateDialog: DialogDefinition<FarmUpdate> = {
        title: (start) => `Update Farm ${start?.id}`,
        fields: [
            {
                field: "name",
                headerName: "Name",
                type: "text"
            },
            {
                field: "location_region",
                headerName: "Location Region",
                type: "text"
            },
            {
                field: "capacity",
                headerName: "Capacity",
                type:"number"
            },
            {
                field: "supervisor_id",
                headerName: "Supervisor ID",
                type:"number"
            }
        ],
        submitAction: async (value: FarmUpdate, id?: number) => {
            await functions.put(value, id!)
            setCurrentSnackbarState({
                open: true,
                options: {
                    message:`Successfully updated Farm ${id}`,
                    severity:"success",
                    duration:2000
                }
            })
        },
        actionName:"Update",
        onDialogClose: ()=>{setDialogOpen(false)},
        destroyDialog: ()=>{setCurrentDialogDefinition(null)}
    }

    const createDialog: DialogDefinition<FarmCreate> = {
        title: ()=> "Create Farm",
        fields: [
            {
                field: "name",
                headerName: "Name",
                type: "text"
            },
            {
                field: "location_region",
                headerName: "Location Region",
                type: "text"
            },
            {
                field: "capacity",
                headerName: "Capacity",
                type:"number"
            },
            {
                field: "supervisor_id",
                headerName: "Supervisor ID",
                type:"number"
            }

        ],
        submitAction: async (value: FarmCreate, _?: number)=>{
            //alert(`I would have submitted this!: ${JSON.stringify(value)}`)
            await functions.post(value)
            setCurrentSnackbarState({
                open: true,
                options: {
                    message:`Successfully created Farm`,
                    severity:"success",
                    duration:2000
                }
            })
            //functions.post(value)
        },
        actionName:"Create",
        onDialogClose: ()=>{setDialogOpen(false)},
        destroyDialog: ()=>{setCurrentDialogDefinition(null)}
    }

    const dataGridColumnDefinition: GenericGridColumn<FarmRead>[] = [
        {
            field: "id",
            headerName: "ID",
            width: 30
        },
        {
            field: "name",
            headerName: "Name"
        },
        {
            field: "location_region",
            headerName: "Location Region"
        },
        {
            field: "capacity",
            type: "number",
            headerName: "Capacity"
        },
        {
            field: "supervisor_id",
            type: "number",
            headerName: "Supervisor Id"
        }
    ]

    if(user?.role == "Admin")
    {
        dataGridColumnDefinition.push(GenericUpdateButton(updateDialog, setCurrentDialogDefinition, setDialogOpen))
        dataGridColumnDefinition.push(GenericDeleteButton(
            (id)=>({message:`Successfully deleted Farm ${id}`, severity:"success", duration: 3000}),
            (id, _)=>({message:`Failed to delete Farm ${id}`, severity:"error", duration: 3000}),
            setCurrentSnackbarState,functions.delete))
    }

    useEffect(()=>{
        functions.get()
    },[])

    return (
        <>
            <GenericTabBody<FarmRead>
                userRole={user?.role} data={data}
                gridColumnDefinition={dataGridColumnDefinition}
                createDialog={createDialog}
                currentDialogDefinition={currentDialogDefinition}
                setCurrentDialogDefinition={setCurrentDialogDefinition}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                snackbarState = {snackbarState}
                setSnackbarState = {setCurrentSnackbarState}

                setData={setData}
                getSignal={getSignal}
                getURL="/farms"
            />
        </>
    )

}