class HTTPException{
    detail: string = ""
    code: string = ""
    field: string = ""

    constructor(
        detail: string,
        code: string,
        field: string
    ) {
        this.detail = detail
        this.code = code
        this.field = field
    }
}
export {HTTPException}