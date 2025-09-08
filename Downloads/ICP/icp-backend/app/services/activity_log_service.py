from bson import ObjectId
from app.db.collections import get_activity_logs_collection
from app.models.activity_log import ActivityLog

def log_activity(activity: ActivityLog) -> str:
    logs = get_activity_logs_collection()
    result = logs.insert_one(activity.dict(by_alias=True))
    return str(result.inserted_id)

def get_logs_for_user(user_id: str, limit: int = 20):
    logs = get_activity_logs_collection()
    return list(logs.find({"user_id": user_id}).sort("created_at", -1).limit(limit))

def get_logs_by_action(action: str, limit: int = 20):
    logs = get_activity_logs_collection()
    return list(logs.find({"action": action}).limit(limit))
