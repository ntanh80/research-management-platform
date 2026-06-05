from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    APP_NAME: str = "Research Management Platform"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./data/qlncs.db"
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'
    UPLOAD_DIR: str = "./data/uploads"
    BACKUP_DIR: str = "./data/backups"
    IMPORT_DIR: str = "./data/imports"
    EXPORT_DIR: str = "./data/exports"
    TEMP_DIR: str = "./data/temp"
    LOG_LEVEL: str = "INFO"
    MAX_UPLOAD_SIZE_MB: int = 50
    ACCOUNT_LOCKOUT_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 15
    RATE_LIMIT_AUTH_PER_MIN: int = 10
    RATE_LIMIT_API_PER_MIN: int = 100

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
