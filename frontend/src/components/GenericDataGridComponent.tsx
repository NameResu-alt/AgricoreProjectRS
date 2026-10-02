
import React, { useEffect, useState } from "react";
import apiClient from "../api/client";
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridTreeNodeWithRender, type GridValidRowModel } from "@mui/x-data-grid";
import { KeyOff } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useAuth } from '../context/AuthContext';
/**
 * {
            //https://mui.com/x/react-data-grid/column-definition/
            field: 'actions',
            type: 'actions',
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
                <>
                    <Button color={"secondary"} variant={"contained"} onClick={() => {
                        setIdToUpdate(params.row.id)
                        setFormValues(params.row)
                        setDialogOpen(true)
                    }} style={{ flexGrow: 1, height: "100%", width: "100%" }}>Modify</Button>
                    <Button color={"error"} variant={"contained"} onClick={() => deleteEquipment(params.row)} style={{ flexGrow: 1, height: "100%", width: "100%" }}>Delete</Button>
                </>
            ),
        }

        (property) renderCell: (params: GridRenderCellParams<ReadEquipment, any, any, GridTreeNodeWithRender>) => React.JSX.Element
 */

export type DialogModes = "create" | "update" | "patch" | "closed";

export type GenericGridColumn<T extends GridValidRowModel> = {
    field: keyof T | "delete" | "update" | "patch";
    headerName: string;
    type?: "string" | "number" | "actions";
    width?: number;
    updateable?: boolean;
    createable?: boolean;
    patchable?: boolean;
    renderCell?: (params: GridRenderCellParams<T, any, any, GridTreeNodeWithRender>) => React.JSX.Element
};

export type GridActions<TGet> = {
    onDelete: (id: number) => Promise<void>;
    openDialog: (currentInfo: TGet, title: string, mode: DialogModes) => void;
}


export type GridColumnFactory<T extends GridValidRowModel> = (actions: GridActions<T>) => GenericGridColumn<T>[];

export function DefaultUpdateButton<T extends GridValidRowModel>(actions: GridActions<T>, title: string): GenericGridColumn<T> {
    return {
        field: "update",
        headerName: "",
        type: "actions",
        width: 100,
        renderCell: (params) => {
            return (
                <Button onClick={() => { actions.openDialog(params.row, title, "update") }} sx={{ height: "100%", width: "100%", backgroundColor: "blue", color: "white" }}>Update</Button>
            )
            //<button onClick={()=>actions.onDelete(Number(params.id))}>Test</button>
        }
    }
}

export function DefaultDeleteButton<T extends GridValidRowModel>(actions: GridActions<T>): GenericGridColumn<T> {
    return {
        field: "delete",
        headerName: "",
        type: "actions",
        width: 100,
        renderCell: (params) => {
            return (
                <Button onClick={() => actions.onDelete(Number(params.id))} sx={{ height: "100%", width: "100%", backgroundColor: "red", color: "white" }}>Delete</Button>
            )

            //<button onClick={()=>actions.onDelete(Number(params.id))}>Test</button>
        }
    }
}

