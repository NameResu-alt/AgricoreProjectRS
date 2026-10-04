import os
from sqlalchemy.exc import IntegrityError
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from asyncpg import exceptions
from app.routers import FarmRouter, EquipmentRouter, FieldHandRouter, FieldJobRouter, ServiceReportRouter, BusinessRouter, AuthRouter
from app.models import Base

app = FastAPI(
    title="Agricore",
    description="Agricore Control Flow",
    version="0.1.0"
)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(FarmRouter)
app.include_router(EquipmentRouter)
app.include_router(FieldHandRouter)
app.include_router(FieldJobRouter)
app.include_router(ServiceReportRouter)
app.include_router(BusinessRouter)
app.include_router(AuthRouter)

@app.get("/health")
async def test_health():
    return {"status":"OK"}

@app.exception_handler(IntegrityError)
async def integrity_error_handler(
    request: Request,
    exc: IntegrityError,
) -> JSONResponse:
    cause = exc.orig.__cause__

    if isinstance(cause, exceptions.UniqueViolationError):
        return JSONResponse(
            status_code=409,
            content={"detail": "A resource with this value already exists."},
        )

    if isinstance(cause, exceptions.ForeignKeyViolationError):

        field = (
            str(cause.constraint_name)
            .removeprefix(f"{cause.table_name}_")
            .removesuffix("_fkey")
        )
        return JSONResponse(
            status_code=409,
            content={
                "detail": cause.detail,
                "code": "FOREIGN_KEY_VIOLATION",
                "field": field,
            },
        )

    if isinstance(cause, exceptions.NotNullViolationError):
        return JSONResponse(
            status_code=400,
            content={"detail": "A required field was not provided.", "Info": cause.__repr__()},
        )

    if isinstance(cause, exceptions.CheckViolationError):
        return JSONResponse(
            status_code=400,
            content={"detail": "The provided value violates a database constraint."},
        )
        
    

    return JSONResponse(
        status_code=500,
        content={"detail": "A database integrity error occurred."},
    )