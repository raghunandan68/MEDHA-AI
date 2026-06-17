# Medha AI

AI-powered study companion that uploads documents, generates flashcards and quizzes, and provides a Q&A chatbot grounded in your content.

## Architecture

```
medha-ai/
├── frontend/        # React 19 + Vite + Tailwind CSS 4
├── backend/         # FastAPI + Supabase (auth, DB, storage)
└── database/        # SQL schema (RLS policies)
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
