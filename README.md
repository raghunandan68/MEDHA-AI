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
