import sys
import os
from datetime import datetime

# ✅ Add project root to sys.path so "app" can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import db
from app.core.security import get_password_hash


def create_admin(name: str, email: str, password: str):
    existing = db.users.find_one({"email": email})
    if existing:
        print(f"⚠️ User with email {email} already exists.")
        return

    hashed_pw = get_password_hash(password)

    admin_doc = {
        "name": name,
        "email": email,
        "password": hashed_pw,
        "role": "admin",   # ✅ mark as admin
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    db.users.insert_one(admin_doc)
    print(f"✅ Admin created: {email} (name: {name})")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python scripts/create_admin.py <name> <email> <password>")
        sys.exit(1)

    name, email, password = sys.argv[1], sys.argv[2], sys.argv[3]
    create_admin(name, email, password)
