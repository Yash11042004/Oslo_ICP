from fastapi import APIRouter
from app.db.mongodb import get_collection

router = APIRouter(prefix="/data", tags=["Data"])

@router.get("/test_db")
def test_db():
    users = get_collection("users")
    count = users.count_documents({})
    return {"msg": f"MongoDB connected. Users collection has {count} documents."}
