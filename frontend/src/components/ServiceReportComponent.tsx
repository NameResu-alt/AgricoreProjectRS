import { UserRole } from "../api/schemas/auth";
import type { ServiceReportCreate, ServiceReportRead, ServiceReportUpdate } from "../api/schemas/service_report";
import { useAuth } from "../context/AuthContext";
import GenericDataGridComponent, { DefaultDeleteButton, DefaultUpdateButton, type GenericGridColumn, type GridActions } from "./GenericDataGridComponent";

export default function ServiceReportTab(){
    const {user} = useAuth()

    function definition(actions: GridActions<ServiceReportRead>){
        const columns: GenericGridColumn<ServiceReportRead>[] = [
            {
                field:"id",
                headerName:"ID",
                type:"number",
                width:30
            },
            {
                field:"file_url",
                headerName:"File URL",
            },
            {
                field:"notes",
                headerName:"Notes"
            },
            {
                field:"timestamp",
                headerName:"Timestamp"
            },
            {
                field:"field_job_id",
                headerName:"Field Job ID",
                type:"number"
            }
        ]

        if(user?.role == UserRole.ADMIN){
            columns.push(DefaultDeleteButton(actions))
            columns.push(DefaultUpdateButton(actions, "Update Service Report"))
        }


        return columns
    }

    const emptyModel : ServiceReportRead = {
        id: 0,
        file_url: "",
        notes: "",
        timestamp:"",
        field_job_id: 0
    }

    return (
        <GenericDataGridComponent<ServiceReportRead, ServiceReportCreate, ServiceReportUpdate> urlBase="/service_reports" emptyModel={emptyModel} columnDefinitions={definition} />
    )

}