import pandas as pd
from datetime import datetime, timezone
from app.db.collections import get_company_collection, get_people_collection

def map_employee_size(num_employees: int) -> str:
    """Convert numeric employee counts into size buckets."""
    if num_employees < 50:
        return "1-50"
    elif num_employees < 200:
        return "51-200"
    elif num_employees < 500:
        return "201-500"
    elif num_employees < 1000:
        return "501-1000"
    elif num_employees < 5000:
        return "1001-5000"
    else:
        return "5000+"

def import_vault_excel(file_path: str, country_default: str = None):
    """Import Vault India/USA data into MongoDB."""
    companies = get_company_collection()
    people = get_people_collection()

    df = pd.read_excel(file_path)
    people_added, companies_added, skipped = 0, 0, 0

    for _, row in df.iterrows():
        try:
            first = str(row.get("First Name", "")).strip()
            last = str(row.get("Last Name", "")).strip()
            full_name = f"{first} {last}".strip()
            email = str(row.get("Email", "")).strip()
            company_name = str(row.get("Company", "")).strip()

            if not full_name or not email or not company_name:
                skipped += 1
                continue

            # --- Company handling ---
            company_filter = {"name": company_name, "user_id": None}
            company_doc = companies.find_one(company_filter)
            if not company_doc:
                company_doc = {
                    "company_id": str(hash(company_name)),  # simple unique ID
                    "name": company_name,
                    "domain": None,
                    "industry": row.get("Industry"),
                    "size": None,
                    "location": country_default or row.get("Country"),
                    "website": row.get("Website") if "Website" in row else None,
                    "fetched_from": ["vault"],
                    "user_id": None,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                }
                # Employee size (USA file only)
                if "# Employees" in row and pd.notna(row["# Employees"]):
                    try:
                        company_doc["size"] = map_employee_size(int(row["# Employees"]))
                    except:
                        pass
                companies.insert_one(company_doc)
                companies_added += 1

            # --- People handling ---
            person_doc = {
                "person_id": str(hash(email + full_name)),
                "full_name": full_name,
                "linkedin_url": row.get("Person Linkedin Url") if "Person Linkedin Url" in row else None,
                "emails": [{"value": email}],
                "phones": [],
                "employment": [{
                    "company_id": company_doc["company_id"],
                    "title": row.get("Designation") or row.get("Title"),
                }],
                "seniority": None,
                "department": None,
                "country": country_default or row.get("Country"),
                "user_id": None,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
            people.insert_one(person_doc)
            people_added += 1

        except Exception as e:
            print(f"⚠️ Skipped row due to error: {e}")
            skipped += 1

    return {
        "companies_added": companies_added,
        "people_added": people_added,
        "skipped": skipped,
    }

def import_user_excel(file_path: str, user_id: str, country_default: str = None):
    """Import user-provided Excel data into MongoDB, tied to their user_id."""
    companies = get_company_collection()
    people = get_people_collection()

    df = pd.read_excel(file_path)
    people_added, companies_added, skipped = 0, 0, 0

    for _, row in df.iterrows():
        try:
            first = str(row.get("First Name", "")).strip()
            last = str(row.get("Last Name", "")).strip()
            full_name = f"{first} {last}".strip()
            email = str(row.get("Email", "")).strip()
            company_name = str(row.get("Company", "")).strip()

            if not full_name or not email or not company_name:
                skipped += 1
                continue

            # --- Company (private to user) ---
            company_filter = {"name": company_name, "user_id": user_id}
            company_doc = companies.find_one(company_filter)
            if not company_doc:
                company_doc = {
                    "company_id": str(hash(company_name + user_id)),  # scoped to user
                    "name": company_name,
                    "domain": None,
                    "industry": row.get("Industry"),
                    "size": None,
                    "location": country_default or row.get("Country"),
                    "website": row.get("Website") if "Website" in row else None,
                    "fetched_from": ["user-upload"],
                    "user_id": user_id,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                }
                companies.insert_one(company_doc)
                companies_added += 1

            # --- People (private to user) ---
            person_doc = {
                "person_id": str(hash(email + full_name + user_id)),
                "full_name": full_name,
                "linkedin_url": row.get("Person Linkedin Url") if "Person Linkedin Url" in row else None,
                "emails": [{"value": email}],
                "phones": [],
                "employment": [{
                    "company_id": company_doc["company_id"],
                    "title": row.get("Designation") or row.get("Title"),
                }],
                "seniority": None,
                "department": None,
                "country": country_default or row.get("Country"),
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
            people.insert_one(person_doc)
            people_added += 1

        except Exception as e:
            print(f"⚠️ Skipped row due to error: {e}")
            skipped += 1

    return {
        "companies_added": companies_added,
        "people_added": people_added,
        "skipped": skipped,
    }

