from bson import ObjectId
from app.db.collections import get_leads_collection
from app.models.lead import SavedLead

def save_lead(lead: SavedLead) -> str:
    leads = get_leads_collection()
    result = leads.insert_one(lead.dict(by_alias=True))
    return str(result.inserted_id)

def get_lead_by_id(lead_id: str):
    leads = get_leads_collection()
    return leads.find_one({"_id": ObjectId(lead_id)})

def get_leads_for_user(user_id: str, limit: int = 10):
    leads = get_leads_collection()
    return list(leads.find({"user_id": user_id}).limit(limit))
