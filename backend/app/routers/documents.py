import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from pydantic import BaseModel

from app.database import get_supabase, get_supabase_for_user, get_user_id
from app.models.document import DocumentOut, DocumentList
from app.services.pdf_processor import save_upload, save_text, cleanup_file, ALL_SUPPORTED_EXTENSIONS
from app.services.ai_service import generate_title


class CreateTextDocIn(BaseModel):
    text: str
    filename: str = ""

router = APIRouter(prefix="/api/documents", tags=["documents"])


async def _get_user(token: str = Depends(lambda: None)) -> str:
    raise HTTPException(status_code=401, detail="Not authenticated")


def _extract_token(authorization: str) -> str:
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


@router.get("", response_model=DocumentList)
async def list_documents(authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    docs = [DocumentOut(**d) for d in resp.data] if resp.data else []
    return DocumentList(documents=docs)


@router.post("/upload", response_model=DocumentOut)
async def upload_document(file: UploadFile = File(...), authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = f".{file.filename.lower().rsplit('.', 1)[-1]}" if "." in file.filename else ""

    if ext not in ALL_SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Supported formats: PDF, DOCX, XLSX, CSV, TXT, PNG, JPG, JPEG, BMP, TIFF, WebP"
        )

    bytes_data = await file.read()
    stored_name, local_path = save_upload(bytes_data, file.filename)

    supabase = get_supabase()
    user_client = get_supabase_for_user(token)
    storage_path = f"{user_id}/{stored_name}"
    try:
        user_client.storage.from_("documents").upload(storage_path, bytes_data)
    except Exception as e:
        cleanup_file(local_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload file to storage: {e}")

    doc_data = {
        "user_id": user_id,
        "filename": file.filename,
        "file_path": storage_path,
        "status": "ready",
    }
    resp = supabase.table("documents").insert(doc_data).execute()
    if not resp.data:
        cleanup_file(local_path)
        raise HTTPException(status_code=500, detail="Failed to create document record")

    doc = resp.data[0]
    return DocumentOut(**doc)


@router.post("/from-text", response_model=DocumentOut)
async def create_document_from_text(body: CreateTextDocIn, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty")

    text = body.text.strip()
    ai_title = generate_title(text)
    filename = body.filename or (f"{ai_title}.txt" if ai_title else text[:50].replace("\n", " ").strip() + ".txt")

    stored_name, local_path = save_text(text, filename)

    supabase = get_supabase()
    user_client = get_supabase_for_user(token)
    storage_path = f"{user_id}/{stored_name}"
    try:
        with open(local_path, "rb") as f:
            user_client.storage.from_("documents").upload(storage_path, f.read())
    except Exception as e:
        cleanup_file(local_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload file to storage: {e}")

    doc_data = {
        "user_id": user_id,
        "filename": filename,
        "file_path": storage_path,
        "status": "ready",
    }
    resp = supabase.table("documents").insert(doc_data).execute()
    if not resp.data:
        cleanup_file(local_path)
        raise HTTPException(status_code=500, detail="Failed to create document record")

    return DocumentOut(**resp.data[0])


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    user_client = get_supabase_for_user(token)
    resp = supabase.table("documents").select("file_path").eq("id", doc_id).eq("user_id", user_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Document not found")

    supabase.table("documents").delete().eq("id", doc_id).eq("user_id", user_id).execute()
    try:
        user_client.storage.from_("documents").remove([resp.data[0]["file_path"]])
    except Exception:
        pass

    return {"message": "Document deleted"}
