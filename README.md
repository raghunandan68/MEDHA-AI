# Medha AI

AI-powered study companion that uploads documents, generates flashcards and quizzes, and provides a Q&A chatbot grounded in your content.

## Architecture

```
MEDHA-AI/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, router registration, health check
│   │   ├── config.py               # Settings (env vars) via pydantic-settings
│   │   ├── database.py             # Supabase client factory, get_user_id()
│   │   ├── models/                 # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   └── document.py         # documents, flashcards, quizzes, attempts, analytics
│   │   ├── routers/                # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── flashcards.py
│   │   │   ├── quizzes.py
│   │   │   ├── chat.py
│   │   │   └── analytics.py
│   │   └── services/
│   │       ├── ai_service.py       # LLM prompt orchestration + mock fallbacks
│   │       ├── pdf_processor.py    # Text extraction + OCR pipeline
│   │       └── storage.py          # Download-from-Storage + extract-text helper
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── Procfile
│   └── run.py                      # Local dev entrypoint
├── database/
│   └── schema.sql                  # Tables, indexes, RLS policies, storage bucket policies
├── docs/                           # SRS, FRD, TDD, test docs, deployment doc, etc.
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Route definitions
│   │   ├── main.tsx
│   │   ├── components/             # Layout, Navbar, Sidebar, FlashCard, ProtectedRoute, Particles
│   │   ├── lib/                    # AuthContext, DocumentContext, api.ts, supabase.ts
│   │   ├── pages/                  # Home, Login, Register, Dashboard, Flashcards, Quiz,
│   │   │                           # Chat, Analytics, History, Settings, AttemptReview, etc.
│   │   └── types/index.ts          # Shared TS interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── render.yaml                     # Backend deploy config (Render)
├── vercel.json                     # Frontend deploy config (Vercel)
└── package.json                    # Root-level scripts
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project (free tier works)
- Groq or OpenAI API key

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-key
# or
OPENAI_API_KEY=your-openai-key
```

Run:

```bash
python run.py
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

### Database

Run `database/schema.sql` in your Supabase SQL editor to create tables and RLS policies.

## Features

- **Document upload** — PDF or paste text
- **Flashcards** — auto-generated from documents
- **Quizzes** — multiple-choice with explanations
- **Chat** — strict RAG Q&A grounded in your uploaded content
- **Analytics** — quiz scores and progress tracking
