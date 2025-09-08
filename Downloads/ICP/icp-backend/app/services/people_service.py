from bson import ObjectId
from app.db.collections import get_people_collection
from app.models.people import People

def create_person(person: People) -> str:
    people = get_people_collection()
    result = people.insert_one(person.dict(by_alias=True))
    return str(result.inserted_id)

def get_person_by_id(person_id: str):
    people = get_people_collection()
    return people.find_one({"_id": ObjectId(person_id)})

def get_person_by_linkedin(url: str):
    people = get_people_collection()
    return people.find_one({"linkedin_url": url})

def search_people(filters: dict, limit: int = 10, skip: int = 0):
    people = get_people_collection()
    return list(people.find(filters).skip(skip).limit(limit))
