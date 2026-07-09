# AIXAM: Multi-Agent Educational Platform

AIXAM is an advanced educational ecosystem powered by **Stateful Multi-Agent Workflows (LangGraph)**. It is designed to bridge the gap between students seeking personalized, adaptive learning aids and teachers looking for automated, rubric-driven course management and grading tools. 

AIXAM operates completely outside standard RAG (Retrieval-Augmented Generation) setups, focusing instead on **direct context-window token orchestration** and **strict structured data schema generation**.

---

## 🔗 Live Production Links
*   **Web Application (Vercel):** [https://aixam-opal.vercel.app/](https://aixam-opal.vercel.app/)
*   **Secure API Endpoint (AWS EC2):** [https://aixam.duckdns.org/api/](https://aixam.duckdns.org/api/)
*   **System Health Check:** [https://aixam.duckdns.org/api/health/](https://aixam.duckdns.org/api/health/)

---

## 🌟 Core System Features

### 🎓 Student Hub (AI-Tutor & Study Materials Generator)
The Student side features an interactive chat interface backed by a dedicated **Student Agent** that plans tasks, compiles notes, and designs study resources:
*   **Interactive AI Study Agent:** A chatbot that guides students through topics, breaks down complex theories, and suggests learning paths.
*   **Flashcards Generator:** Generates a structured deck of recall cards (Q&A) conforming to strict maximum-length limits (1 sentence answers) for rapid learning.
*   **MCQ Mock Tests:** Generates multi-question quizzes with choices and pre-validated correct answers.
*   **Descriptive Mock Tests:** Creates descriptive tests with custom point weights for essay-style practice.
*   **In-Memory Document Export:** Compiles study materials into formatted **PDFs, Word Documents (`.docx`), and PowerPoint Slide Outlines (`.pptx`)** on the fly, bypassing server-side file writes.

### 🏫 Teacher Hub (Course Administration & Grading)
The Teacher side provides tools for classroom management and automates redundant administrative workflows:
*   **Assignment Builder:** Generates structured assignments complete with questions, point weights, and a grading rubric (criteria and feedback guidelines).
*   **AI-Assisted Batch Grading:** Compares student assignment answers against the generated rubric and scores them, providing marks and constructive feedback per question.
*   **Course Management:** Allows teachers to organize topics and view student enrollment.

### 📊 Insights & Analytics Panel
*   **Exam Readiness Meter:** Analyzes overall accuracy and questions attempted to calculate a student's readiness score.
*   **Structured Study Plan:** Provides an actionable study plan mapping weekly tasks based on weaker topics.
*   **Data Visualization:** Incorporates interactive dashboards using `recharts` to render topic-by-topic analytics.

---

## 🛠️ Tech Stack & System Architecture

### Frontend
*   **Core:** React 19, TypeScript, Vite.
*   **State Management:** Zustand ( lightweight client-side authentication and session state) and TanStack React Query (cached server-state sync).
*   **Styling:** Tailwind CSS (with built-in dark mode support).
*   **Charts:** Recharts (responsive performance graphing).

### Backend
*   **Framework:** Django 6.0, Django REST Framework (DRF) running async ASGI.
*   **Database:** Supabase (Remote PostgreSQL database accessed via connection pooler).
*   **Environment:** Synchronized via `uv` package manager.

### AI & Agentic Orchestration
*   **LangGraph Workflows:** Orchestrates both Student and Teacher workflows as state machines (`StateGraph`), allowing the AI to categorize questions, execute dependencies, and output structured data.
*   **Fallback LLM Router:** A robust, rate-limit resilient routing engine (`apps.chat.services.utilities.LLMRouter`) that prioritizes model calls and falls back if rate limits (`429`) or server errors (`503`) occur:
    1.  `gemini-2.5-flash` (Primary Engine)
    2.  `llama-3.3-70b-versatile` (Groq Fallback)
    3.  `llama3-groq-70b-8192-tool-use-preview` (Groq Alternative)
    4.  `llama-3.1-8b-instant` (Groq Light)
*   **Structured Outputs:** Uses LangChain's `with_structured_output` bound to Pydantic/TypedDict classes to guarantee strict JSON schemas (essential for direct frontend chart and table rendering).

---

## 🚀 Local Installation & Run Guide

### Prerequisites
*   Node.js (v18+)
*   Python (v3.12+)
*   `uv` Package Manager (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    uv sync
    ```
3.  Create a `.env` file from the template and fill in your Supabase, Gemini, Groq, and Gmail SMTP credentials:
    ```bash
    cp .env.example .env
    ```
4.  Run database migrations:
    ```bash
    uv run python manage.py migrate
    ```
5.  Start the local Django server:
    ```bash
    uv run python manage.py runserver
    ```
    *(API will run on `http://127.0.0.1:8000/`)*

### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install npm packages:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    *(Frontend will run on `http://localhost:5173/` and automatically proxy to local port 8000)*

---

## 🧪 Comprehensive Testing Suite

AIXAM implements a three-layered testing strategy covering frontend components, backend endpoints, and AI schema validation.

### 1. Frontend UI Tests
Uses **Vitest** and **JSDOM** to test React components, mocking hook data and Zustand auth stores to evaluate logic isolated from the network.
*   **Run command:** `cd frontend && npx vitest run`

### 2. Backend Integration Tests
Uses **Pytest** and **Pytest-Django** to run API routing and database operations.
*   **Run command:** `cd backend && uv run pytest tests/`
*   *(Note: Core database transaction tests are bypassed in the test runner using `@pytest.mark.skip` because Supabase's transaction pooler restricts dynamic creation and destruction of test databases on the cloud).*

### 3. AI Schema Evaluations (LangSmith)
A standalone evaluation script that feeds test inputs into our live LangGraph models and validates the structure, keys, and response schemas via **LangSmith**.
*   **Run command:** `cd backend && uv run python tests/run_llm_evals.py`
*   **Evaluates:** Insights JSON formatting, Flashcards structure, MCQ options mapping, Descriptive Mock test points, and Assignment rubric schemas.

---

## ☁️ Cloud Deployment Setup

### Frontend (Vercel)
*   Deploy directly from your GitHub fork.
*   Configured with `frontend` as root directory.
*   Environment Variable: `VITE_API_URL=https://aixam.duckdns.org/api`

### Backend (AWS EC2 + Nginx + Certbot)
*   **Host:** AWS EC2 `m7i-flex.large` instance running Ubuntu 24.04.
*   **Static IP:** Bound to an AWS Elastic IP (`107.22.44.245`).
*   **Domain:** Mapped via DuckDNS to `aixam.duckdns.org`.
*   **Security:** Port 80 (HTTP) and Port 443 (HTTPS) open.
*   **SSL Handshake:** Managed by Let's Encrypt certificates using Certbot.
*   **Nginx Proxy:** Receives requests on port 80/443 and forwards them internally to the Django Uvicorn server running on `127.0.0.1:8000`.
*   **Process Manager:** Runs in the background via a system service (`aixam.service`).

For more details, check out our **[AWS Deployment Guide](./docs/deployment_guide.md)**.
