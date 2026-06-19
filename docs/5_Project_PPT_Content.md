# Project Presentation (PPT Content)
**Project Name:** Medha-AI  

---

## Slide 1: Title Slide
**Title:** Medha-AI
**Subtitle:** Your AI-Powered Study Companion
**Key Points:**
- Developed by: [Team Name/Members]
- Tech Stack: React, FastAPI, Supabase
**Suggested Image:** Modern AI/Education abstract graphic or logo.
**Speaker Notes:** "Welcome everyone. Today we are presenting Medha-AI, a revolutionary tool designed to change how we interact with our study materials."

## Slide 2: Project Overview
**Title:** What is Medha-AI?
**Key Points:**
- An AI-powered web application.
- Converts static documents into interactive study materials.
- Features: Automated Flashcards, Smart Quizzes, Context-Aware Chatbot.
**Speaker Notes:** "Medha-AI is essentially a smart assistant. You give it your lecture notes, and it gives you back a fully interactive study session."

## Slide 3: Problem Statement
**Title:** The Challenge with Traditional Studying
**Key Points:**
- Manual material preparation is time-consuming (making flashcards, writing notes).
- Static PDFs offer no interaction or instant clarification.
- High cognitive load just to organize information before learning begins.
**Speaker Notes:** "Students spend hours just prepping to study, rather than actually studying. Static documents can't answer your questions when you're stuck."

## Slide 4: Objectives
**Title:** Our Goals
**Key Points:**
- Reduce study prep time by 50%.
- Enhance retention via active recall.
- Provide highly accurate, document-grounded AI answers.
**Speaker Notes:** "We set out to eliminate the busywork, boost memory retention, and ensure the AI never hallucinates by restricting it to your specific texts."

## Slide 5: Proposed System
**Title:** The Medha-AI Solution
**Key Points:**
- Upload PDF/DOCX/TXT files.
- Instant extraction and vectorization.
- On-demand generation of study aids.
**Speaker Notes:** "Our solution automates the pipeline: Upload, Analyze, Generate."

## Slide 6: Architecture Diagram
**Title:** System Architecture
**Suggested Diagram:** High-level block diagram showing React Frontend -> FastAPI Backend -> Supabase (DB/Storage/Auth) & LLM API.
**Speaker Notes:** "We employ a decoupled architecture. React handles the UI, FastAPI manages the heavy AI logic, and Supabase securely stores our data and embeddings."

## Slide 7: Technology Stack
**Title:** Technologies Used
**Key Points:**
- **Frontend:** React.js, Tailwind CSS (optional)
- **Backend:** FastAPI, Python
- **Database:** Supabase (PostgreSQL, pgvector)
- **AI Models:** OpenAI API / Custom LLM
**Speaker Notes:** "We chose React for UI responsiveness, FastAPI for fast asynchronous python execution needed for AI, and Supabase for its excellent pgvector support."

## Slide 8: Database Design
**Title:** Data Flow & Storage
**Key Points:**
- Relational tables for Users and Documents.
- Vector database (pgvector) for document chunks.
- Cloud buckets for raw file storage.
**Speaker Notes:** "To make the chatbot work, we chunk documents and store them as mathematical vectors, allowing us to perform semantic searches."

## Slide 9: Functional Modules
**Title:** Core Modules
**Key Points:**
1. User Authentication & Profile
2. Document Ingestion & Parsing
3. AI Generation (Flashcards/Quizzes)
4. RAG Chatbot
**Speaker Notes:** "These four modules make up the core of Medha-AI."

## Slide 10: Workflow
**Title:** User Journey
**Key Points:**
- Sign In -> Upload File -> Click "Generate" -> Study!
**Suggested Image:** Flowchart from the FRD.
**Speaker Notes:** "The user journey is incredibly streamlined. Three clicks and you are studying."

## Slide 11: Screenshots (UI/UX)
**Title:** Medha-AI in Action
**Suggested Image:** 2-3 screenshots of the Dashboard, Document Viewer, and Chat interface.
**Speaker Notes:** "Here is a look at our clean, modern interface designed to minimize distractions."

## Slide 12: Testing Strategy
**Title:** Quality Assurance
**Key Points:**
- Automated API testing.
- UI/UX testing for responsiveness.
- AI validation to prevent hallucinations.
**Speaker Notes:** "We rigorously tested the system, especially focusing on ensuring the AI only answered based on the provided text."

## Slide 13: Bug Fixing Process
**Title:** Defect Management
**Key Points:**
- Logged 20 major/minor bugs during development.
- 75% resolution rate before launch.
- Focus on critical AI and Parsing issues.
**Speaker Notes:** "We tracked bugs meticulously. One major fix involved handling large 50MB PDFs without crashing the server."

## Slide 14: Results
**Title:** What We Achieved
**Key Points:**
- Fully functional MVP.
- Sub-3 second AI response times.
- Positive early user feedback.
**Speaker Notes:** "We are proud to say the MVP is fully functional and performs remarkably well under load."

## Slide 15: Challenges
**Title:** Roadblocks & Solutions
**Key Points:**
- Challenge: Processing large documents.
- Solution: Async background tasks.
- Challenge: AI Hallucinations.
- Solution: Strict system prompting and RAG.
**Speaker Notes:** "Working with AI is unpredictable. We had to strictly constrain the LLM to only look at our database, not its general knowledge."

## Slide 16: Future Scope
**Title:** What's Next?
**Key Points:**
- Audio/Video transcript learning.
- Multiplayer study rooms.
- LMS Integration (Canvas/Moodle).
**Speaker Notes:** "In the future, we want to expand to support video lectures and collaborative study sessions."

## Slide 17: Conclusion
**Title:** Summary
**Key Points:**
- Medha-AI successfully modernizes studying.
- Combines practical web dev with cutting-edge AI.
**Speaker Notes:** "Medha-AI is a testament to how AI can be practically applied to solve real-world educational inefficiencies."

## Slide 18: Q&A
**Title:** Questions?
**Suggested Image:** Question mark graphic.
**Speaker Notes:** "Thank you for your time. We would now like to open the floor to any questions."

## Slide 19: Thank You
**Title:** Thank You!
**Key Points:**
- Contact Info / GitHub Repo link.
**Speaker Notes:** "Thank you!"
