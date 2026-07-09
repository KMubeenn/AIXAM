<div align="center">
  <h1>AIXAM: Educational Agent Platform</h1>
  <p>An intelligent, multi-agent educational platform featuring automated material generation, interactive study sessions, and granular performance analytics.</p>
</div>

---

## 🌟 Overview
AIXAM is an advanced educational ecosystem that leverages **Agentic AI (LangGraph)** to empower both students and teachers. It provides an intelligent interface where students can interact with AI to generate study materials (flashcards, mock tests, presentations), while teachers can monitor performance through AI-powered analytics.

*(Note: This platform focuses exclusively on agentic workflow orchestration and generative tools, and does not implement RAG).*

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, Recharts.
- **Backend:** Django 6.0, Django REST Framework, Async Views.
- **Database:** Supabase (PostgreSQL with Connection Pooler).
- **AI / LLMs:** LangChain, LangGraph, Gemini 2.5 Flash, Groq (Llama 3).
- **Testing:** Vitest (Frontend), Pytest (Backend API), LangSmith (AI Evaluation).

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/en/) (v18+)
- [Python](https://www.python.org/) (v3.12+)
- [uv](https://docs.astral.sh/uv/) (Python package manager)

### 1. Clone & Environment Setup
Clone the repository and set up your `.env` file in the backend.

```bash
cd AIXAM/backend
cp .env.example .env
# Fill in your GEMINI_API_KEY, GROQ_API_KEY, and SUPABASE credentials
```

### 2. Start the Backend (Django)
```bash
cd backend
uv sync # Install dependencies
uv run python manage.py migrate
uv run python manage.py runserver
```

### 3. Start the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing
AIXAM implements a comprehensive testing suite spanning UI, API, and LLM schemas.

*   **Frontend UI:** `cd frontend && npx vitest run`
*   **Backend API:** `cd backend && uv run pytest tests/`
*   **AI LLM Evaluations:** `cd backend && uv run python tests/run_llm_evals.py`

## 📚 Detailed Documentation
For deep dives into the technical architecture, please refer to the specific documentation files in the `/docs` folder:

1. [API Documentation](./docs/api_documentation.md) - REST endpoints, JWT Auth, and payloads.
2. [AI & LangGraph Architecture](./docs/ai_architecture.md) - State graphs, LLM routing, and agent schemas.
3. [Frontend Architecture](./docs/frontend_architecture.md) - React state management and UI structure.
