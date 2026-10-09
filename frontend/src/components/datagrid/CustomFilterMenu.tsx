import { useGridApiContext, type GridColDef } from "@mui/x-data-grid";
import Popper from '@mui/material/Popper';
import { Grid, MenuItem, Paper, Popover, Stack, TextField } from "@mui/material";
const numeric_operators = ["=", "!=", ">", ">=", "<", "<="]
const string_operators = ["contains", "does not contain", "equals", "does not equal", "starts with", "ends with"]

export interface FilterStatus{
    open: boolean,
    parent: HTMLElement | null
}

export default function CustomFilterMenu({ columns, filterStatus, setFilterStatus}: { columns: GridColDef[], filterStatus: FilterStatus, setFilterStatus: React.Dispatch<React.SetStateAction<FilterStatus>>}) {
    return (
        <Popover
            open={filterStatus.open}
            anchorEl={filterStatus.parent}
            onClose={() => setFilterStatus((prev)=>({open:false, parent: prev.parent}))}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            slotProps={{
                transition:{
                    onExited: ()=>{setFilterStatus({open:false, parent:null})}
                }
            }}
        >
            <Paper sx={{ p: 2 , width: 500}}>
                <Stack direction="row" sx={{width:"100%"}}>
                    <Grid container sx={{width:"100%"}}>
                        <Grid size={3}>
                            <TextField
                                name="column"
                                select
                                label="Column"
                                sx={{width:"100%"}}
                            >
                                {
                                    columns.map((col)=>{
                                        return <MenuItem value={col.field}>{col.headerName}</MenuItem>
                                    })
                                }
                            </TextField>
                        </Grid>
                        <Grid size={3}>
                                <TextField
                                select
                                label="Column"
                                value={null}
                            >
                                {
                                    columns.map((col)=>{
                                        return <MenuItem value={col.field}>{col.headerName}</MenuItem>
                                    })
                                }
                            </TextField>
                        </Grid>
                        <Grid size={3}>
                                <TextField
                                select
                                label="Column"
                                value={null}
                            >
                                {
                                    columns.map((col)=>{
                                        return <MenuItem value={col.field}>{col.headerName}</MenuItem>
                                    })
                                }
                            </TextField>
                        </Grid>
                        <Grid size={3}>
                                <TextField
                                select
                                label="Column"
                                value={null}
                            >
                                {
                                    columns.map((col)=>{
                                        return <MenuItem value={col.field}>{col.headerName}</MenuItem>
                                    })
                                }
                            </TextField>
                        </Grid>
                    </Grid>
                </Stack>
            </Paper>
        </Popover>
    )
}