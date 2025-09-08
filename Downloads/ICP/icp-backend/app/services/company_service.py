from bson import ObjectId
from app.db.collections import get_company_collection
from app.models.company import Company

def create_company(company: Company) -> str:
    companies = get_company_collection()
    result = companies.insert_one(company.dict(by_alias=True))
    return str(result.inserted_id)

def get_company_by_id(company_id: str):
    companies = get_company_collection()
    return companies.find_one({"_id": ObjectId(company_id)})

def get_company_by_name(name: str):
    companies = get_company_collection()
    return companies.find_one({"name": name})

def list_companies(limit: int = 10, skip: int = 0):
    companies = get_company_collection()
    return list(companies.find().skip(skip).limit(limit))
