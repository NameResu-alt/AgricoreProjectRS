import type { FarmRead, FarmCreate, FarmUpdate } from "../api/schemas/farm";
import type { GenericGridColumn, GridActions } from "./GenericDataGridComponent";
import {DefaultDeleteButton, DefaultUpdateButton} from "./GenericDataGridComponent";
import GenericDataGridComponent
 from "./GenericDataGridComponent";

import { useAuth } from '../context/AuthContext';
export default function FarmTab(){
    const {user} = useAuth()

    function definition(actions: GridActions<FarmRead>){
        const columns: GenericGridColumn<FarmRead>[] = [
            {
                field: "id",
                headerName: "ID",
                type:"number",
                width:30
            },
            {
                field:"name",
                headerName:"Name"
            },
            {
                field:"location_region",
                headerName:"Location Region"
            },{
                field:"capacity",
                headerName:"Capacity",
                type:"number"
            },
            {
                field:"supervisor_id",
                headerName:"Supervisor Id"
            }
        ]

        if(user.role == "Admin"){
            columns.push(DefaultDeleteButton(actions))
            columns.push(DefaultUpdateButton(actions, "Update Farm"))
        }

        return columns
    }

    

    /**
     * interface FarmBase{
    name: string
    location_region: string
    capacity: number
    supervisor_id: number   
}

interface FarmRead extends FarmBase{
    id: number
}
     */

    const emptyModel: FarmRead = {
        id: 0,
        name: "",
        location_region:"",
        capacity: 0,
        supervisor_id: 0
    }

    return (
        <GenericDataGridComponent<FarmRead, FarmCreate, FarmUpdate> urlBase={"/farms"} columnDefinitions={definition} emptyModel={emptyModel}/>
    );
}