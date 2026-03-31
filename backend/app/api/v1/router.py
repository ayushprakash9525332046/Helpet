from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/test", tags=["Test"])
async def test():
    return {"message": "ApnaSewa API is working! 🚀"}
