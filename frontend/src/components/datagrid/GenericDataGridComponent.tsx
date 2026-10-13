import { DataGrid, GridFooterContainer, GridPagination, type GridColDef, type GridTreeNodeWithRender, type GridValidRowModel } from "@mui/x-data-grid";
import type { GridRenderCellParams } from "@mui/x-data-grid/models";
import type React from "react";
import { GenericDialog, type DialogDefinition } from "../DialogComponent";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import type { UserRole } from "../../api/schemas/auth";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEffect, useState } from "react";
import apiClient from "../../api/client";

import { type GridSlots } from "@mui/x-data-grid";
import CustomColumnMenu from "./CustomColumnMenu";
import type { CustomSortingModel } from "./CustomColumnMenu";
import type { CustomFilterModel } from "./CustomFilterMenuV2";
import CustomFilterMenuV2, { boolean_operators, date_operators, numeric_operators, string_operators } from "./CustomFilterMenuV2";
import type { DataEnvelope } from "../../api/schemas/dataEnvelope";

export type GenericGridColumn<T extends GridValidRowModel> = {
    field: keyof T | "delete" | "update" | "patch" | "create" | "download" | "header";
    headerName: string;
    type?: "string" | "number" | "actions" | "dateTime" | "boolean";
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

export function GenericTabBody<T extends GridValidRowModel>({ userRole, dataEnvelope, gridColumnDefinition, createDialog, currentDialogDefinition, setCurrentDialogDefinition, dialogOpen, setDialogOpen, snackbarState, setSnackbarState, setData, getURL, getSignal}: { userRole: UserRole | undefined, dataEnvelope: DataEnvelope<T>, gridColumnDefinition: GenericGridColumn<T>[], createDialog: DialogDefinition<any>, currentDialogDefinition: DialogDefinition<any> | null, setCurrentDialogDefinition: React.Dispatch<React.SetStateAction<DialogDefinition<any> | null>>, dialogOpen: boolean, setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>, snackbarState: SnackbarState, setSnackbarState: React.Dispatch<React.SetStateAction<SnackbarState>>, setData: React.Dispatch<React.SetStateAction<DataEnvelope<T>>>, getURL: string, getSignal: number}) {
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

                <GenericDataGridV3<T> dataEnvelope={dataEnvelope} columns={gridColumnDefinition} setData={setData} getURL={getURL} getSignal={getSignal}/>
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
export default function GenericDataGridV3<T extends GridValidRowModel>({ dataEnvelope, columns, setData, getURL, getSignal }: { dataEnvelope: DataEnvelope<T>, columns: GenericGridColumn<T>[], setData: React.Dispatch<React.SetStateAction<DataEnvelope<T>>>, getURL: string, getSignal: number }) {

    function notExtraField(field: string) {
        return !(["delete", "update", "patch", "create", "download", "header"].includes(field))
    }

    const fieldNames: { fieldName: string; headerName: string }[] = columns
        .map((col) => ({
            fieldName: String(col.field),
            headerName: String(col.headerName)
        }))
        .filter(({ fieldName }) => notExtraField(fieldName));

    let fieldFilterOptions: Record<string, { options: string[], type: string }> = {}

    for (const col of columns) {
        const outcome = fieldNames.find((n) => String(col.field) == n.fieldName)
        if (outcome == undefined) {
            continue;
        }


        let correctOperators: string[] = []
        switch (String(col.type)) {
            case "number":
                correctOperators = [...numeric_operators]
                break;
            case "dateTime":
                correctOperators = [...date_operators]
                break;
            case "boolean":
                correctOperators = [...boolean_operators]
                break;
            case "string":
            default:
                correctOperators = [...string_operators]
                break;
        }

        const type = String(col.type ?? "string");

        fieldFilterOptions[String(col.field)] = {
            options: correctOperators,
            type: type
        }

    }


    const [sortModel, setSortModel] = useState<CustomSortingModel>({})
    const [filterModel, setFilterModel] = useState<CustomFilterModel>({
        filterMenuParentElement: null,
        filters: [],
        fieldNames: fieldNames,
        fieldFilterOptions: fieldFilterOptions,
        conditionalMode: "and"
    })

    const startPageSize = 3
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: startPageSize,
    })

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

    async function powerGet(get_url: string, setData: React.Dispatch<React.SetStateAction<DataEnvelope<T>>>) {
        //For every pagination, sorting, and filtering, I need to add a param for it.
        //Keep in mind, the shape of them. I don't think I can pass an object wholesale as a parameter?
        //Maybe if I passed in the parameter as a JSON? 
        const params = new URLSearchParams()
        params.append("page", String(paginationModel.page))
        params.append("page_size", String(paginationModel.pageSize))
        params.append("filter_mode", filterModel.conditionalMode)

        for (const [field, sortDirection] of Object.entries(sortModel)) {
            if (sortDirection == undefined) continue
            params.append(
                "sort",
                JSON.stringify({
                    field: field,
                    direction: sortDirection
                })
            )
        }

        for (const filter of filterModel.filters) {
            if (filter.value == undefined || filter.value == "") {
                continue
            }
            params.append(
                "filter",
                JSON.stringify({
                    field: filter.field,
                    operator: filter.currentOperator,
                    value: filter.value
                })
            )
        }

        let response = await apiClient.get<DataEnvelope<T>>(get_url, {
            params: params
        })

        setData(response.data)
    }

    useEffect(() => {

        const controller = new AbortController()

        powerGet(getURL, setData)

        return () => {
            controller.abort();
        }

    }
        , [getSignal, sortModel, filterModel.filters, filterModel.conditionalMode, paginationModel])

    return (
        <>
            <DataGrid
                slots={{
                    footer: CustomFooter,
                    columnMenu: CustomColumnMenu as GridSlots['columnMenu']
                }}

                rowCount={dataEnvelope.total}

                pageSizeOptions={[startPageSize, startPageSize*2, startPageSize*3, startPageSize*4]}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 3,
                            page: 0,
                        },
                        rowCount: 0
                    },
                }}

                slotProps={{
                    columnMenu: {
                        "parentFilterModel": filterModel,
                        "setFilterModel": setFilterModel,
                        "parentSortingModel": sortModel,
                        "setParentSortingModel": setSortModel
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
                paginationMode={"server"}
                sortingMode={"server"}
                filterMode={"server"}
                columns={prepedColumns}
                rows={dataEnvelope.data}
                sx={{ p: 2, flex: 1 }}
            >
            </DataGrid>

            {
                filterModel.filterMenuParentElement !== null &&
                <CustomFilterMenuV2 filterModel={filterModel} setFilterModel={setFilterModel} />
            }

        </>
    )
}
//<CustomFilterMenu columns={columns} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
