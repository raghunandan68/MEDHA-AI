# Project Report
**Project Name:** Medha-AI  
**Domain:** Artificial Intelligence (AI)  

---

## 1. Executive Summary
Medha-AI is an innovative AI-powered study companion developed to enhance the learning experience for students and professionals. By leveraging modern web technologies (React, FastAPI) and robust database solutions (Supabase), the project successfully delivers automated study aids, including flashcards, quizzes, and a context-aware chatbot. The system drastically reduces preparation time and improves learning retention through interactive studying.

## 2. Problem Statement
Traditional study methods require students to manually extract key information, create flashcards, and draft practice questions. This process is highly time-consuming, inefficient, and prone to human error or omission. Furthermore, static documents do not allow for interactive querying when a student needs immediate clarification on a specific topic.

## 3. Proposed Solution
Medha-AI addresses this problem by providing an automated, intelligent pipeline. Users upload their existing study materials, and the system instantly analyzes the text to generate interactive flashcards and customized quizzes. Additionally, a Retrieval-Augmented Generation (RAG) chatbot is integrated, allowing users to converse with their documents to clarify doubts instantly.

## 4. Architecture
The system follows a modern client-server architecture:
- **Frontend:** React.js for a responsive, dynamic user interface.
- **Backend:** FastAPI (Python) for handling high-performance asynchronous API requests, document processing, and AI integrations.
- **Database/Auth/Storage:** Supabase, utilizing PostgreSQL with pgvector for semantic search, Supabase Storage for document hosting, and Supabase Auth for identity management.
- **AI Layer:** Integration with Large Language Models (LLMs) to synthesize text and generate embeddings.

## 5. Implementation
The project was executed by an 8-member team over an agile development lifecycle.
- **Sprint 1-2:** Requirements gathering, UI/UX design, and database schema setup.
- **Sprint 3-4:** Frontend scaffolding, user authentication, and file upload API.
- **Sprint 5-6:** Document parsing logic, text chunking, and vector embedding integration.
- **Sprint 7-8:** LLM integration for flashcards and quizzes, followed by chatbot RAG implementation.
- **Sprint 9-10:** Testing, bug fixing, and final deployment.

## 6. Challenges Faced
- **Context Hallucination:** Initially, the chatbot occasionally provided answers outside the scope of the uploaded document. This was mitigated by tightening the LLM prompts and improving the RAG retrieval threshold.
- **Performance with Large PDFs:** Parsing and vectorizing 100+ page PDFs caused timeout errors. The solution involved implementing asynchronous background tasks in FastAPI.
- **State Management:** Managing complex state across the document viewer, chat, and quiz interfaces required refactoring the React state logic.

## 7. Results Achieved
- Successfully processed and vectorized over 500 documents during the beta testing phase.
- Maintained an average chatbot response time of ~2.5 seconds.
- User feedback indicated a 40% reduction in time spent preparing for exams among early adopters.

## 8. Future Enhancements
- Support for video and audio uploads (transcription-based learning).
- Collaborative study rooms where multiple users can query the same document.
- Integration with external learning management systems (LMS) like Canvas or Moodle.

## 9. Conclusion
The Medha-AI project successfully met its core objectives, delivering a robust, scalable, and highly useful AI study tool. The combination of React, FastAPI, and Supabase proved to be an efficient tech stack for rapid development and high performance in AI-driven web applications.
