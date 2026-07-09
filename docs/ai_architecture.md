# AI & LangGraph Architecture

AIXAM heavily utilizes **LangGraph** to construct deterministic, stateful agent workflows. Unlike standard conversational LLMs, our architecture treats AI as a functional pipeline that can generate structured data and execute multi-step plans.

## 1. LLM Routing Strategy
Located at `apps.chat.services.utilities.LLMRouter`, our custom router implements a fallback mechanism to ensure high availability and bypass rate limits.

**Priority Order:**
1. `gemini-2.5-flash` (Primary)
2. `llama-3.3-70b-versatile` (Groq Fallback 1)
3. `llama3-groq-70b-8192-tool-use-preview` (Groq Fallback 2)
4. `llama-3.1-8b-instant` (Groq Fallback 3)

If an API returns a `429 Too Many Requests` or `503 Service Unavailable`, the router marks the model as exhausted for the current session and seamlessly fails over to the next tier.

## 2. Agentic Workflows (LangGraph)
AIXAM implements two distinct agent workflows using LangGraph's `StateGraph`.

### Student Agent (`student.py`)
The Student Agent is responsible for parsing user requests, extracting topics, and routing to specific material generation functions.

**State Schema (`StudentState`):**
Maintains the history, current request, and generated artifacts (flashcards, mock tests) throughout the graph execution.

**Node Execution Flow:**
1.  **Categorization:** Determines if the user is asking a general question or requesting a specific task (e.g., generating flashcards).
2.  **Tool Execution:** If a task is detected, it delegates to `StudentTools` to determine dependencies and execution order.
3.  **Artifact Generation:**
    *   `_generate_flashcards`: Uses `with_structured_output(FlashCardSet)`.
    *   `_generate_mock_test`: Generates MCQ or Descriptive tests.
    *   `_generate_doc`: Assembles PDFs/PPTXs using `DocWriter`.

### Teacher Agent (`teacher.py`)
The Teacher Agent assists educators in generating standardized assignments and rubrics.

**Artifact Generation:**
*   `_generate_assignment`: Outputs a `GeneratedAssignment` structure with clear grading rubrics.
*   `_batch_grade_assignments`: Given student submission data, acts as an automated grading assistant, comparing answers against the rubric.

## 3. Strict Schema Adherence
We do not rely on prompt-engineering for JSON formats. Instead, we use `with_structured_output` (from LangChain) bound to Pydantic/TypedDict schemas. This guarantees the frontend receives predictable keys (e.g., `questions`, `options`, `answer`).

## 4. LangSmith Observability
Our AI testing suite (`tests/run_llm_evals.py`) runs inputs through our real LangGraph router and evaluates the output strictly for schema validity.

**Evaluated Endpoints:**
*   Insights Generation (Dashboard Analytics)
*   Flashcard Generation
*   MCQ Mock Tests
*   Descriptive Mock Tests
*   Assignment Generation
