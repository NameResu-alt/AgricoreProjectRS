import { DataGrid, type GridColDef, type GridTreeNodeWithRender, type GridValidRowModel } from "@mui/x-data-grid";
import type { GridRenderCellParams } from "@mui/x-data-grid/models";
import type React from "react";
import { GenericDialog, type DialogDefinition } from "./DialogComponent";
import { Box, Button } from "@mui/material";
import type { UserRole } from "../api/schemas/auth";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

export type GenericGridColumn<T extends GridValidRowModel> = {
    field: keyof T | "delete" | "update" | "patch" | "create";
    headerName: string;
    type?: "string" | "number" | "actions" | "dateTime";
    width?: number;
    renderCell?: (params: GridRenderCellParams<T, any, any, GridTreeNodeWithRender>) => React.JSX.Element;
    valueGetter?: (value: any,row: T, column: GridColDef,apiRef: React.RefObject<GridApiCommunity>) => any

};

export function GenericUpdateButton<T>(updateDialog: DialogDefinition<T>, setCurrentDialogDefinition: (value: React.SetStateAction<DialogDefinition<T> | null>) => void, setDialogOpen: (value: React.SetStateAction<boolean>) => void): GenericGridColumn<any> {
    
    return {
        field: "update",
        headerName: "",
        type: "actions",
        width: 75,
        renderCell: (params) => {
            return (
                <Button onClick={() => {
                    setCurrentDialogDefinition({
                        ...updateDialog,
                        startingValue: {
                            value: params.row,
                            id: params.row.id
                        }
                    })
                    setDialogOpen(true)
                }
                }
                    sx={{ height: "75%", width: "50%", backgroundColor: "blue", color: "white" }}>
                        <SettingsIcon></SettingsIcon>
                    </Button>
            )
            //<button onClick={()=>actions.onDelete(Number(params.id))}>Test</button>
        },
    }
}

export function GenericDeleteButton(deleteFunction: (id: number) => Promise<void>): GenericGridColumn<any> {
    return {
        field: "delete",
        headerName: "",
        type: "actions",
        width: 75,
        renderCell:  (params) => {
            return (
                <Button
                    onClick={async () => {
                        try{
                            await deleteFunction(params.row.id)
                        }
                        catch{
                            alert("Unable to delete!")
                        }
                        
                    }}
                    sx={{ height: "75%", width: "50%", backgroundColor: "red", color: "white" }}
                >
                    <DeleteIcon></DeleteIcon>
                </Button>
            )
        }
    }
}

export function GenericTabBody<T extends GridValidRowModel>({ userRole, data, gridColumnDefinition, createDialog, currentDialogDefinition, setCurrentDialogDefinition, dialogOpen, setDialogOpen}: { userRole: UserRole | undefined, data: T[], gridColumnDefinition: GenericGridColumn<T>[], createDialog: DialogDefinition<any>, currentDialogDefinition: DialogDefinition<any> | null, setCurrentDialogDefinition: React.Dispatch<React.SetStateAction<DialogDefinition<any> | null>>, dialogOpen: boolean, setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>}) {
    return (
        <>
            <Box sx={{ paddingTop: 2, height: "100%", width:"100%", display: 'flex', justifyContent: 'flex-end', flexDirection: "column"}}>
                {
                    userRole === "Admin" &&
                    <Button
                        onClick={() => {
                            setCurrentDialogDefinition(createDialog)
                            setDialogOpen(true)
                        }}
                        variant="contained"
                        sx={{ backgroundColor: "green" }}
                    >
                        Create
                    </Button>
                }

                <GenericDataGridV3 rowData={data} columns={gridColumnDefinition} />
                {
                    currentDialogDefinition &&
                    <GenericDialog definition={currentDialogDefinition} dialogOpen={dialogOpen}/>
                }
            </Box>


        </>
    )
}

//Won't own the data anymore, just make the datagrid!.
export default function GenericDataGridV3<T extends GridValidRowModel>({ rowData, columns }: { rowData: T[], columns: GenericGridColumn<T>[] }) {

    const prepedColumns: GridColDef<T>[] = columns.map((col) => ({
        field: String(col.field),
        headerName: col.headerName,
        type: col.type ?? "string",
        ...(col.width !== undefined
            ? { width: col.width }
            : { flex: 1 }
        ),
        renderCell: col.renderCell,
        valueGetter: col.valueGetter
    }))

    return (
        <DataGrid
            columns={prepedColumns}
            rows={rowData}
            sx={{ p: 2, flex: 1 }}
        />
    )
}