/**
 * class ServiceReportBase(BaseModel):
    file_url: str
    notes: str
    #Timestamp is str, just in case there's some conflict with the db and getting the data
    timestamp: datetime
    field_job_id: int

class ServiceReportRead(ServiceReportBase):
    id: int
 * 
 */

interface ServiceReportBase{
    file_url: string
    notes: string
    timestamp: string
    field_job_id: number
}

interface ServiceReportRead extends ServiceReportBase{
    id: number
}

interface ServiceReportCreate extends ServiceReportBase{
    diagnostic_report: File
}

interface ServiceReportUpdate extends ServiceReportBase{

}

export type {ServiceReportRead, ServiceReportCreate, ServiceReportUpdate}