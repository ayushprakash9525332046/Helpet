from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, services, bookings

api_router = APIRouter()

# Include auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
