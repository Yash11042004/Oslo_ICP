from typing import Any, Dict, Optional, List, Tuple
import re
from bson.regex import Regex
from bson import ObjectId
from app.db.collections import get_company_collection, get_people_collection

def _ensure_list(v: Any) -> List[Any]:
    if v is None:
        return []
    return v if isinstance(v, (list, tuple, set)) else [v]

def _rx_or_in(value: Any) -> Optional[Dict[str, Any]]:
    def to_rx(s: Any):
        if s is None:
            return None
        if isinstance(s, (int, float, bool)):
            s = str(s)
        if isinstance(s, str):
            s = s.strip()
            if not s:
                return None
            return Regex(re.escape(s), "i")
        return None

    if isinstance(value, (list, tuple, set)):
        regs = [to_rx(v) for v in value]
        regs = [r for r in regs if r is not None]
        return {"$in": regs} if regs else None

    r = to_rx(value)
    return {"$regex": r} if r is not None else None

def _user_scope(user_id: Optional[str]) -> Dict[str, Any]:
    ors: List[Dict[str, Any]] = [
        {"user_id": {"$exists": False}},
        {"user_id": None},
    ]
    if user_id:
        ors.append({"user_id": user_id})
        try:
            oid = ObjectId(user_id)
            ors.append({"user_id": oid})
        except Exception:
            pass
    return {"$or": ors}

def _append_and(q: Dict[str, Any], cond: Dict[str, Any]) -> Dict[str, Any]:
    if not cond:
        return q
    if "$and" in q:
        q["$and"].append(cond)
        return q
    if q:
        return {"$and": [q, cond]}
    return cond

def _first_email_from_person(p: Dict[str, Any]) -> Optional[str]:
    emails = p.get("emails")
    if isinstance(emails, (list, tuple)) and emails:
        first = emails[0]
        if isinstance(first, dict):
            return first.get("value") or first.get("email")
        return str(first)
    return p.get("Email") or p.get("email") or None

def _first_title_from_person(p: Dict[str, Any]) -> Optional[str]:
    emp = p.get("employment")
    candidate = None
    if isinstance(emp, (list, tuple)) and emp:
        candidate = emp[0]
    elif isinstance(emp, dict):
        candidate = emp
    if isinstance(candidate, dict):
        return candidate.get("title") or candidate.get("Designation") or candidate.get("Title")
    return p.get("Designation") or p.get("Title") or None

def _linkedin_from_person(p: Dict[str, Any]) -> Optional[str]:
    return p.get("linkedin_url") or p.get("linkedin") or p.get("LinkedIn") or None

