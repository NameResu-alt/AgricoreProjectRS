import { Box, Button, Divider, IconButton, Menu, MenuItem, Paper, Popover, Stack, TextField } from "@mui/material"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

export type ActiveFilter = {
    id: string,
    field: string,
    operators: string[],
    currentOperator: string,
    value?: any,
}

export type CustomFilterModel = {
    filterMenuParentElement: HTMLElement | null
    filters: ActiveFilter[]
    fieldNames: { fieldName: string; headerName: string }[]
    fieldFilterOptions: Record<string, { options: string[], type: string }>
    conditionalMode: "and" | "or"
}

export const numeric_operators = ["=", "!=", ">", ">=", "<", "<="]
export const string_operators = ["contains", "does not contain", "equals", "does not equal", "starts with", "ends with"]
export const date_operators = ["before", "after", "on"]

function DisplayFilterRow({ activeFilter, filterModel, setFilterModel }: { activeFilter: ActiveFilter, filterModel: CustomFilterModel, setFilterModel: React.Dispatch<React.SetStateAction<CustomFilterModel>> }) {

    function deleteCurrentFilter() {
        setFilterModel((prev) => {
            return {
                filterMenuParentElement: prev.filterMenuParentElement,
                filters: prev.filters.filter((f) => f.id != activeFilter.id).map((f) => ({ ...f })),
                fieldNames: prev.fieldNames,
                fieldFilterOptions: prev.fieldFilterOptions,
                conditionalMode: prev.conditionalMode
            }
        })
    }

    function updateCurrentFilter(updatedFilter: ActiveFilter) {
        setFilterModel((prev) => {
            let newArr: ActiveFilter[] = prev.filters.map((f) => f.id == activeFilter.id ? updatedFilter : f)
            return {
                filterMenuParentElement: prev.filterMenuParentElement,
                filters: newArr,
                fieldNames: prev.fieldNames,
                fieldFilterOptions: prev.fieldFilterOptions,
                conditionalMode: prev.conditionalMode
            }
        })
    }

    function updateConditionalMode(value: string){
        setFilterModel((prev)=>({
            ...prev,
            conditionalMode: value as "and" | "or"
        }))
    }

    let isFirst: boolean = filterModel.filters[0].id == activeFilter.id
    let isSecond: boolean = filterModel.filters.length >= 2 && filterModel.filters[1].id == activeFilter.id
    return (
        <Stack
            direction="row"
            sx={{
                display: "grid",
                gridTemplateColumns: "32px 95px 150px 150px minmax(150px, 1fr)",
                gap: 2,
                p: 1,
                alignItems: "center",
                width: "100%",
                minWidth: 0,
            }}
        >
            <IconButton
                onClick={deleteCurrentFilter}
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    color: "primary.main",
                }}
            >
                <CloseIcon sx={{ color: "primary.main" }} />
            </IconButton>
            {!isFirst ? (
                <TextField select value={filterModel.conditionalMode} sx={{ width: "95px" }} disabled={!isSecond} onChange={(event)=>updateConditionalMode(event.target.value)}>
                    <MenuItem value="and">And</MenuItem>
                    <MenuItem value="or">Or</MenuItem>
                </TextField>
            ) : (
                <Box sx={{ width: "95px" }} />
            )}

            <TextField
                select
                label="Column"
                sx={{ width: "150px" }}
                value={activeFilter.field}
                onChange={(event) => {
                    let updatedFilter: ActiveFilter = {
                        ...activeFilter,
                        field: event.target.value,
                        value: undefined,
                        operators: filterModel.fieldFilterOptions[event.target.value].options,
                        currentOperator: filterModel.fieldFilterOptions[event.target.value].options[0]
                    };
                    updateCurrentFilter(updatedFilter);

                }}
            >
                {filterModel.fieldNames.map((f) => (
                    <MenuItem key={f.fieldName} value={f.fieldName}>
                        {f.headerName}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                label="Operator"
                sx={{ width: "150px" }}
                value={activeFilter.currentOperator}
                onChange={(event) => {
                    let updatedFilter: ActiveFilter = {
                        ...activeFilter,
                        currentOperator: event.target.value,
                    };
                    updateCurrentFilter(updatedFilter);
                }}
            >
                {activeFilter.operators.map((op) => (
                    <MenuItem key={op} value={op}>
                        {op}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                label="Value"
                fullWidth
                value={activeFilter.value ?? ""}
                onChange={(event) => {
                    let updatedFilter: ActiveFilter = {
                        ...activeFilter,
                        value: event.target.value,
                    };
                    updateCurrentFilter(updatedFilter);
                }}
            />
        </Stack>
    )

}

export default function CustomFilterMenuV2({ filterModel, setFilterModel }: { filterModel: CustomFilterModel, setFilterModel: React.Dispatch<React.SetStateAction<CustomFilterModel>> }) {
    function addNewActiveFilter() {
        setFilterModel((prev) => {
            let defaultField: string = filterModel.fieldNames[0].fieldName
            let defaultOperators: string[] = filterModel.fieldFilterOptions[defaultField].options
            let currentOperator = defaultOperators[0]
            let newArr: ActiveFilter[] = prev.filters.map((f) => ({ ...f }))
            newArr.push({
                id: crypto.randomUUID(),
                field: defaultField,
                operators: defaultOperators,
                currentOperator: currentOperator
            })

            return {
                filterMenuParentElement: prev.filterMenuParentElement,
                filters: newArr,
                fieldNames: prev.fieldNames,
                fieldFilterOptions: prev.fieldFilterOptions,
                conditionalMode: prev.conditionalMode
            }
        })
    }

    return (
        <Popover
            open={filterModel.filters.length > 0}
            anchorEl={filterModel.filterMenuParentElement}
            onClose={() => {
                //Here, go through all of the filters, and delete the ones that have blank value fields. 
                setFilterModel((prev) => ({
                    filters: prev.filters.filter((f) => f.value != undefined && f.value != "").map((f) => ({ ...f })),
                    filterMenuParentElement: null,
                    fieldNames: prev.fieldNames,
                    fieldFilterOptions: prev.fieldFilterOptions,
                    conditionalMode: prev.conditionalMode
                }))
            }
            }
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            slotProps={{
                transition: {
                    onExited: () => {
                        setFilterModel((prev) => ({
                            filterMenuParentElement: null,
                            filters: prev.filters,
                            fieldNames: prev.fieldNames,
                            fieldFilterOptions: prev.fieldFilterOptions,
                            conditionalMode: prev.conditionalMode
                        }))
                    }
                }
            }}
        >
            <Paper sx={{ width: 900 }}>
                <Stack>
                    <Stack>
                        {
                            filterModel.filters.map((filter) => <DisplayFilterRow key={filter.id} filterModel={filterModel} activeFilter={filter} setFilterModel={setFilterModel} />)
                        }
                    </Stack>
                    <Divider />
                    <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
                        <Button startIcon={<AddIcon />} onClick={() => addNewActiveFilter()}>Add Filter</Button>
                        <Button startIcon={<DeleteForeverIcon />} onClick={() => setFilterModel((prev) => ({ ...prev, filters: [] }))}>Remove All</Button>
                    </Box>
                </Stack>
            </Paper>
        </Popover>
    )
}