import type { EquipmentRead, EquipmentMetric } from "./equipment"
import type { FarmMaintenanceRatio } from "./farm"
import type { FieldJobRead } from "./field_job"

type LowFuelAlert = EquipmentRead[]

type ColocationDiscrepancies = FieldJobRead[]

type ReliabilityMetrics = Record<string, EquipmentMetric>

type MaintenanceFlags = Record<number, FarmMaintenanceRatio>

type ReportingLines = number

export type {LowFuelAlert, ColocationDiscrepancies, ReliabilityMetrics, MaintenanceFlags, ReportingLines}