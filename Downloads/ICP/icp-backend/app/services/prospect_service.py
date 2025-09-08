import uuid
from datetime import datetime, timezone
from app.db.collections import get_prospect_lists_collection

def save_prospect_list(user_id: str, conversation_id: str, icp_data: dict, results: dict):
    """Save fetched prospects linked to a conversation + user."""
    coll = get_prospect_lists_collection()
    prospect_list_id = str(uuid.uuid4())

    doc = {
        "prospect_list_id": prospect_list_id,
        "user_id": user_id,
        "conversation_id": conversation_id,
        "icp_filters": icp_data,
        "results": results,
        "created_at": datetime.now(timezone.utc)
    }

    coll.insert_one(doc)
    return doc


def get_prospect_list(prospect_list_id: str, user_id: str):
    coll = get_prospect_lists_collection()
    return coll.find_one({
        "prospect_list_id": prospect_list_id,
        "user_id": user_id
    })

def list_prospect_lists(user_id: str):
    coll = get_prospect_lists_collection()
    return list(coll.find({"user_id": user_id}).sort("created_at", -1))
