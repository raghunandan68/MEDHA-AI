import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header

from app.database import get_supabase, get_user_id
from app.models.document import QuizOut, QuizList, QuizAttemptIn, QuizAttemptOut, QuizAttemptList
from app.services.ai_service import generate_quiz
from app.services.storage import download_and_extract_text

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


def _extract_token(authorization: str) -> str:
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


@router.get("/document/{doc_id}", response_model=QuizList)
async def get_quizzes(doc_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("quizzes").select("*").eq("document_id", doc_id).execute()
    quizzes = [QuizOut(**q) for q in resp.data] if resp.data else []
    return QuizList(quizzes=quizzes)


@router.post("/generate/{doc_id}", response_model=QuizList)
async def generate_quizzes_for_doc(doc_id: str, count: int = 5, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    count = max(1, min(count, 20))

    supabase = get_supabase()
    doc_resp = supabase.table("documents").select("*").eq("id", doc_id).eq("user_id", user_id).execute()
    if not doc_resp.data:
        raise HTTPException(status_code=404, detail="Document not found")

    supabase.table("quizzes").delete().eq("document_id", doc_id).execute()

    doc = doc_resp.data[0]
    storage_path = doc["file_path"]
    text = download_and_extract_text(storage_path, user_token=token)

    fc_resp = supabase.table("flashcards").select("front").eq("document_id", doc_id).execute()
    exclude_questions = [c["front"] for c in fc_resp.data] if fc_resp.data else None

    quizzes_data = generate_quiz(text, count=count, exclude_questions=exclude_questions)

    created_at = datetime.now(timezone.utc).isoformat()
    inserted = []
    for q in quizzes_data:
        record = {
            "document_id": doc_id,
            "question": q.get("question", "Sample question")[:500],
            "options": q.get("options", ["A", "B", "C", "D"]),
            "correct_answer": q.get("correct_answer", 0),
            "explanation": q.get("explanation", "")[:500],
            "topic": q.get("topic", "")[:100],
            "created_at": created_at,
        }
        resp = supabase.table("quizzes").insert(record).execute()
        if resp.data:
            inserted.append(QuizOut(**resp.data[0]))

    return QuizList(quizzes=inserted)


@router.post("/attempt", response_model=QuizAttemptOut)
async def submit_attempt(body: QuizAttemptIn, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    record = {
        "user_id": user_id,
        "document_id": body.document_id,
        "score": body.score,
        "total": body.total,
        "answers": body.answers,
    }
    resp = supabase.table("quiz_attempts").insert(record).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to record attempt")

    return QuizAttemptOut(
        id=resp.data[0]["id"],
        user_id=user_id,
        document_id=body.document_id,
        score=body.score,
        total=body.total,
        answers=body.answers,
        completed_at=resp.data[0]["completed_at"],
    )


@router.get("/attempts", response_model=QuizAttemptList)
async def list_attempts(authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("quiz_attempts").select("*, documents!inner(filename)").eq("user_id", user_id).order("completed_at", desc=True).limit(50).execute()
    attempts = []
    for a in resp.data or []:
        attempts.append(QuizAttemptOut(
            id=a["id"],
            user_id=a["user_id"],
            document_id=a["document_id"],
            score=a["score"],
            total=a["total"],
            answers=a.get("answers", []),
            completed_at=a["completed_at"],
            document_name=a.get("documents", {}).get("filename") if isinstance(a.get("documents"), dict) else None,
        ))
    return QuizAttemptList(attempts=attempts)


@router.get("/attempts/{attempt_id}")
async def get_attempt(attempt_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("quiz_attempts").select("*, documents(filename)").eq("id", attempt_id).eq("user_id", user_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Attempt not found")

    a = resp.data[0]
    doc_id = a["document_id"]

    quizzes_resp = supabase.table("quizzes").select("*").eq("document_id", doc_id).execute()
    quizzes = quizzes_resp.data or []

    return {
        "id": a["id"],
        "document_id": doc_id,
        "document_name": (a.get("documents") or {}).get("filename") if isinstance(a.get("documents"), dict) else None,
        "score": a["score"],
        "total": a["total"],
        "answers": a.get("answers", []),
        "completed_at": a["completed_at"],
        "quizzes": quizzes,
    }


@router.delete("/attempts/{attempt_id}")
async def delete_attempt(attempt_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("quiz_attempts").select("id").eq("id", attempt_id).eq("user_id", user_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Attempt not found")

    supabase.table("quiz_attempts").delete().eq("id", attempt_id).execute()
    return {"ok": True}
