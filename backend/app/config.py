from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://<username>:<password>@127.0.0.1:5432/<db_name>"
    s3_bucket_name: str = "BucketName"
    secret_key: str
    frontend_origin: str  = "http://localhost:5173"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()