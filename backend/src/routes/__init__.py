from .auth_routes import router as auth_router
from .record_routes import router as record_router

__all__ = ["auth_router", "record_router"]
