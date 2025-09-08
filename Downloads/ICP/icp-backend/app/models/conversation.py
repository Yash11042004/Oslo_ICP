from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.base import MongoBaseModel

class Message(BaseModel):
    sender: str
    message_text: str
    sent_at: Optional[datetime] = None
    received_at: Optional[datetime] = None
    origin: str = "linkedin-scraped"

class Conversation(MongoBaseModel):
    conversation_id: str
    user_id: str
    lead_id: str
    platform: str = "linkedin"
    last_fetched_at: datetime = Field(default_factory=datetime.utcnow)
    total_messages_count: int = 0
    messages: List[Message] = []
