# Test Documentation
**Project Name:** Medha-AI  

---

## 1. Test Plan
**Objective:** Ensure Medha-AI securely handles user data, accurately parses documents, and generates relevant, hallucination-free AI content.
**Scope:** Frontend UI, Backend API endpoints, Database interactions, and external LLM integrations.
**Tools:** Jest (Frontend), PyTest (Backend API), Postman (Manual API Testing), Cypress (E2E).

## 2. Test Strategy
- **Unit Testing:** Validate individual utility functions (e.g., PDF extraction logic, text chunking).
- **Integration Testing:** Test FastAPI endpoints connecting to the Supabase database.
- **System Testing:** End-to-end user workflows (Upload -> Generate -> Quiz).
- **AI Validation:** Manual heuristic evaluation of the generated flashcards and chatbot responses to ensure grounding.

## 3. Test Scenarios
1. User Registration and Authentication.
2. File Uploading with various formats and sizes.
3. Flashcard generation limits and accuracy.
4. Chatbot response context accuracy.
5. Quiz grading logic.

## 4. Test Cases

### Positive Test Cases
| TC ID | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| PTC-01 | Successful Login | Enter valid email and password -> Click Login | Redirects to Dashboard, JWT stored | Pass |
| PTC-02 | Upload Valid PDF | Select 5MB PDF -> Click Upload | File uploads, success toast appears | Pass |
| PTC-03 | Generate Flashcards | Select doc -> Request 5 cards | API returns exactly 5 QA pairs | Pass |
| PTC-04 | Chatbot answers correctly | Ask question present in text | Bot answers using *only* text info | Pass |

### Negative Test Cases
| TC ID | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| NTC-01 | Invalid Login | Enter unregistered email | Error: "Invalid credentials" | Pass |
| NTC-02 | Upload oversized file | Select 60MB PDF | Upload blocked, "File too large" error | Pass |
| NTC-03 | Unsupported format | Upload .exe file | Client-side validation blocks upload | Pass |
| NTC-04 | Hallucination Check | Ask bot about info NOT in document | Bot replies "I cannot find this info" | Pass |

### Boundary Test Cases
| TC ID | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| BTC-01 | Exactly 50MB file | Upload 50.0MB file | Succeeds successfully | Pass |
| BTC-02 | Maximum Flashcards | Request 100 flashcards (max limit) | API returns 100 cards | Pass |
| BTC-03 | Empty Query | Send empty string to Chatbot | Validation error, button disabled | Pass |

## 5. Integration Testing
- Verified FastAPI routes correctly authenticate requests via Supabase JWT verification.
- Verified pgvector similarity search returns expected chunks based on pre-calculated test vectors.

## 6. System & UAT Testing
- **UAT Phase 1 (Internal):** Team members tested UI workflows on multiple devices. Found and fixed overlapping UI bugs on mobile.
- **UAT Phase 2 (Beta Users):** 20 students used the app for 1 week. Reported 95% satisfaction with flashcard quality.

## 7. Test Summary Report
- **Total Test Cases Executed:** 150
- **Pass Rate:** 96%
- **Critical Failures Remaining:** 0
- **Conclusion:** System is stable and ready for production deployment.
