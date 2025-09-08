from datetime import datetime
from typing import List, Optional
from pydantic import Field, BaseModel
from app.models.base import MongoBaseModel

class EnrichmentData(BaseModel):
    post_url: Optional[str] = None
    post_overall_text: Optional[str] = None
    comment: Optional[str] = None
    source: str = "linkedin"
    linkedin_status: str = "Not connected"
    outreach_status: str = "pending"
    interest_score: int = 0
    interest_score_reason: Optional[str] = None
    engagement_status: str = "inactive"
    tags: List[str] = []
    last_activity_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SavedLead(MongoBaseModel):
    user_id: str
    lead_id: str
    company_id: str
    saved_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
    tags: List[str] = []
    interaction_status: str = "pending"
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    enrichment: EnrichmentData
