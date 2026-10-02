import GenericDataGridComponent, { type GenericGridColumn, type GridActions } from "./GenericDataGridComponent"
import { DefaultDeleteButton, DefaultUpdateButton } from "./GenericDataGridComponent";
import { useAuth } from '../context/AuthContext';
import type { FarmRead, FarmCreate, FarmUpdate } from "../api/schemas/farm";
import type { GridColDef } from "@mui/x-data-grid";
import type { FieldHandCreate, FieldHandRead, FieldHandUpdate } from "../api/schemas/field_hand";
import {UserRole} from "../api/schemas/auth"
import { useGridRowSelection } from "@mui/x-data-grid/internals";

export default function FieldHandTab(){
    const {user} = useAuth()

    function definition(actions: GridActions<FieldHandRead>){
        const columns : GenericGridColumn<FieldHandRead>[] = [
            {
                field:"id",
                headerName:"ID",
                type:"number",
                width: 30
            },
            {
                field:"name",
                headerName:"Name"
            },
            {
                field:"facility_id",
                headerName:"Facility Id",
                type:"number"
            }
        ]

        if(user?.role == UserRole.ADMIN){
            columns.push(DefaultDeleteButton(actions))
            columns.push(DefaultUpdateButton(actions, "Update Farm"))
        }

        return columns;
    }

    const emptyModel: FieldHandRead = {
        id: 0,
        name: "",
        facility_id: 0
    }


    return (
        <GenericDataGridComponent<FieldHandRead,FieldHandCreate,FieldHandUpdate> urlBase={"/field_hands"} emptyModel={emptyModel} columnDefinitions={definition}/>
    )
}