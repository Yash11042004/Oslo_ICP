from app.db.mongodb import get_collection

def get_user_collection():
    return get_collection("users")

def get_company_collection():
    return get_collection("companies")

def get_people_collection():
    return get_collection("people")

def get_leads_collection():
    return get_collection("leads")

def get_conversations_collection():
    return get_collection("conversations")

def get_activity_logs_collection():
    return get_collection("activity_logs")

def get_icp_sessions_collection():
    return get_collection("icp_sessions")

def get_prospect_lists_collection():
    return get_collection("prospect_lists")

def get_refresh_tokens_collection():
    return get_collection("refresh_tokens")





