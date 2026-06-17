from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import auth, documents, flashcards, quizzes, chat, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Medha AI backend starting with CORS origins: {settings.allowed_origins}")
    yield
    print("Medha AI backend shutting down")


app = FastAPI(
    title="Medha AI API",
    description="Backend API for Medha AI - PDF learning platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(flashcards.router)
app.include_router(quizzes.router)
app.include_router(chat.router)
app.include_router(analytics.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
