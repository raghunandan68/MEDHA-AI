from fastapi import APIRouter, HTTPException, Header

from app.database import get_supabase, get_user_id
from app.models.document import AnalyticsOverview, QuizAttemptOut

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _extract_token(authorization: str) -> str:
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()

    docs_resp = supabase.table("documents").select("id", count="exact").eq("user_id", user_id).execute()
    total_documents = docs_resp.count if hasattr(docs_resp, "count") else len(docs_resp.data or [])

    att_resp = supabase.table("quiz_attempts").select("*").eq("user_id", user_id).order("completed_at", desc=True).execute()
    attempts = att_resp.data or []
    total_quizzes = len(attempts)

    avg_score = 0.0
    best_score = 0.0
    if attempts:
        scores = [(a["score"] / a["total"]) * 100 for a in attempts if a["total"] > 0]
        if scores:
            avg_score = round(sum(scores) / len(scores), 1)
            best_score = round(max(scores), 1)

    recent = []
    for a in attempts[:5]:
        doc_name = None
        if a.get("document_id"):
            doc_r = supabase.table("documents").select("filename").eq("id", a["document_id"]).execute()
            if doc_r.data:
                doc_name = doc_r.data[0].get("filename")
        recent.append(QuizAttemptOut(
            id=a["id"],
            user_id=a["user_id"],
            document_id=a["document_id"],
            score=a["score"],
            total=a["total"],
            answers=a.get("answers", []),
            completed_at=a["completed_at"],
            document_name=doc_name,
        ))

    score_dist = [0] * 10
    for a in attempts:
        if a["total"] > 0:
            pct = int((a["score"] / a["total"]) * 100)
            bucket = min(pct // 10, 9)
            score_dist[bucket] += 1

    return AnalyticsOverview(
        total_documents=total_documents,
        total_quizzes_taken=total_quizzes,
        average_score=avg_score,
        best_score=best_score,
        recent_attempts=recent,
        score_distribution=score_dist,
    )
