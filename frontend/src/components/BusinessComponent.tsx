import type { LowFuelAlert, ColocationDiscrepancies, ReliabilityMetrics, MaintenanceFlags, ReportingLines } from "../api/schemas/business"
import apiClient from "../api/client"
import { useEffect, useState } from "react"
import { Grid, Paper, TextField, Typography } from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import type { EquipmentMetric } from "../api/schemas/equipment"
import CircularProgressWithLabel from "./CircularProgressWithLabel";

function LowFuelAlertGrid({gridSize}: {gridSize: number}){
    //Which active equipment units are operating below a 20% fuel level across all farms?
    const [fuelLevel, setFuelLevel] = useState(20)
    const [lowFuelAlerts, setLowFuelAlerts] = useState<LowFuelAlert | null>(null)

    const columns: GridColDef[] =[
        {
            field:"id",
            headerName:"ID",
            type:"number",
            width:100
        },
        {
            field:"serial_number",
            headerName:"Serial Number",
            type:"string",
            flex:1
        },
        {
            field:"status",
            headerName:"Status",
            type:"string",
            flex:1
        },
        {
            field:"fuel_level",
            headerName:"Fuel Level",
            type:"number",
            flex:1,
            renderCell: (params)=>{
                return (
                    <CircularProgressWithLabel value={params.row.fuel_level}></CircularProgressWithLabel>
                )
            }
        },
        {
            field:"facility_id",
            headerName:"Facility_id",
            type:"number",
            flex:1
        }
    ]

    async function getLowFuelAlert(){
        const result = await apiClient.get<LowFuelAlert>("/business/low_fuel_alert",{
            params:{
                fuel_level: fuelLevel
            }
        })
        setLowFuelAlerts(result.data)
    }

    useEffect(()=>{
        getLowFuelAlert()
    }, [fuelLevel])

    return (
        <Grid size={gridSize} sx={{ minHeight: 0 }}>
            <Paper elevation={3} sx={{ height: "100%", width: "100%", padding: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
                <Typography variant="h1" sx={{ fontSize: '1.5rem' }}>Low Fuel Alert</Typography>
                <Typography variant="body1">
                  Which active equipment units are operating below a {fuelLevel}% fuel level across all farms?
                </Typography>
                 <TextField defaultValue={fuelLevel} onChange={(event) => { setFuelLevel(Number(event.target.value)) }} label="Ratio Limit" type={"number"}></TextField>
                {lowFuelAlerts != null &&
                    <DataGrid
                        rows={lowFuelAlerts}
                        columns={columns}
                    />
                }
            </Paper>
        </Grid>
    )

}

function MaintenanceFlagsGrid({gridSize}: {gridSize: number}) {
    // *Which farms have more than 30% of their equipment currently flagged for maintenance?*
    
    const [ratio,setRatio] = useState(30)
    const [maintenanceFlags, setMaintenanceFlags] = useState<RowMaintenanceFlags[] | null>(null)

    interface RowMaintenanceFlags extends MaintenanceFlags{
        id: number
    }

    async function getMaintenanceFlags(){
        const res = await apiClient.get<MaintenanceFlags>("/business/maintenance_flags", {
            params:{
                ratio: ratio
            }
        })

        const flags: RowMaintenanceFlags[] = Object.entries(res.data).map(([key, value])=>{
            return {
                id: Number(key),
                ...value
            }
        })

        setMaintenanceFlags(flags)
        
    }


    const columns: GridColDef[] =[
        {
            field:"id", headerName:"ID", type:"number", flex:1
        },
        {
            field:"farm_name", headerName:"Farm Name", type:"string", flex:1
        },
        {
            field:"maintenance_count", headerName:"Maintenance Count", type:"number", flex:1
        },
        {
            field:"total", headerName:"Total Count", type:"number", flex:1
        },
        {
            field:"percentage", headerName:"Percentage", type:"number", flex:1,
            valueGetter: (_value, row) =>{
                if(row.total == 0) return 0

                return (row.maintenance_count/row.total) * 100
            },
            valueFormatter: (value:number)=> `${value.toFixed(1)}%`
        }
    ]

    useEffect(()=>{
        getMaintenanceFlags()
    }, [ratio])


    return (
        <Grid size={gridSize} sx={{ minHeight: 0 }}>
            <Paper elevation={3} sx={{ height: "100%", width: "100%", padding: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
                <Typography variant="h1" sx={{ fontSize: '1.5rem' }}>Maintenance Flags</Typography>
                <Typography variant="body1">
                   Which farms have more than {ratio}% of their equipment currently flagged for maintenance?
                </Typography>
                 <TextField defaultValue={ratio} onChange={(event) => { setRatio(Number(event.target.value)) }} label="Ratio Limit" type={"number"}></TextField>
                {maintenanceFlags != null &&
                    <DataGrid
                        rows={maintenanceFlags}
                        columns={columns}
                    />
                }
            </Paper>
        </Grid>
    )

}

function ReliabilityMetricsGrid({ gridSize }: { gridSize: number }) {

    interface RowReliabilityMetric extends EquipmentMetric {
        model: string
    }

    const [ratios, setRatios] = useState<RowReliabilityMetric[] | null>(null)

    const columns: GridColDef[] = [
        {
            field: 'model', headerName: "Model", flex:1
        },
        {
            field: "completion", headerName: "Completion", flex:1, type: "number"
        },
        {
            field: "failure", headerName: "Failure", flex:1, type: "number"
        },
        {
            field: "ratio",
            headerName: "Ratio",
            type: "number",
            flex:1,
            valueGetter: (_value, row) => {
                const total = row.completion + row.failure;

                if (total === 0) {
                    return 0;
                }

                return (row.completion / total) * 100;
            },
            valueFormatter: (value: number) => `${value.toFixed(1)}%`
        }
    ]

    async function getReliabilityMetrics() {
        const res = await apiClient.get<ReliabilityMetrics>("/business/reliability_metrics")

        const metrics: RowReliabilityMetric[] = Object.entries(res.data).map(
            ([key, value]) => {
                return {
                    model: key,
                    ...value
                }
            }
        )

        setRatios(metrics)
    }

    useEffect(() => {
        getReliabilityMetrics()
    }, [])

    return (
        <Grid size={gridSize} sx={{ minHeight: 0 }}>
            <Paper elevation={3} sx={{ height: "100%", width: "100%", padding: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
                <Typography variant="h1" sx={{ fontSize: '1.5rem' }}>Reliability Metrics</Typography>
                <Typography variant="body1">
                    What is the field job completion/failure ratio broken down by equipment model?
                </Typography>
                {ratios != null &&
                    <DataGrid
                        rows={ratios}
                        columns={columns}
                        getRowId={(row) => row.model}
                    />
                }
            </Paper>
        </Grid>
    )
}

function ColocationDiscrepanciesGrid({ gridSize }: { gridSize: number }) {
    const [discrepancyCount, setDiscrepancyCount] = useState(0)


    async function getColocationDiscrepancies() {
        const res = await apiClient.get<ColocationDiscrepancies>("/business/colocation_discrepancies")
        setDiscrepancyCount(res.data.length)
    }

    useEffect(() => {
        getColocationDiscrepancies()
    }, [])

    return (
        <Grid size={gridSize} sx={{ minHeight: 0, marginRight: "auto"}}>
            <Paper elevation={3} sx={{ height: "100%", width: "100%", padding: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
                <Typography variant="h1" sx={{ fontSize: '1.5rem' }}>Co-Location Discrepancies</Typography>
                <Typography variant="body1">
                    How many equipment units are assigned to farmhands who are NOT co-located at the same physical farm?
                </Typography>
                <Typography variant="body1">
                    {discrepancyCount} Equipment Units
                </Typography>

            </Paper>
        </Grid>
    )
}

function ReportingLinesGrid({ gridSize }: { gridSize: number }) {
    const [reportingLines, setReportingLines] = useState<ReportingLines | null>(null);
    const [supervisorId, setSupervisorId] = useState<number | null>(0)

    async function getReportingLines() {
        const res = await apiClient.get<ReportingLines>("/business/reporting_lines", {
            params: {
                supervisor_id: supervisorId
            }
        })
        setReportingLines(res.data)
    }

    useEffect(() => {
        if (supervisorId == null) return

        getReportingLines()
    }, [supervisorId])

    return (
        <Grid size={gridSize} sx={{ minHeight: 0, marginLeft: "auto"}}>
            <Paper elevation={3} sx={{ height: "100%", width: "100%", padding: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
                <Typography variant="h1" sx={{ fontSize: '1.5rem' }}>Reporting Lines</Typography>
                <Typography variant="body1">
                    How many farmhands reporting to a specific Regional Agronomy
                    Supervisor have active field jobs assigned to them?
                </Typography>
                <TextField onChange={(event) => { setSupervisorId(Number(event.target.value)) }} label="Supervisor Id" type={"number"}></TextField>
                <Typography variant="body1">
                    {reportingLines} Field Hands
                </Typography>

            </Paper>
        </Grid>
    )
}


export default function BusinessTab() {
    return (
        <>
            <Grid sx={{ flex: 1, padding: 2, minHeight: 0}} container spacing={4}>
                <ReportingLinesGrid gridSize={4} />
                <ColocationDiscrepanciesGrid gridSize={4} />
                <ReliabilityMetricsGrid gridSize={6} />

                <MaintenanceFlagsGrid gridSize={6}/>

                <LowFuelAlertGrid gridSize={12}/>
            </Grid>

        </>
    )
}