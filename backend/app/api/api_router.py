from fastapi import APIRouter
from app.api.endpoints import auth, portfolio, contact, admin

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(portfolio.router)
api_router.include_router(contact.router)
api_router.include_router(admin.router)

