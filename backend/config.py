from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    app_name: str = "Tesco Creative Studio"
    app_version: str = "1.0.0"
    debug: bool = True

    # Google Gemini Settings
    gemini_api_key: str = ""

    # Database
    database_url: str = "sqlite:///./tesco_creative.db"

    # File Storage
    upload_dir: str = "./uploads"
    export_dir: str = "./exports"
    max_file_size: int = 10485760  # 10MB
    allowed_extensions: str = "jpg,jpeg,png,webp,gif,svg,bmp,tiff,tif"

    @property
    def allowed_extensions_list(self) -> list:
        """Parse allowed extensions from comma-separated string"""
        return [ext.strip() for ext in self.allowed_extensions.split(',')]

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> list:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(',')]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
