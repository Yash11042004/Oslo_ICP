from datetime import datetime
from app.db.collections import get_refresh_tokens_collection

def save_refresh_token(user_id: str, token: str, expires_at: datetime):
    coll = get_refresh_tokens_collection()
    coll.insert_one({
        "user_id": user_id,
        "token": token,
        "expires_at": expires_at,
        "created_at": datetime.utcnow(),
        "revoked": False
    })

def revoke_refresh_token(token: str):
    coll = get_refresh_tokens_collection()
    coll.update_one({"token": token}, {"$set": {"revoked": True}})

def is_refresh_token_valid(token: str) -> bool:
    coll = get_refresh_tokens_collection()
    record = coll.find_one({"token": token, "revoked": False})
    if not record:
        return False
    # ✅ Also check expiration
    return record["expires_at"] > datetime.utcnow()
