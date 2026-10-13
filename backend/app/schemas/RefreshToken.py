from pydantic import BaseModel

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class InvalidateRefreshTokenRequest(BaseModel):
    refresh_token: str