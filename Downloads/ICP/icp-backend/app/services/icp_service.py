from datetime import datetime
from app.db.collections import get_icp_sessions_collection
from app.models.icp_session import ICPSession

def save_icp(session: ICPSession) -> str:
    sessions = get_icp_sessions_collection()
    result = sessions.insert_one(session.dict(by_alias=True))
    return str(result.inserted_id)

def update_icp(conversation_id: str, updates: dict):
    sessions = get_icp_sessions_collection()
    updates["updated_at"] = datetime.utcnow()
    sessions.update_one({"conversation_id": conversation_id}, {"$set": updates}, upsert=True)

def get_icp_by_conversation(conversation_id: str):
    sessions = get_icp_sessions_collection()
    return sessions.find_one({"conversation_id": conversation_id})
