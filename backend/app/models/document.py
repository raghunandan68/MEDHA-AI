from datetime import datetime
from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    user_id: str
    filename: str
    file_path: str
    status: str
    created_at: str


class DocumentList(BaseModel):
    documents: list[DocumentOut]


class FlashcardOut(BaseModel):
    id: str
    document_id: str
    front: str
    back: str
    topic: str
    created_at: str


class FlashcardList(BaseModel):
    flashcards: list[FlashcardOut]


class QuizOut(BaseModel):
    id: str
    document_id: str
    question: str
    options: list[str]
    correct_answer: int
    explanation: str
    created_at: str


class QuizList(BaseModel):
    quizzes: list[QuizOut]


class QuizAttemptIn(BaseModel):
    document_id: str
    score: int
    total: int
    answers: list[int]


class QuizAttemptOut(BaseModel):
    id: str
    user_id: str
    document_id: str
    score: int
    total: int
    answers: list[int]
    completed_at: str
    document_name: str | None = None


class QuizAttemptList(BaseModel):
    attempts: list[QuizAttemptOut]


class AnalyticsOverview(BaseModel):
    total_documents: int
    total_quizzes_taken: int
    average_score: float
    best_score: float
    recent_attempts: list[QuizAttemptOut]
    score_distribution: list[int]
