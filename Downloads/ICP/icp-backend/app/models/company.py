from datetime import datetime
from typing import List, Optional
from pydantic import Field
from app.models.base import MongoBaseModel

class Company(MongoBaseModel):
    company_id: str
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None   # e.g., "1-50", "51-200", "10000+"
    location: Optional[str] = None
    website: Optional[str] = None
    fetched_from: List[str] = ["import"]  # e.g., "vault", "user"
    user_id: Optional[str] = None   # ✅ NEW (null = global, set = user-owned)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expire_at: Optional[datetime] = None
