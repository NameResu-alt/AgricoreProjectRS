import { DataGrid, type GridFilterModel, GridFooterContainer, GridPagination, type GridColDef, type GridTreeNodeWithRender, type GridValidRowModel } from "@mui/x-data-grid";
import type { GridRenderCellParams } from "@mui/x-data-grid/models";
import type React from "react";
import { GenericDialog, type DialogDefinition } from "../DialogComponent";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import type { UserRole } from "../../api/schemas/auth";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEffect, useState } from "react";
import { type GridSortModel } from "@mui/x-data-grid";
import apiClient from "../../api/client";

import { type GridSlots } from "@mui/x-data-grid";
import CustomColumnMenu from "./CustomColumnMenu";
import type { CustomFilterModel, CustomSortingModel, CustomColumnMenuProps } from "./CustomColumnMenu";
import CustomFilterMenu, { type FilterStatus } from "./CustomFilterMenu";

export type GenericGridColumn<T extends GridValidRowModel> = {
    field: keyof T | "delete" | "update" | "patch" | "create" | "download" | "header";
    headerName: string;
    type?: "string" | "number" | "actions" | "dateTime";
    width?: number;
    renderCell?: (params: GridRenderCellParams<T, any, any, GridTreeNodeWithRender>) => React.JSX.Element;
    valueGetter?: (value: any, row: T, column: GridColDef, apiRef: React.RefObject<GridApiCommunity>) => any

};

type GenericSnackbarOptions = {
    message: string,
    severity: "success" | "info" | "warning" | "error",
    duration: number
}

export type SnackbarState = {
    open: boolean,
    options: GenericSnackbarOptions | null
}


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
                    sx={{ height: "75%", width: "50%" }}
                    variant={"contained"}
                    color={"primary"}
                >
                    <SettingsIcon sx={{ color: "text.primary" }}></SettingsIcon>
                </Button>
            )
            //<button onClick={()=>actions.onDelete(Number(params.id))}>Test</button>
        },
    }
}

export function GenericDeleteButton(successSnackbar: (id: number) => GenericSnackbarOptions, failureSnackbar: (id: number, ex: any) => GenericSnackbarOptions, setCurrentSnackbarState: React.Dispatch<React.SetStateAction<SnackbarState>>, deleteFunction: (id: number) => Promise<void>): GenericGridColumn<any> {
    return {
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
                    <DeleteIcon sx={{ color: "text.primary" }}></DeleteIcon>
                </Button>
            )
        }
    }
}

export function GenericTabBody<T extends GridValidRowModel>({ userRole, data, gridColumnDefinition, createDialog, currentDialogDefinition, setCurrentDialogDefinition, dialogOpen, setDialogOpen, snackbarState, setSnackbarState, setData, getSignal, getURL }: { userRole: UserRole | undefined, data: T[], gridColumnDefinition: GenericGridColumn<T>[], createDialog: DialogDefinition<any>, currentDialogDefinition: DialogDefinition<any> | null, setCurrentDialogDefinition: React.Dispatch<React.SetStateAction<DialogDefinition<any> | null>>, dialogOpen: boolean, setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>, snackbarState: SnackbarState, setSnackbarState: React.Dispatch<React.SetStateAction<SnackbarState>>, setData: React.Dispatch<React.SetStateAction<T[]>>, getSignal: number, getURL: string }) {
    return (
        <>
            <Box sx={{ height: "100%", width: "100%", display: 'flex', justifyContent: 'flex-end', flexDirection: "column" }}>
                {
                    userRole === "Admin" &&
                    <Button
                        onClick={() => {
                            setCurrentDialogDefinition(createDialog)
                            setDialogOpen(true)
                        }}
                        variant={"contained"}
                        color={"success"}
                    >
                        Create
                    </Button>
                }

                <GenericDataGridV3<T> rowData={data} columns={gridColumnDefinition} setData={setData} getSignal={getSignal} getURL={getURL} />
                {
                    currentDialogDefinition &&
                    <GenericDialog definition={currentDialogDefinition} dialogOpen={dialogOpen} />
                }

                <Snackbar
                    open={snackbarState.open}
                    autoHideDuration={snackbarState.options?.duration ?? 3000}
                    onClose={() => setSnackbarState({ open: false, options: snackbarState.options })}
                    slotProps={{
                        transition: {
                            onExited: () => setSnackbarState({ open: false, options: null })
                        }
                    }}
                >
                    <Alert severity={snackbarState.options?.severity} variant={"filled"}>{snackbarState.options?.message}</Alert>
                </Snackbar>
            </Box>
        </>
    )
}

