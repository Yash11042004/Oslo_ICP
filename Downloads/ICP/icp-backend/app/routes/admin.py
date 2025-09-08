from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import shutil, os, uuid
from app.services.import_service import import_vault_excel
from app.core.permissions import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/import-vault")
def import_vault(file: UploadFile = File(...), admin=Depends(require_admin)):
    """
    Admin-only endpoint to import Vault Excel data (India/USA).
    """
    try:
        # Save uploaded file temporarily
        temp_filename = f"{uuid.uuid4()}_{file.filename}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # India file has no Country column, so set default
        country_default = "India" if "India" in file.filename else None

        # Run import service
        result = import_vault_excel(temp_path, country_default=country_default)

        # Clean up temp file
        os.remove(temp_path)

        return {"msg": "Vault data imported successfully", "summary": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {e}")
