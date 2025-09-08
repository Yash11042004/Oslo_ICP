from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, chat, icp, data, admin, imports, prospects, search
from app.db.collections import get_user_collection, get_people_collection

app = FastAPI(title="ICP Builder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Indexes for production
    users = get_user_collection()
    users.create_index("email", unique=True)

    people = get_people_collection()
    people.create_index([("seniority", 1), ("department", 1)])

# Routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(icp.router)
app.include_router(data.router)
app.include_router(admin.router)
app.include_router(imports.router)
app.include_router(prospects.router)
app.include_router(search.router)
 
@app.get("/")
def root():
    return {"message": "ICP Builder Backend Running 🚀"}
