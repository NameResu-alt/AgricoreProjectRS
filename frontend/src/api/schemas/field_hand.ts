interface FieldHandBase{
    name: string
    facility_id: number
}

interface FieldHandRead extends FieldHandBase{
    id: number
}

interface FieldHandCreate extends FieldHandBase{

}

interface FieldHandUpdate extends FieldHandBase{
    
}

export type {FieldHandRead, FieldHandCreate, FieldHandUpdate}