from pydantic import BaseModel

class HealthDetailReport(BaseModel):
    s3_healthy: bool