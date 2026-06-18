from fastapi import APIRouter, HTTPException, Header

from app.database import get_supabase, get_user_id
from app.models.document import AnalyticsOverview, QuizAttemptOut, DocumentPerformance, TopicPerformance

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


_GENERIC_TOPICS = {"core concepts", "core concept", "definitions", "definition",
                   "key findings", "key finding", "introduction", "conclusion",
                   "key terms", "key term", "important ideas", "important idea",
                   "summary", "key takeaways", "key takeaway", "general",
                   "key concept", "key concepts", "main concept", "main concepts",
                   "overview", "fundamentals", "basic concepts", "basic concept"}


def _extract_topic(question: str, stored_topic: str) -> str:
    topic = stored_topic.strip().lower()
    if topic and topic not in _GENERIC_TOPICS:
        return stored_topic.strip()
    q = question.strip().rstrip("?")
    for prefix in ["What is ", "What are ", "What does ", "What do ",
                    "Which of the following ", "According to the document, ",
                    "According to the document "]:
        if q.lower().startswith(prefix.lower()):
            q = q[len(prefix):]
            break
    words = [w.strip("?,.:;!\"'") for w in q.split() if len(w.strip("?,.:;!\"'")) > 2]
    return " ".join(words[:5]) if words else q[:60]


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

    doc_scores: dict[str, dict] = {}
    for a in attempts:
        doc_id = a["document_id"]
        if doc_id not in doc_scores:
            doc_scores[doc_id] = {"total_score": 0, "total_max": 0, "count": 0}
        doc_scores[doc_id]["total_score"] += a["score"]
        doc_scores[doc_id]["total_max"] += a["total"]
        doc_scores[doc_id]["count"] += 1

    document_performance = []
    for doc_id, info in doc_scores.items():
        pct = round((info["total_score"] / info["total_max"]) * 100, 1) if info["total_max"] > 0 else 0.0
        doc_r = supabase.table("documents").select("filename").eq("id", doc_id).execute()
        doc_name = doc_r.data[0].get("filename") if doc_r.data else "Unknown"
        document_performance.append(DocumentPerformance(
            document_name=doc_name,
            document_id=doc_id,
            average_score=pct,
            attempts_count=info["count"],
        ))
    document_performance.sort(key=lambda x: x.average_score)

    topic_scores: dict[str, dict] = {}
    doc_ids_with_quizzes = set()
    for a in attempts:
        doc_ids_with_quizzes.add(a["document_id"])

    quizzes_by_doc: dict[str, list[dict]] = {}
    for doc_id in doc_ids_with_quizzes:
        q_resp = supabase.table("quizzes").select("id,correct_answer,topic,question").eq("document_id", doc_id).execute()
        if q_resp.data:
            quizzes_by_doc[doc_id] = q_resp.data

    for a in attempts:
        doc_id = a["document_id"]
        answers = a.get("answers", [])
        quizzes = quizzes_by_doc.get(doc_id, [])
        for i, quiz in enumerate(quizzes):
            if i >= len(answers):
                break
            topic = _extract_topic(quiz.get("question", ""), quiz.get("topic") or "")
            if not topic:
                continue
            if topic not in topic_scores:
                topic_scores[topic] = {"correct": 0, "total": 0}
            topic_scores[topic]["total"] += 1
            if answers[i] == quiz["correct_answer"]:
                topic_scores[topic]["correct"] += 1

    topic_performance = [
        TopicPerformance(
            topic=topic,
            correct=info["correct"],
            total=info["total"],
            score=round((info["correct"] / info["total"]) * 100, 1) if info["total"] > 0 else 0.0,
        )
        for topic, info in topic_scores.items()
    ]
    topic_performance.sort(key=lambda x: x.score)

    return AnalyticsOverview(
        total_documents=total_documents,
        total_quizzes_taken=total_quizzes,
        average_score=avg_score,
        best_score=best_score,
        recent_attempts=recent,
        score_distribution=score_dist,
        document_performance=document_performance,
        topic_performance=topic_performance,
    )
