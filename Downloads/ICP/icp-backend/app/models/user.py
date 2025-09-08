from datetime import datetime
from typing import Optional
from pydantic import Field
from app.models.base import MongoBaseModel

class User(MongoBaseModel):
    name: str
    email: str
    password: str
    role: str = "user"
    linkedin_url: Optional[str] = None
    phone_number: Optional[str] = None
    whatsapp: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
