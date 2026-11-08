from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config.settings import settings
from .config.db import init_db
from .routes.auth_routes import router as auth_router
from .routes.record_routes import router as record_router
from .middlewares.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Инициализация базы данных и создание таблиц
    init_db()
    yield

app = FastAPI(
    title="CRM - Система учета клиентов и оплат",
    description="API для учета клиентов, управления долгами и архивацией задач",
    version="1.0.0",
    lifespan=lifespan
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация обработчиков ошибок
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Подключение маршрутов
app.include_router(auth_router)
app.include_router(record_router)

@app.get("/api/health", tags=["Служебные"])
def health_check():
    return {
        "status": "ok",
        "service": "CRM Clients & Payments API",
        "version": "1.0.0"
    }