export default function GenericDataGridComponent<TGet extends GridValidRowModel, TPost, TPut>({ urlBase, columnDefinitions, emptyModel, postUrl }: { urlBase: string, columnDefinitions: GridColumnFactory<TGet>, emptyModel: TGet, postUrl?: string }) {
    const [data, setData] = useState<TGet[]>([])
    const [modificationDialog, setModificationDialog] = useState<{
        row: TGet;
        title: string;
    } | null>(null);

    const [dialogMode, setDialogMode] = useState<DialogModes>("closed");

    const { user } = useAuth();



    async function getData() {
        const result = await apiClient.get<TGet[]>(urlBase)
        //alert(`${JSON.stringify(result)}`)
        setData(result.data)
    }

    async function deleteData(id: number) {
        await apiClient.delete(`${urlBase}/${id}`)
        await getData()

    }

    async function updateData(formData: any, id: number) {
        const response = await apiClient.put<TGet>(`${urlBase}/${id}`, formData)
        setData((prev) => {
            return prev.map((row) => {
                if (row.id != response.data.id) {
                    return row
                }

                return response.data;
            });
        })
    }

    async function patchData(formData: any, id: number) {
        const response = await apiClient.patch<TGet>(`${urlBase}/${id}`, formData)
        getData()
    }


    async function postData(formData: any) {
        const response = await apiClient.post<TGet>(`${postUrl ?? urlBase}`, formData)
        setData((prev) => {
            return [...prev, response.data]
        })
    }

    function openUpdateDialog(row: TGet, title: string, mode: DialogModes) {
        setModificationDialog({ row, title });
        setDialogMode(mode);
    }

    function closeUpdateDialog() {
        setDialogMode("closed");
    }


    useEffect(() => {
        getData()
    },
        [])

    const columnStructure = columnDefinitions({
        onDelete: deleteData,
        openDialog: openUpdateDialog
    })

    const columns: GridColDef<TGet>[] = columnStructure.map((col) => ({
        field: String(col.field),
        headerName: col.headerName,
        type: col.type ?? "string",
        ...(col.width !== undefined
            ? { width: col.width }
            : { flex: 1 }
        ),
        renderCell: col.renderCell
    }));

    const updateDialogFields = columnStructure.filter(
        (column) => column.type !== "actions" && column.field !== "id" && column.updateable !== false
    );

    const createDialogFields = columnStructure.filter(
        (column) => column.type !== "actions" && column.field !== "id" && column.createable !== false
    );

    const patchDialogFields = columnStructure.filter(
        (column) => column.type !== "actions" && column.field !== "id" && column.patchable == true
    );

    function populateDialogFields() {

        let columnFields: GenericGridColumn<TGet>[];

        switch (dialogMode) {
            case "create":
                columnFields = createDialogFields;
                break;

            case "update":
                columnFields = updateDialogFields;
                break;
            case "patch":
                columnFields = patchDialogFields;
                break;
            default:
                columnFields = []
                break;
        }

        return columnFields.map((field) => (
            <TextField
                key={String(field.field)}
                name={String(field.field)}
                label={`${field.headerName}`}
                defaultValue={modificationDialog?.row[field.field]}
                fullWidth
            />
        ))
    }

    return (
        <>
            <Box sx={{ paddingTop: 2, height: "100%", display: 'flex', justifyContent: 'flex-end', flexDirection: "column" }}>
                {
                    user?.role === "Admin" &&
                    <Button
                        onClick={() => {
                            const newModel: TGet = { ...emptyModel }
                            setDialogMode("create")
                            setModificationDialog({
                                row: newModel,
                                title: "Create"
                            })
                        }}
                        variant="contained"
                        sx={{ backgroundColor: "green" }}
                    >
                        Create
                    </Button>
                }

                <DataGrid
                    columns={columns}
                    rows={data}
                    sx={{ p: 2, flex: 1 }}
                />
            </Box>
            <Dialog
                open={dialogMode !== "closed"}
                onClose={closeUpdateDialog}
                slotProps={{
                    transition: {
                        onExited: () => setModificationDialog(null)
                    },
                    paper: {
                        component: "form",
                        action: (formData: FormData) => {
                            const data = Object.fromEntries(
                                [...formData.entries()].filter(([key, value]) => {
                                    return typeof value !== 'string' || value.trim() !== '';
                                })
                            );

                            // Now this will display your inputs perfectly!
                            //Check the mode!
                            if (dialogMode == "create") {
                                postData(data)
                            }
                            else if (dialogMode == "update") {
                                updateData(data, modificationDialog?.row.id)
                            }
                            else if (dialogMode == "patch") {
                                patchData(data, modificationDialog?.row.id)
                            }

                            closeUpdateDialog()
                        }
                    }
                }}
            >
                <DialogTitle>
                    {(dialogMode == "update" || dialogMode == "patch") && `${modificationDialog?.title} ${modificationDialog?.row.id}`}
                    {dialogMode == "create" && `${modificationDialog?.title}`}

                </DialogTitle>

                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        pt: 1,
                    }}
                >
                    {modificationDialog &&
                        populateDialogFields()}
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeUpdateDialog}>
                        Cancel
                    </Button>

                    <Button variant="contained" type="submit">
                        {dialogMode == "create" ? "Create" : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}