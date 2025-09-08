from datetime import datetime
from typing import List, Optional
from pydantic import Field
from app.models.base import MongoBaseModel

class ICPSession(MongoBaseModel):
    conversation_id: str
    user_id: Optional[str] = None

    # Core ICP fields
    industry: Optional[str] = None
    roles: List[str] = []
    company_size: Optional[str] = None
    geography: Optional[str] = None

    # Free text context
    notes: Optional[str] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
