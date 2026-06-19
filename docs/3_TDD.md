# Technical Design Document (TDD)
**Project Name:** Medha-AI  
**Domain:** Artificial Intelligence (AI)  

---

## 1. System Architecture
Medha-AI is built on a modern, decoupled microservices-inspired architecture. 
- **Client Tier:** A React single-page application (SPA) providing a dynamic user interface.
- **API/Application Tier:** A FastAPI server handling complex business logic, AI orchestration, and file processing asynchronously.
- **Data/Storage Tier:** Supabase providing PostgreSQL (with pgvector), authentication, and blob storage.
- **AI Tier:** External Large Language Model (LLM) APIs for text generation and embeddings.

## 2. Technology Stack Justification
| Component | Technology | Justification |
|---|---|---|
| Frontend | React | Component-based, vast ecosystem, high performance via virtual DOM. |
| Backend | FastAPI (Python) | High-speed asynchronous support, native Python AI/ML ecosystem compatibility, automatic Swagger documentation. |
| Database | Supabase (Postgres) | Open-source Firebase alternative. `pgvector` extension is critical for vector similarity search needed for RAG. |
| File Storage | Supabase Storage | Seamless integration with DB and Auth for securing user documents. |
| Authentication | Supabase Auth | Out-of-the-box secure JWT management, email/password, and OAuth providers. |

## 3. Database Design
### Key Tables
1. **Users:** `id` (UUID), `email`, `created_at`, `full_name`
2. **Documents:** `id` (UUID), `user_id` (FK), `file_url`, `filename`, `upload_date`
3. **Document_Chunks:** `id`, `document_id` (FK), `chunk_text`, `embedding` (vector(1536))
4. **Flashcards:** `id`, `document_id` (FK), `front_text`, `back_text`
5. **Quizzes:** `id`, `document_id` (FK), `score`, `taken_at`

## 4. API Design
*Base URL: `/api/v1`*

| Endpoint | Method | Description | Payload/Params |
|---|---|---|---|
| `/upload` | POST | Uploads and parses document | `multipart/form-data` (file) |
| `/documents` | GET | Fetches user's documents | Header: Bearer Token |
| `/generate/flashcards` | POST | Generates flashcards | `{ "document_id": "uuid", "count": 10 }` |
| `/generate/quiz` | POST | Generates a quiz | `{ "document_id": "uuid", "difficulty": "medium" }` |
| `/chat` | POST | Q&A with document context | `{ "document_id": "uuid", "query": "string" }` |

## 5. Component Diagram
```mermaid
graph TD
    A[React Client] -->|HTTPS REST| B(FastAPI Server)
    B -->|SQL/HTTPS| C[(Supabase DB & pgvector)]
    B -->|API Request| D{LLM Provider}
    A -->|Auth/Token| E[Supabase Auth]
    B -->|Read/Write| F[Supabase Storage]
```

## 6. Sequence Diagram: Chatbot Query (RAG)
```mermaid
sequenceDiagram
    participant User
    participant React UI
    participant FastAPI
    participant Supabase
    participant LLM

    User->>React UI: Types question
    React UI->>FastAPI: POST /chat {query, doc_id}
    FastAPI->>LLM: Generate embedding for query
    LLM-->>FastAPI: Vector [0.01, 0.05...]
    FastAPI->>Supabase: Similarity search (pgvector)
    Supabase-->>FastAPI: Top 3 matching text chunks
    FastAPI->>LLM: Prompt (Context: Chunks, Question: Query)
    LLM-->>FastAPI: Generated Answer
    FastAPI-->>React UI: JSON Response
    React UI->>User: Displays Answer
```

## 7. Class Diagram (Backend Snippet)
```mermaid
classDiagram
    class DocumentProcessor {
        +extract_text(file)
        +chunk_text(text, size)
    }
    class AIOrchestrator {
        +generate_flashcards(text)
        +generate_quiz(text)
        +chat(query, context)
    }
    class DatabaseManager {
        +store_embedding(chunk, vector)
        +search_similar(vector, limit)
    }
    DocumentProcessor --> DatabaseManager
    AIOrchestrator --> DatabaseManager
```

## 8. Deployment Architecture
- **Frontend Hosting:** Vercel or Netlify (CI/CD connected to main branch).
- **Backend Hosting:** Containerized via Docker, deployed to AWS ECS, Heroku, or Render.
- **Database:** Supabase managed cloud instance.
