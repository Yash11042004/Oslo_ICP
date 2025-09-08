from datetime import datetime
from app.db.collections import get_conversations_collection

def save_message(conversation_id: str, sender: str, text: str):
    conversations = get_conversations_collection()
    conversations.update_one(
        {"conversation_id": conversation_id},
        {"$push": {"messages": {
            "sender": sender,
            "message_text": text,
            "sent_at": datetime.utcnow(),
            "origin": "system" if sender == "assistant" else "user"
        }},
         "$inc": {"total_messages_count": 1},
         "$set": {"last_fetched_at": datetime.utcnow()}},
        upsert=True
    )

def get_conversation(conversation_id: str):
    conversations = get_conversations_collection()
    return conversations.find_one({"conversation_id": conversation_id})

def list_user_conversations(user_id: str, limit: int = 20):
    conversations = get_conversations_collection()
    return list(
        conversations.find({"user_id": user_id})
        .sort("last_fetched_at", -1)
        .limit(limit)
    )

def save_message(conversation_id: str, sender: str, text: str, user_id: str | None = None):
    conversations = get_conversations_collection()
    update_fields = {
        "$push": {"messages": {
            "sender": sender,
            "message_text": text,
            "origin": "system" if sender == "assistant" else "user",
            "sent_at": datetime.utcnow()
        }},
        "$inc": {"total_messages_count": 1},
        "$set": {"last_fetched_at": datetime.utcnow()}
    }
    if user_id:
        update_fields["$set"]["user_id"] = user_id

    conversations.update_one(
        {"conversation_id": conversation_id},
        update_fields,
        upsert=True
    )

def get_conversation(conversation_id: str, user_id: str):
    conversations = get_conversations_collection()
    return conversations.find_one({"conversation_id": conversation_id, "user_id": user_id})

def list_user_conversations(user_id: str, limit: int = 20):
    conversations = get_conversations_collection()
    return list(
        conversations.find({"user_id": user_id})
        .sort("last_fetched_at", -1)
        .limit(limit)
    )