def search_icp(icp_filters: dict, user_id: str | None = None, limit: int = 20):
    companies = get_company_collection()
    people = get_people_collection()

    # ---------- Companies ----------
    c_and: List[Dict[str, Any]] = []

    industry_cond = None
    if "industry" in icp_filters:
        industry_cond = _rx_or_in(icp_filters["industry"])
        if industry_cond:
            c_and.append({
                "$or": [
                    {"industry": industry_cond},
                    {"Industry": industry_cond},
                ]
            })

    india_requested = False
    geo_cond = None
    if "geography" in icp_filters:
        geo_values = icp_filters.get("geography")
        geo_cond = _rx_or_in(geo_values)
        if geo_cond:
            vals = geo_values if isinstance(geo_values, (list, tuple, set)) else [geo_values]
            india_requested = any(isinstance(v, str) and v.strip().lower() == "india" for v in vals)
            or_parts: List[Dict[str, Any]] = [
                {"location": geo_cond},
                {"country": geo_cond},
                {"Country": geo_cond},
            ]
            if india_requested:
                or_parts.extend([
                    {"Country": {"$exists": False}},
                    {"country": {"$exists": False}},
                    {"location": {"$exists": False}},
                ])
            c_and.append({"$or": or_parts})

    if isinstance(icp_filters.get("company_size"), dict):
        cs = icp_filters["company_size"]
        rng: Dict[str, Any] = {}
        for a, b in (("min", "$gte"), ("max", "$lte"), ("gte", "$gte"), ("lte", "$lte")):
            if a in cs and cs[a] is not None:
                rng[b] = cs[a]
        if rng:
            c_and.append({
                "$or": [
                    {"employee_count": rng},
                    {"# Employees": rng},
                ]
            })

    company_query: Dict[str, Any] = {"$and": c_and} if c_and else {}
    company_query = _append_and(company_query, _user_scope(user_id))

    print("Company query:", company_query)

    matched_companies = list(companies.find(company_query).limit(limit))

    if not matched_companies and india_requested:
        relaxed = {"$and": []} if c_and else {}
        for cond in c_and:
            if isinstance(cond, dict) and "$or" in cond:
                ors = cond["$or"]
                if any(isinstance(x, dict) and any(k in x for k in ["Country", "country", "location"]) for x in ors):
                    continue
            _append_and(relaxed, cond)
        relaxed = _append_and(relaxed, _user_scope(user_id))
        print("Company query (relaxed India):", relaxed)
        matched_companies = list(companies.find(relaxed).limit(limit))

    # Build company-name and company-id conditions for people
    company_names: List[str] = []
    company_ids: List[str] = []
    for c in matched_companies:
        # collect multiple possible name fields
        name = c.get("name") or c.get("Company") or c.get("company") or c.get("company_name")
        if name:
            company_names.append(str(name).strip())
        # collect possible id fields that appear in people.employment.company_id
        for id_key in ("company_id", "companyId", "person_id", "personId", "id", "_id"):
            val = c.get(id_key)
            if val is not None:
                company_ids.append(str(val))

    company_based_cond = None
    if company_names:
        company_based_cond = _rx_or_in(company_names)
    else:
        if industry_cond:
            company_based_cond = industry_cond
        elif geo_cond:
            company_based_cond = geo_cond

    # ---------- People ----------
    p_and: List[Dict[str, Any]] = []
    roles_cond = None
    if "roles" in icp_filters:
        roles_cond = _rx_or_in(icp_filters["roles"])
        if roles_cond:
            p_and.append({
                "$or": [
                    {"employment.title": roles_cond},
                    {"Designation": roles_cond},
                    {"Title": roles_cond},
                ]
            })

    # Add company-based matching: try both name-based regex fields and id-based exact fields
    company_or_parts: List[Dict[str, Any]] = []
    if company_based_cond:
        company_or_parts.extend([
            {"Company": company_based_cond},
            {"company": company_based_cond},
            {"company_name": company_based_cond},
            {"employment.company": company_based_cond},
        ])
    if company_ids:
        company_or_parts.extend([
            {"employment.company_id": {"$in": company_ids}},
            {"company_id": {"$in": company_ids}},
            {"person_id": {"$in": company_ids}},
            {"_company_id": {"$in": company_ids}},
        ])
    if company_or_parts:
        p_and.append({"$or": company_or_parts})

    people_query: Dict[str, Any] = {"$and": p_and} if p_and else {}
    people_query = _append_and(people_query, _user_scope(user_id))

    print("People query:", people_query)

    matched_people = list(people.find(people_query).limit(limit))

    # ----- Extra diagnostics (print once per call) -----
    try:
        total_c = companies.estimated_document_count()
        total_p = people.estimated_document_count()
        print(f"[DEBUG] Companies total={total_c}, People total={total_p}, "
              f"found companies={len(matched_companies)}, people={len(matched_people)}")
        print("[DEBUG] Distinct Industry keys (sample):", companies.distinct("Industry")[:5] if hasattr(list, "__getitem__") else "n/a")
        print("[DEBUG] Distinct industry keys (sample):", companies.distinct("industry")[:5] if hasattr(list, "__getitem__") else "n/a")
        print("[DEBUG] Distinct Country keys (sample):", companies.distinct("Country")[:5] if hasattr(list, "__getitem__") else "n/a")
        print("[DEBUG] Distinct country keys (sample):", companies.distinct("country")[:5] if hasattr(list, "__getitem__") else "n/a")
    except Exception:
        pass

    # ----- Shape output (include designation, email, linkedin) -----
    return {
        "companies": [
            {
                "name": c.get("name") or c.get("Company"),
                "industry": c.get("industry") or c.get("Industry"),
                "size": c.get("size") or c.get("employee_count") or c.get("# Employees"),
                "location": c.get("location") or c.get("country") or c.get("Country"),
            }
            for c in matched_companies
        ],
        "people": [
            {
                "full_name": p.get("full_name") or f"{p.get('First Name','')} {p.get('Last Name','')}".strip(),
                "designation": _first_title_from_person(p) or "",
                "email": _first_email_from_person(p) or "",
                "linkedin": _linkedin_from_person(p) or "",
                "employment": p.get("employment") or {},
            }
            for p in matched_people
        ],
    }
