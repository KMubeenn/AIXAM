# LangGraph Migration Plan — Chat App

## Goal

Rewrite the `chat` app's agent/session/streaming layer from **LangChain LCEL** to **LangGraph**, enabling native tool calling (flashcards, assignments, quiz grading, Google Classroom push) while preserving existing RAG, persistence, and streaming functionality.

---

## Current Architecture (What We Have)

```
ChatBot.py          → LCEL chain: prompt | llm (no tools working)
Rag.py              → Hybrid RAG pipeline (Pinecone + FAISS + BM25 + CrossEncoder)
VoiceAgent.py       → Whisper transcription (independent, no LLM)
Prompts.py          → ChatPromptTemplate builder (system + few-shot + history + user)
Streaming.py        → QueueCallbackHandler (async queue for token streaming)
History.py          → BufferWindowMessageHistory (sliding window of k messages)
SessionManager.py   → 3-tier cache: In-memory → Redis → DB
ChatPersistence.py  → Serialize/deserialize memory, save messages to DB
chat_service.py     → Orchestrates chatbot creation, streaming, file processing
token_service.py    → Token counting and cost tracking
redis_service.py    → Centralized Redis caching
pinecone_service.py → Pinecone vector DB wrapper
document_processor.py → Legal PDF chunking with metadata extraction
DocReader.py        → Multi-format document reader (PDF, DOCX, TXT)
model_config.json   → Model provider/fallback configuration
```

---

## Target Architecture (What We Want)

```
ChatBot.py    → LangGraph agent (create_react_agent or custom StateGraph)
                 - prompt as Callable (injects RAG context dynamically)
                 - tools bound natively
                 - built-in agent loop (LLM → tool → LLM → done)
                 - streaming via astream_events (same as now)
                 - checkpointer for session memory (replaces SessionManager + History)

Rag.py        → UNCHANGED — called from within the prompt callable
VoiceAgent.py → UNCHANGED — independent voice transcription
Tools.py      → REWRITTEN — real tools (flashcards, assignments, quiz, classroom)
Prompts.py    → SIMPLIFIED — returns a string/callable, no ChatPromptTemplate
```

---

## File-by-File Plan

### 🔴 DELETE — Files That Become Unnecessary

