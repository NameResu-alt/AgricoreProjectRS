const FieldJobPriority = {
    LOW:"Low",
    MEDIUM:"Medium",
    CRITICAL:"Critical"
} as const;

const FieldJobStatus = {
    PENDING:"Pending",
    IN_PROGRESS:"In-Progress",
    COMPLETED:"Completed",
    FAILED:"Failed"
} as const;

interface FieldJobBase{
    title: string
    priority: FieldJobPriority
    status: FieldJobStatus
    equipment_id: number
    operator_id: number
}

interface FieldJobRead extends FieldJobBase{
    id: number
}

interface FieldJobCreate extends FieldJobBase{

}

interface FieldJobUpdate extends FieldJobBase{

}

interface FieldJobPatchStatus {
    status: FieldJobStatus
}

type FieldJobPriority = typeof FieldJobPriority[keyof typeof FieldJobPriority]
type FieldJobStatus = typeof FieldJobStatus[keyof typeof FieldJobStatus]

export type {FieldJobRead, FieldJobCreate, FieldJobUpdate, FieldJobPatchStatus}
export {FieldJobPriority, FieldJobStatus}