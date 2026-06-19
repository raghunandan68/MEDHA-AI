# Software Requirements Specification (SRS)
**Project Name:** Medha-AI  
**Domain:** Artificial Intelligence (AI)  
**Technology Stack:** React, FastAPI, Supabase  
**Team Size:** 8  

---

## 1. Introduction
This Software Requirements Specification (SRS) document provides a comprehensive overview of the Medha-AI project. It defines the system requirements, functionalities, and constraints. Medha-AI is designed as an AI-powered study companion that helps students and professionals interact with their learning materials efficiently.

## 2. Purpose
The purpose of Medha-AI is to revolutionize the study process by leveraging Artificial Intelligence. It enables users to upload study documents and automatically generates interactive flashcards, personalized quizzes, and provides a conversational Q&A chatbot grounded in the uploaded content.

## 3. Scope
The scope of this project encompasses the development of a web application featuring:
- Secure user authentication and profile management.
- Document uploading and parsing capabilities (PDF, DOCX, TXT).
- AI-driven generation of study aids (Flashcards and Quizzes).
- A retrieval-augmented generation (RAG) chatbot for answering questions strictly based on the uploaded material.
- Progress tracking and study analytics.

## 4. Objectives
- **Efficiency:** Reduce the time students spend preparing study materials by 50%.
- **Engagement:** Increase learning retention through active recall (flashcards) and spaced repetition.
- **Accuracy:** Ensure the Q&A chatbot provides highly accurate and context-aware responses based *only* on the provided documents.
- **Scalability:** Design an architecture capable of handling thousands of concurrent users seamlessly.

## 5. Functional Requirements
| Req ID | Requirement Description | Priority |
|---|---|---|
| FR-01 | System shall allow users to register and log in via email or OAuth. | High |
| FR-02 | System shall support uploading of PDF, DOCX, and TXT files (up to 50MB). | High |
| FR-03 | System shall extract text from uploaded documents efficiently. | High |
| FR-04 | System shall generate a specified number of flashcards from the text. | High |
| FR-05 | System shall generate multiple-choice quizzes based on the document. | High |
| FR-06 | System shall provide a Q&A chat interface to query the document content. | High |
| FR-07 | System shall display user progress and quiz scores in a dashboard. | Medium |
| FR-08 | System shall allow users to export flashcards to standard formats (e.g., CSV). | Low |

## 6. Non-Functional Requirements
| NFR ID | Requirement Description |
|---|---|
| NFR-01 | **Performance:** Chatbot response time must be under 3 seconds. |
| NFR-02 | **Scalability:** System should handle up to 10,000 document uploads per day. |
| NFR-03 | **Security:** All user data and documents must be encrypted at rest and in transit. |
| NFR-04 | **Availability:** System shall ensure 99.9% uptime. |
| NFR-05 | **Usability:** The UI must be responsive and accessible (WCAG 2.1 AA compliant). |

## 7. User Roles
1. **Guest/Unregistered User:** Can view landing page, features, and pricing.
2. **Student/Registered User:** Can upload documents, generate study materials, take quizzes, and interact with the chatbot.
3. **Admin:** Can manage users, view platform analytics, and manage system configurations.

## 8. System Features
- **Document Parser Engine:** Utilizes Python libraries to extract textual and tabular data.
- **AI Generator Module:** Integrates with LLMs to synthesize flashcards and quizzes.
- **Contextual Chatbot:** Implements vector search (Supabase pgvector) to fetch relevant document chunks and generate answers.
- **Analytics Dashboard:** Visualizes user engagement and quiz performance over time.

## 9. Assumptions and Constraints
### Assumptions
- Users have access to modern web browsers.
- The external LLM API provides consistent uptime.
### Constraints
- Must be developed within the standard academic/project timeline.
- Budget constraints restrict the usage of ultra-premium LLM models for all users.
- Relies heavily on the accuracy of third-party AI models.

## 10. Use Case Diagrams

```mermaid
usecaseDiagram
    actor "Student (Registered)" as User
    actor "Admin" as Admin

    package "Medha-AI System" {
        usecase "Upload Document" as UC1
        usecase "Generate Flashcards" as UC2
        usecase "Generate Quizzes" as UC3
        usecase "Chat with Document" as UC4
        usecase "View Progress" as UC5
        usecase "Manage Users" as UC6
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    
    Admin --> UC6
```

## 11. User Stories
- **US-01:** As a student, I want to upload my lecture slides so that I can study them interactively.
- **US-02:** As a student, I want the system to generate flashcards so that I can memorize key concepts quickly.
- **US-03:** As a student, I want to ask questions to the chatbot so that I can clarify doubts without reading the entire document again.
- **US-04:** As an admin, I want to view active user metrics so that I can monitor system load.

## 12. Acceptance Criteria
| User Story | Acceptance Criteria |
|---|---|
| US-01 | - Document uploads successfully.<br>- File formats are restricted to PDF/DOCX/TXT.<br>- Error message shown for files > 50MB. |
| US-02 | - Flashcards contain a question on one side and an answer on the other.<br>- Generated content accurately reflects the document. |
| US-03 | - Chatbot responds within 3 seconds.<br>- If the answer is not in the document, chatbot states "I cannot find this in the document." |