| File                                                                               | Reason                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [History.py](file:///d:/AIXAM/backend/apps/chat/services/services/History.py)      | `BufferWindowMessageHistory` is replaced by LangGraph's built-in message state. The checkpointer handles persistence automatically.                                                                                         |
| [Streaming.py](file:///d:/AIXAM/backend/apps/chat/services/utilities/Streaming.py) | `QueueCallbackHandler` is no longer needed. LangGraph uses `astream_events` natively without a custom callback handler. The current `ChatBot.ask_stream` already uses `astream_events` — the callback handler is redundant. |

---

### 🟡 REWRITE — Files That Need Major Changes

| File                                                                                          | What Changes                                                                                                                                                                                                                                                                      | Why                                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ChatBot.py](file:///d:/AIXAM/backend/apps/chat/services/agents/ChatBot.py)                   | Replace LCEL chain (`prompt \| llm`) with LangGraph `create_react_agent`. Add a prompt callable that injects RAG context. Use a checkpointer for session memory. Remove `RunnableWithMessageHistory` wrapper.                                                                     | Core of the migration. LCEL chain can't do tool calling loops. LangGraph handles the agent loop natively.                                            |
| [Tools.py](file:///d:/AIXAM/backend/apps/chat/services/services/Tools.py)                     | Replace math tools with real domain tools: `generate_flashcards`, `create_assignment`, `grade_quiz`, `push_to_classroom`. Keep `@tool` decorator (same API).                                                                                                                      | Current math tools are placeholders. The whole point of this migration is to enable real tool calling.                                               |
| [Prompts.py](file:///d:/AIXAM/backend/apps/chat/services/utilities/Prompts.py)                | Simplify `build_prompt()` to return a callable that takes LangGraph state and returns messages with injected RAG context. Remove `ChatPromptTemplate` construction. Keep loading prompt files from markdown.                                                                      | `create_react_agent` accepts a `Callable` for prompt, not a `ChatPromptTemplate`. The prompt files themselves stay, only the assembly logic changes. |
| [SessionManager.py](file:///d:/AIXAM/backend/apps/chat/services/services/SessionManager.py)   | Significantly simplify. LangGraph's checkpointer handles in-memory and persistent state. Redis L2 caching may still be useful as a checkpointer backend, but the 270-line multi-tier system becomes ~50 lines.                                                                    | LangGraph checkpointers (`MemorySaver`, `PostgresSaver`) handle the session memory lifecycle. No need for manual serialization/deserialization.      |
| [ChatPersistence.py](file:///d:/AIXAM/backend/apps/chat/services/services/ChatPersistence.py) | Remove memory serialization/deserialization methods (`serialize_memory`, `deserialize_memory`, `save_session_memory`, `load_session_memory`). Keep message persistence methods (`save_message`, `get_session_messages`, `create_session`, `get_user_sessions`, `delete_session`). | Memory state is now managed by LangGraph checkpointer. But message persistence to DB (for UI display) is still needed — it's a separate concern.     |
| [chat_service.py](file:///d:/AIXAM/backend/apps/chat/services/services/chat_service.py)       | Update `get_or_create_chatbot` to create the LangGraph agent. Update `generate_response_with_persistence` to use the new streaming interface. The `config` dict passed to the agent changes (uses `thread_id` instead of `session_id` + `k`).                                     | Orchestration layer needs to match new agent interface.                                                                                              |

---

### 🟢 KEEP UNCHANGED — Files That Stay As-Is

| File                                                                                                | Why                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Rag.py](file:///d:/AIXAM/backend/apps/chat/services/agents/Rag.py)                                 | The entire RAG pipeline (Pinecone + FAISS + BM25 + reranking + Redis caching) is independent of the agent framework. It gets called from the prompt callable instead of a `RunnableLambda`. |
| [VoiceAgent.py](file:///d:/AIXAM/backend/apps/chat/services/agents/VoiceAgent.py)                   | Pure audio transcription with Whisper. No LangChain/LangGraph dependency.                                                                                                                   |
| [DocReader.py](file:///d:/AIXAM/backend/apps/chat/services/utilities/DocReader.py)                  | Document reading utility. No LangChain dependency.                                                                                                                                          |
| [document_processor.py](file:///d:/AIXAM/backend/apps/chat/services/services/document_processor.py) | PDF processing for Pinecone ingestion. No LangChain agent dependency.                                                                                                                       |
| [pinecone_service.py](file:///d:/AIXAM/backend/apps/chat/services/services/pinecone_service.py)     | Pinecone wrapper. Independent of agent framework.                                                                                                                                           |
| [redis_service.py](file:///d:/AIXAM/backend/apps/chat/services/services/redis_service.py)           | Redis caching. Independent of agent framework. RAG cache and analytics cache still needed.                                                                                                  |
| [token_service.py](file:///d:/AIXAM/backend/apps/chat/services/services/token_service.py)           | Token tracking and cost calculation. Independent of agent framework.                                                                                                                        |
| [models.py](file:///d:/AIXAM/backend/apps/chat/models.py)                                           | Django models (`ChatSession`, `Message`, `SessionMemory`). `SessionMemory` model may become unused if checkpointer uses its own storage, but no harm keeping it.                            |
| [model_config.json](file:///d:/AIXAM/backend/apps/chat/services/configs/model_config.json)          | Model/provider configuration. Independent.                                                                                                                                                  |
| Prompt files (`.md`, `.json` in `configs/prompts/`)                                                 | Stay as-is. `Prompts.py` still loads them, just assembles them differently.                                                                                                                 |
| [chat.py](file:///d:/AIXAM/backend/apps/chat/views/chat.py) (views)                                 | View layer. It calls `chat_service.py` functions which will be updated. The view itself doesn't need changes — it already streams via `StreamingHttpResponse`.                              |

---

### 🔵 NEW — Files To Create

| File                                            | Purpose                                                                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `services/services/Tools.py` (rewrite in place) | Real tool definitions: `generate_flashcards`, `create_assignment`, `grade_quiz`, `push_to_classroom`. Each tool is a `@tool`-decorated async function. |

> [!NOTE]
> Google Classroom integration will require a separate service for OAuth2 and the Google Classroom API. That's a separate concern — the tool itself just calls that service.

---

## Summary Table

| File                    | Action             | Lines (Current) |
| ----------------------- | ------------------ | --------------- |
| `History.py`            | 🔴 DELETE          | 26              |
| `Streaming.py`          | 🔴 DELETE          | 41              |
| `ChatBot.py`            | 🟡 REWRITE         | 139             |
| `Tools.py`              | 🟡 REWRITE         | 55              |
| `Prompts.py`            | 🟡 REWRITE         | 130             |
| `SessionManager.py`     | 🟡 REWRITE         | 271             |
| `ChatPersistence.py`    | 🟡 PARTIAL REWRITE | 310             |
| `chat_service.py`       | 🟡 REWRITE         | 180             |
| `Rag.py`                | 🟢 KEEP            | 349             |
| `VoiceAgent.py`         | 🟢 KEEP            | 161             |
| `DocReader.py`          | 🟢 KEEP            | 271             |
| `document_processor.py` | 🟢 KEEP            | 338             |
| `pinecone_service.py`   | 🟢 KEEP            | 230             |
| `redis_service.py`      | 🟢 KEEP            | 379             |
| `token_service.py`      | 🟢 KEEP            | 312             |
| `models.py`             | 🟢 KEEP            | 134             |
| `views/chat.py`         | 🟢 KEEP            | 108             |
| Config files            | 🟢 KEEP            | —               |

---

## Dependencies

**New packages needed:**

- `langgraph` — core graph framework
- `langgraph-checkpoint` — persistence (comes with langgraph)
- `langgraph-checkpoint-postgres` — if using PostgreSQL checkpointer (optional, can use `MemorySaver` first)

**Packages that stay:**

- `langchain-core`, `langchain-groq`, `langchain-google-genai` — LangGraph uses these underneath
- `langchain-huggingface` — for embeddings in RAG
- All other existing packages

**Packages that may be removed later:**

- None immediately, but `RunnableWithMessageHistory` usage from `langchain-core` is deprecated in favor of LangGraph
