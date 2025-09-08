from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

def test_connection():
    try:
        client.admin.command("ping")
        print("✅ MongoDB Atlas connected")
    except Exception as e:
        print("❌ MongoDB connection error:", e)

def get_collection(name: str):
    return db[name]
