import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import FarmRouter, EquipmentRouter, FieldHandRouter, FieldJobRouter, ServiceReportRouter, BusinessRouter, AuthRouter

app = FastAPI(
    title="Agricore",
    description="Agricore Control Flow",
    version="0.1.0"
)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL,"http://127.0.0.1:8000"],
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