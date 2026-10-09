from pydantic import BaseModel, ConfigDict
from datetime import datetime
from fastapi import UploadFile

class ServiceReportBase(BaseModel):
    file_url: str
    notes: str
    #Timestamp is str, just in case there's some conflict with the db and getting the data
    timestamp: datetime
    field_job_id: int


class ServiceReportRead(ServiceReportBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ServiceReportCreate(ServiceReportBase):
    timestamp: datetime | None = None
    pass

class ServiceReportUpdate(ServiceReportBase):
    pass