function CustomFooter() {
    return (
        <GridFooterContainer>
            <GridPagination />
        </GridFooterContainer>
    );
}

//Won't own the data anymore, just make the datagrid!.
export default function GenericDataGridV3<T extends GridValidRowModel>({ rowData, columns, setData, getSignal, getURL }: { rowData: T[], columns: GenericGridColumn<T>[], setData: React.Dispatch<React.SetStateAction<T[]>>, getSignal: number, getURL: string }) {

    const [sortModel, setSortModel] = useState<CustomSortingModel>({})
    const [filterModel, setFilterModel] = useState<CustomFilterModel>({})
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    })
    const [filterStatus, setFilterStatus] = useState<FilterStatus>({open:false, parent:null})

    const prepedColumns: GridColDef<T>[] = columns.map((col) => ({
        field: String(col.field),
        headerName: col.headerName,
        type: col.type ?? "string",
        ...(col.width !== undefined
            ? { width: col.width }
            : { flex: 1 }
        ),
        renderCell: col.renderCell,
        valueGetter: col.valueGetter,
        renderHeader: (params) => {
            return (
                <div>
                    <span>{params.colDef.headerName}3</span>
                    {/* Your custom filter button goes here */}
                </div>
            )
        }
    }))

    async function powerGet(get_url: string, setData: React.Dispatch<React.SetStateAction<T[]>>) {
        //For every pagination, sorting, and filtering, I need to add a param for it.
        //Keep in mind, the shape of them. I don't think I can pass an object wholesale as a parameter?
        //Maybe if I passed in the parameter as a JSON? 
        let total_params: Record<string, string> = {}
        total_params["page"] = String(paginationModel.page)
        total_params["pageSize"] = String(paginationModel.pageSize)

        for (const [field, sortDirection] of Object.entries(sortModel)) {
            if (sortDirection == undefined) continue

            total_params[`sort${field.slice(0, 1).toUpperCase() + field.slice(1, field.length)}`] = sortDirection;
        }

        for (const [field, filters] of Object.entries(filterModel)) {
            let pascalFieldName = field.slice(0, 1).toUpperCase() + field.slice(1)

            let totalFilter = ""
            for (const filter of filters) {
                totalFilter += filter.operator + "," + filter.value + "|"
            }

            if (totalFilter.length > 0 && totalFilter[totalFilter.length - 1] == '|')
                totalFilter = totalFilter.slice(0, totalFilter.length)
            total_params[`filter${pascalFieldName}`] = totalFilter
        }

        let response = await apiClient.get<T[]>(get_url, {
            params: total_params
        })
        setData(response.data)
    }

    useEffect(() => {
        powerGet(getURL, setData)
    }
        , [getSignal, sortModel, filterModel, paginationModel])

    return (
        <>
            <DataGrid
                slots={{
                    footer: CustomFooter,
                    columnMenu: CustomColumnMenu as GridSlots['columnMenu']
                }}
                slotProps={{
                    columnMenu: {
                        "parentFilterModel": filterModel,
                        "parentSortingModel": sortModel,
                        "setParentFilterModel": setFilterModel,
                        "setParentSortingModel": setSortModel,
                        "setFilterStatus": setFilterStatus
                    }
                }}
                onPaginationModelChange={
                    (paginationModel) => {
                        setPaginationModel({
                            page: paginationModel.page,
                            pageSize: paginationModel.pageSize
                        })
                    }
                }

                paginationMode={"client"}
                sortingMode={"client"}
                filterMode={"client"}
                columns={prepedColumns}
                rows={rowData}
                sx={{ p: 2, flex: 1 }}
            >
            </DataGrid>
             <CustomFilterMenu columns={prepedColumns} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        </>
    )
}