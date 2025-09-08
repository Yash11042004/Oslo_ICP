import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "ICP Builder API"
    VERSION: str = "1.0.0"
    MONGO_URI: str = os.getenv("MONGO_URI", "")
    DB_NAME: str = os.getenv("DB_NAME", "icp_db")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret")
    JWT_ALGORITHM: str = "HS256"

settings = Settings()
