from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.routes.auth import get_current_user
from app.services.search_service import search_icp

router = APIRouter(prefix="/search", tags=["Search"])

class CompanySizeRange(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None
    gte: Optional[int] = None
    lte: Optional[int] = None

class SearchRequest(BaseModel):
    industry: Optional[List[str] | str] = None
    geography: Optional[List[str] | str] = None
    roles: Optional[List[str] | str] = None
    company_size: Optional[CompanySizeRange | str] = None
    limit: int = 50

@router.post("/")
def search(req: SearchRequest, user=Depends(get_current_user)):
    # convert pydantic model to dict (keep only provided)
    payload: Dict[str, Any] = {k: v for k, v in req.dict(exclude_none=True).items() if k != "limit"}
    results = search_icp(payload, user_id=str(user["_id"]), limit=req.limit)
    return {"results": results}
