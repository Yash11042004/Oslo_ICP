from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.base import MongoBaseModel

class EmailInfo(BaseModel):
    value: str
    status: str = "active"
    fetched: bool = False
    fetched_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class PhoneInfo(BaseModel):
    value: str
    status: str = "active"
    fetched: bool = False
    fetched_at: Optional[datetime] = None

class Employment(BaseModel):
    company_id: str
    title: str
    from_date: Optional[str] = Field(None, alias="from")
    to_date: Optional[str] = Field(None, alias="to")
    expired: bool = False

    class Config:
        populate_by_name = True

class People(MongoBaseModel):
    person_id: str
    full_name: str
    linkedin_url: Optional[str] = None
    emails: List[EmailInfo] = []
    phones: List[PhoneInfo] = []
    employment: List[Employment] = []
    seniority: Optional[str] = None
    department: Optional[str] = None
    country: Optional[str] = None
    user_id: Optional[str] = None   # ✅ NEW (null = global, set = user-owned)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expire_at: Optional[datetime] = None
