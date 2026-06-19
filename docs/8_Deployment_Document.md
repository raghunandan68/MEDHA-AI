# Deployment Document
**Project Name:** Medha-AI  

---

## 1. Environment Setup
The deployment involves provisioning three environments:
- **Development (Dev):** Localhost configurations with local DB or Supabase dev instance.
- **Staging (QA):** Cloud deployment mirroring production for testing.
- **Production (Prod):** High-availability cloud deployment for live users.

## 2. Prerequisites
- **Node.js** v18+ (for Frontend)
- **Python** 3.10+ (for Backend)
- **Docker** and **docker-compose**
- **Supabase Account** (with an active project)
- **OpenAI API Key** (or preferred LLM provider)
- **Vercel/Netlify Account** (Frontend hosting)
- **AWS/Render/Heroku Account** (Backend hosting)

## 3. Installation Steps (Local Development)

### Supabase Setup
1. Create a new project in Supabase.
2. Run SQL scripts from `database/schema.sql` to create tables and enable `pgvector`.
3. Note the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Backend (FastAPI)
1. Clone repository and navigate to `/backend`.
2. Create a virtual environment: `python -m venv venv` and activate it.
3. Install dependencies: `pip install -r requirements.txt`.
4. Create a `.env` file and add Supabase & OpenAI keys.
5. Run server: `uvicorn main:app --reload --port 8000`.

### Frontend (React)
1. Navigate to `/frontend`.
2. Run `npm install`.
3. Create `.env.local` and add Supabase keys and `REACT_APP_API_URL=http://localhost:8000`.
4. Run: `npm run start`.

## 4. Configuration Steps (Production)
- **CORS:** Ensure FastAPI CORS middleware allows requests ONLY from the production frontend domain (e.g., `https://medha-ai.com`).
- **Environment Variables:** Set production `.env` variables securely in the hosting platform's dashboard. Never commit `.env` files to Git.

## 5. CI/CD Process
- **Version Control:** GitHub is used for source control.
- **Continuous Integration (CI):** GitHub Actions run on every PR to `main`.
  - Frontend: Runs `npm test` and `npm run build`.
  - Backend: Runs `pytest` and checks code formatting (black/flake8).
- **Continuous Deployment (CD):**
  - Merge to `main` triggers Vercel to build and deploy the React frontend automatically.
  - A Docker image of the FastAPI backend is built, pushed to Docker Hub/ECR, and deployed to the production server.

## 6. Rollback Plan
- **Frontend:** Vercel allows instant rollback to the previous successful build with a single click in the dashboard.
- **Backend:** Revert the Git commit, which triggers the CI/CD to rebuild and deploy the previous Docker image. Database rollbacks require restoring a point-in-time snapshot via the Supabase dashboard.

## 7. Production Deployment Checklist
- [ ] All unit and integration tests passing.
- [ ] Environment variables set securely in Vercel and Backend Host.
- [ ] CORS policies strictly defined.
- [ ] Database schema migrations applied to Prod DB.
- [ ] SSL certificates provisioned and active.
- [ ] Smoke testing completed on production environment.
- [ ] API Rate limiting enabled to prevent abuse.
