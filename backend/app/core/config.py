from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = 'ClimateGuard AI'
    VERSION: str = '1.0.0'
    DESCRIPTION: str = 'A Multilingual, Location-Aware Climate Risk Information and Preparedness Agent'
    
    # Server
    PORT: int = 8000
    HOST: str = '0.0.0.0'
    DEBUG: bool = True
    ENVIRONMENT: str = 'development'
    
    # Security
    JWT_SECRET: str = 'climateguard-ai-super-secret-key-change-in-production-2026'
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Database
    DATABASE_URL: str = 'sqlite:///./climateguard.db'
    
    # Weather APIs
    WEATHER_API_KEY: Optional[str] = None
    WEATHER_API_BASE_URL: str = 'https://api.openweathermap.org/data/2.5'
    OPEN_METEO_BASE_URL: str = 'https://api.open-meteo.com/v1/forecast'
    
    # AI / LLM
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = 'gemini-2.5-flash'
    
    # ChromaDB
    CHROMA_PERSIST_DIR: str = './data/chroma_db'
    
    # Demo Mode
    DEMO_MODE: bool = False

    class Config:
        env_file = 'backend/.env'
        extra = 'ignore'

settings = Settings()
