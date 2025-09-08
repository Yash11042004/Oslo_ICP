from fastapi import APIRouter
from app.services.icp_service import get_icp_by_conversation

router = APIRouter(prefix="/icp", tags=["ICP"])

@router.get("/{conversation_id}")
def get_icp(conversation_id: str):
    icp = get_icp_by_conversation(conversation_id)
    if not icp:
        return {"msg": "No ICP found for this conversation"}
    icp["_id"] = str(icp["_id"])  # convert ObjectId
    return icp
