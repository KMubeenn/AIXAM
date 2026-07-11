# AIXAM: Comprehensive Testing Documentation

AIXAM utilizes a multi-layered testing strategy to guarantee stability, reliability, and correctness across the React frontend, Django backend API, and LangGraph agent schemas.

---

## 🖥️ Frontend Testing Stack

The frontend uses a modern, light, and high-performance testing environment tailored for React and Vite.

### 📦 Libraries & Purpose

| Library                                              | Purpose                                                                                                                                                     |
| :--------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vitest**                                           | A Vite-native unit testing framework. It shares the same configuration, plugins, and loaders as the build engine, making it extremely fast.                 |
| **React Testing Library (`@testing-library/react`)** | Renders React component trees inside a virtual DOM and exposes utilities to query elements in a user-centric way (e.g. searching by visible roles or text). |
| **Jest-DOM (`@testing-library/jest-dom`)**           | Extends Jest/Vitest matchers with specific assertions for DOM nodes (such as `.toBeInTheDocument()`, `.toBeDisabled()`, or `.toHaveStyle()`).               |
| **User Event (`@testing-library/user-event`)**       | Simulates realistic browser mouse clicks, typing, and keyboard interactions, rather than firing raw, unvalidated synthetic events.                          |
| **JSDOM**                                            | A pure-JavaScript implementation of web standards (HTML/DOM) that runs in Node, providing a simulated browser environment for tests.                        |

### 🚀 How to Run Frontend Tests

Navigate to the `frontend/` directory and execute:

```bash
# Run all tests once
npx vitest run

# Run tests in interactive watch mode (automatically reruns on file changes)
npx vitest
```

---

## 🐍 Backend Testing Stack

The backend testing suite targets Django models, asynchronous ASGI view routes, and state transition logic.

### 📦 Libraries & Purpose

| Library            | Purpose                                                                                                                                      |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pytest**         | A powerful and expressive testing framework for Python, used as the primary runner and fixture coordinator.                                  |
| **Pytest-Django**  | Hooks Pytest into the Django lifecycle, automating transaction handling, client setup, and settings overrides.                               |
| **Pytest-Asyncio** | Enforces async test runners via the `@pytest.mark.asyncio` decorator, which is required for AIXAM's asynchronous agent nodes and ASGI tasks. |

### 🚀 How to Run Backend Tests

Navigate to the `backend/` directory and execute:

```bash
# Run all backend unit and integration tests
uv run pytest

# Run a specific test module
uv run pytest apps/chat/tests/test_teacher_agent.py

# Run a specific test function
uv run pytest apps/chat/tests/test_teacher_agent.py -k "test_orchestrator"
```

> [!NOTE]
> **Supabase Cloud Database Mocking/Bypass:**
> Automated tests that require fresh database transactions are skipped (`@pytest.mark.skip`) during normal runs. This is because Supabase's remote Connection Pooler enforces connection limits and blocks dynamic local creation/destruction of transient test databases.

---

## 🤖 AI Schema & Agent Evaluations (LangSmith)

Because LLM outputs are inherently non-deterministic, unit tests are insufficient to guarantee schema compliance. AIXAM incorporates automated structural verification to validate the LangGraph outputs.

### 📦 Tools & Purpose

| Library / Tool                                    | Purpose                                                                                                                                                                                                                                                                   |
| :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **LangSmith SDK**                                 | Tracks LLM execution traces, input/output token payloads, and API call latency.                                                                                                                                                                                           |
| **Custom Eval Runner (`tests/run_llm_evals.py`)** | A custom pipeline script that programmatically runs test inputs through the LangGraph agents, parsing and verifying that the structure, fields, and output data formats conform to Pydantic rules (e.g. verifying quiz options are valid JSON, slides have titles, etc.). |

### 🚀 How to Run AI Evaluations

Navigate to the `backend/` directory and execute:

```bash
# Run LLM schema evaluations
uv run python tests/run_llm_evals.py
```
