from fastapi import Depends, HTTPException, status
from app.routes.auth import get_current_user

def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user
