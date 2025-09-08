from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import timedelta, datetime
from app.models.user import User
from app.services.user_service import create_user, get_user_by_email
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
)
from app.services.token_service import save_refresh_token, revoke_refresh_token, is_refresh_token_valid

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ======================= Request/Response Schemas =======================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str


# ======================= Helpers =======================

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_email(payload["email"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {"id": str(user["_id"]), "email": user["email"], "name": user["name"]}

# ======================= Routes =======================

@router.post("/register")
def register(data: RegisterRequest):
    existing = get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(name=data.name, email=data.email, password=get_password_hash(data.password))
    create_user(user)
    return {"msg": "User registered successfully"}

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    user = get_user_by_email(data.email)
    if not user or not verify_password(data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user["_id"]), "email": user["email"]}
    )

    # ✅ Save refresh token in DB
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    save_refresh_token(str(user["_id"]), refresh_token, expires_at)

    return {"access_token": access_token, "refresh_token": refresh_token}

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshRequest):
    if not is_refresh_token_valid(req.refresh_token):
        raise HTTPException(status_code=401, detail="Invalid or revoked refresh token")

    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access_token = create_access_token(
        data={"sub": payload["sub"], "email": payload["email"]}
    )
    new_refresh_token = create_refresh_token(
        data={"sub": payload["sub"], "email": payload["email"]}
    )

    # ✅ Save new refresh token, revoke old one
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    save_refresh_token(payload["sub"], new_refresh_token, expires_at)
    revoke_refresh_token(req.refresh_token)

    return {"access_token": new_access_token, "refresh_token": new_refresh_token}

@router.post("/logout")
def logout(req: RefreshRequest, user=Depends(get_current_user)):
    """Logout by revoking the given refresh token"""
    if not is_refresh_token_valid(req.refresh_token):
        raise HTTPException(status_code=400, detail="Refresh token already invalidated")

    revoke_refresh_token(req.refresh_token)
    return {"msg": "Logged out successfully"}
