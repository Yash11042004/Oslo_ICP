from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import shutil, os, uuid
from app.services.import_service import import_user_excel
from app.routes.auth import get_current_user

router = APIRouter(prefix="/import", tags=["User Imports"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/excel")
def import_excel(file: UploadFile = File(...), user=Depends(get_current_user)):
    """
    User endpoint to import their own Excel data.
    Imported records are private and linked to their user_id.
    """
    try:
        # Save uploaded file temporarily
        temp_filename = f"{uuid.uuid4()}_{file.filename}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Default country (if missing in file) can be passed in future
        country_default = None

        # Run import service
        result = import_user_excel(temp_path, str(user["_id"]), country_default=country_default)

        # Clean up temp file
        os.remove(temp_path)

        return {"msg": "User data imported successfully", "summary": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {e}")
