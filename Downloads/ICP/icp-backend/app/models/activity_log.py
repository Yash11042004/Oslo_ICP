from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from pydantic import Field
from app.models.base import MongoBaseModel

class ActionType(str, Enum):
    SEND_MESSAGE = "send_message"
    SCRAPE_POST = "scrape_post"
    SCRAPE_MESSAGES = "scrape_messages"
    CONNECT_REQUEST = "connect_request"
    LIKE_POST = "like_post"
    ENRICH_LEAD = "enrich_lead"
    SAVE_LEAD = "save_lead"
    EMAIL_SENT = "email_sent"

class Platform(str, Enum):
    LINKEDIN = "linkedin"
    EMAIL = "email"
    APOLLO = "apollo"
    SYSTEM = "system"

class Actor(str, Enum):
    AUTOMATION = "automation"
    MANUAL = "manual"

class Source(str, Enum):
    CRON_JOB = "cron-job"
    UI = "ui"
    API = "api"
    BULK_UPLOAD = "bulk-upload"

class Status(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

class ActivityLog(MongoBaseModel):
    user_id: str
    lead_id: Optional[str] = None
    company_id: Optional[str] = None
    action: ActionType
    platform: Platform
    actor: Actor
    source: Source
    context: Dict[str, Any] = {}
    status: Status
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
