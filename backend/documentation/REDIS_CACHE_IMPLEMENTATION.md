# Redis Caching Implementation

## Overview

The Lawbot backend uses Redis for caching to improve performance, reduce database load, and persist state across worker processes. The implementation is designed to be robust, with automatic fallback to in-memory and database persistence if Redis is unavailable.

## Architecture

The caching layer is centralized in `core/services/redis_service.py` and integrated into various services.

### Service Layer (`redis_service.py`)

- **Centralized Client:** Provides both synchronous and asynchronous access to Redis.
- **Connection Pooling:** Uses `redis-py` connection pool.
- **Graceful Fallback:** If Redis is down or not configured, methods return `None` or `False` without crashing, allowing the application to use secondary storage (DB/Memory).
- **Serialization:** Automatically handles JSON serialization/deserialization of Python objects.

### Cache Strategy

| Data Type          | Cache Key Pattern                    | TTL        | Fallback Strategy                             |
| ------------------ | ------------------------------------ | ---------- | --------------------------------------------- |
| **Session Memory** | `lawbot:session_memory:{session_id}` | 24 hours   | In-Memory (L1) -> Redis (L2) -> Database (L3) |
| **RAG Queries**    | `lawbot:rag_cache:{md5_hash}`        | 1 hour     | Re-compute (Pinecone Search + Rerank)         |
| **User Profile**   | `lawbot:user:{user_id}`              | 15 minutes | Database Lookup                               |
| **User Sessions**  | `lawbot:user_sessions:{user_id}`     | 5 minutes  | Database Lookup                               |
| **Analytics**      | `lawbot:analytics:{user_id}:{type}`  | 10 minutes | Database Aggregation                          |

## Implementation Details

### 1. Session Memory Management

**File:** `core/services/SessionManager.py`

Implemented a 3-tier caching hierarchy:

1.  **L1 (In-Memory):** Fastest, per-worker process.
2.  **L2 (Redis):** Shared across workers, survives restarts.
3.  **L3 (Database):** Persistent source of truth.

**Write-Through:** Saves go to In-Memory, Redis, and Database simultaneously.
**Read-Through:** Checks L1 -> L2 -> L3 -> Creates New.

### 2. RAG Query Caching

**File:** `core/agents/Rag.py`

Caches the final results of the hybrid search pipeline (Vector Search + BM25 + Reranking). This significantly reduces latency for repeated questions and saves costs on embedding/reranking computations.

### 3. User & Auth Caching

**Files:** `api/utils/jwt_utils.py`, `api/views/auth.py`

- **Lookup:** `get_user_from_request` checks Redis before DB.
- **Preloading:** On successful login (`auth.py`), a background task warms up the cache with:
  - User Profile
  - List of Chat Sessions
  - Most Recent Session Memory
  - Analytics Summary

### 4. Analytics Caching

**File:** `core/services/token_service.py`

Aggregating usage stats is expensive. We cache:

- User Summary (Total tokens, cost)
- Daily Breakdown
- Session Breakdown

Cache is invalidated automatically when new usage is recorded.

## Configuration

Environment variables in `.env`:

```env
# Redis Configuration
REDIS_HOST=localhost           # Hostname or IP
REDIS_PORT=6379               # Default Port
REDIS_PASSWORD=               # Password (optional)
REDIS_DB=0                    # Database Index
REDIS_SSL=false               # Set to true for AWS ElastiCache
REDIS_CACHE_ENABLED=true      # Master switch to enable/disable
```

## AWS ElastiCache Deployment

For production on AWS:

1.  Create an ElastiCache Redis (cluster mode disabled is simpler for this scale).
2.  Ensure it's in the same VPC as the backend (ECS/EC2/Lambda).
3.  Set `REDIS_SSL=true`.
4.  Update `REDIS_HOST` to the Primary Endpoint.

## Troubleshooting

- **"redis package not installed":** The python `redis` package is missing. Run `pip install redis`.
- **"Redis connection failed":** Check Host/Port in `.env`. Ensure Redis server is running.
- **Data mismatch:** Cache might be stale. Keys automatically expire, but you can manually flush if needed using `redis-cli FLUSHDB`.
