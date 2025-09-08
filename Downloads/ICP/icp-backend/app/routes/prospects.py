from fastapi import APIRouter, Depends, HTTPException
from app.services.prospect_service import get_prospect_list, list_prospect_lists
from app.routes.auth import get_current_user

router = APIRouter(prefix="/prospects", tags=["Prospects"])

@router.get("/{prospect_list_id}")
def fetch_prospect_list(prospect_list_id: str, user=Depends(get_current_user)):
    """Fetch a saved prospect list by ID (only if owned by the user)."""
    doc = get_prospect_list(prospect_list_id, str(user["_id"]))
    if not doc:
        raise HTTPException(status_code=404, detail="Prospect list not found or not yours")

    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
def fetch_all_prospect_lists(user=Depends(get_current_user)):
    """List all saved prospect lists for the logged-in user."""
    lists = list_prospect_lists(str(user["_id"]))
    for doc in lists:
        doc["_id"] = str(doc["_id"])
    return lists
