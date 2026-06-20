import math
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header

from app.database import get_supabase, get_user_id
from app.models.document import FlashcardOut, FlashcardList
from app.services.storage import download_and_extract_text
from app.services.ai_service import generate_flashcards

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])


def _extract_token(authorization: str) -> str:
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


def _adaptive_count(text: str) -> int:
    length = len(text)
    if length < 500:
        return 3
    if length < 2000:
        return 5
    if length < 5000:
        return 10
    return min(50, 10 + math.floor((length - 5000) / 300))


@router.get("/document/{doc_id}", response_model=FlashcardList)
async def get_flashcards(doc_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("flashcards").select("*").eq("document_id", doc_id).execute()
    cards = [FlashcardOut(**c) for c in resp.data] if resp.data else []
    return FlashcardList(flashcards=cards)


@router.post("/generate/{doc_id}", response_model=FlashcardList)
async def generate_flashcards_for_doc(doc_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    doc_resp = supabase.table("documents").select("*").eq("id", doc_id).eq("user_id", user_id).execute()
    if not doc_resp.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = doc_resp.data[0]
    storage_path = doc["file_path"]

    text = download_and_extract_text(storage_path, user_token=token)
    count = _adaptive_count(text)
    supabase.table("flashcards").delete().eq("document_id", doc_id).execute()

    cards_data = generate_flashcards(text, count=count)

    created_at = datetime.now(timezone.utc).isoformat()
    inserted = []
    for card in cards_data:
        record = {
            "document_id": doc_id,
            "front": card.get("front", "What is this concept?")[:500],
            "back": card.get("back", "Review the document for details.")[:500],
            "topic": card.get("topic", "General")[:100],
            "created_at": created_at,
        }
        resp = supabase.table("flashcards").insert(record).execute()
        if resp.data:
            inserted.append(FlashcardOut(**resp.data[0]))

    return FlashcardList(flashcards=inserted)
