from bson import ObjectId
from app.db.collections import get_user_collection
from app.models.user import User

def create_user(user: User) -> str:
    users = get_user_collection()
    result = users.insert_one(user.dict(by_alias=True))
    return str(result.inserted_id)

def get_user_by_email(email: str):
    users = get_user_collection()
    return users.find_one({"email": email})

def get_user_by_id(user_id: str):
    users = get_user_collection()
    return users.find_one({"_id": ObjectId(user_id)})
