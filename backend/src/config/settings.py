import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DEFAULT_DB_PATH = (PROJECT_ROOT / "crm.db").as_posix()

raw_db_url = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
# Совместимость с Render Postgres (Render передает postgres://, а SQLAlchemy требует postgresql://)
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

if raw_db_url.startswith("sqlite:///./") or raw_db_url == "sqlite:///crm.db":
    db_filename = raw_db_url.replace("sqlite:///./", "").replace("sqlite:///", "")
    resolved_db_url = f"sqlite:///{(PROJECT_ROOT / db_filename).as_posix()}"
else:
    resolved_db_url = raw_db_url

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "crm-default-jwt-secret-key-2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))
    DATABASE_URL: str = resolved_db_url
    
    _cors_env: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
