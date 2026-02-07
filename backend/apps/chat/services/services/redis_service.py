"""
Redis Service - Centralized Redis client for caching.
Supports AWS ElastiCache and local Redis instances.

Cache Types:
- Session Memory: lawbot:session_memory:{session_id}
- RAG Query Results: lawbot:rag_cache:{query_hash}
- User Cache: lawbot:user:{user_id}
- User Sessions: lawbot:user_sessions:{user_id}
- Analytics: lawbot:analytics:{user_id}:{type}
"""
import os
import json
import hashlib
import asyncio
from typing import Any, Optional, Union
from functools import wraps

# Lazy import to handle missing redis package gracefully
_redis_client = None
_async_redis_client = None
_redis_available = None


def _get_config():
    """Get Redis configuration from environment."""
    return {
        "host": os.getenv("REDIS_HOST", "localhost"),
        "port": int(os.getenv("REDIS_PORT", 6379)),
        "password": os.getenv("REDIS_PASSWORD", None) or None,
        "db": int(os.getenv("REDIS_DB", 0)),
        "ssl": os.getenv("REDIS_SSL", "false").lower() == "true",
        "enabled": os.getenv("REDIS_CACHE_ENABLED", "true").lower() == "true",
    }


def _check_redis_available():
    """Check if Redis package is installed and connection works."""
    global _redis_available
    if _redis_available is not None:
        return _redis_available
    
    try:
        import redis
        config = _get_config()
        if not config["enabled"]:
            print("[RedisService] Caching disabled via REDIS_CACHE_ENABLED=false")
            _redis_available = False
            return False
            
        client = redis.Redis(
            host=config["host"],
            port=config["port"],
            password=config["password"],
            db=config["db"],
            ssl=config["ssl"],
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        client.ping()
        print(f"[RedisService] Connected to Redis at {config['host']}:{config['port']}")
        _redis_available = True
    except ImportError:
        print("[RedisService] redis package not installed - caching disabled")
        _redis_available = False
    except Exception as e:
        print(f"[RedisService] Redis connection failed: {e} - using fallback")
        _redis_available = False
    
    return _redis_available


def _get_sync_client():
    """Get or create sync Redis client."""
    global _redis_client
    if not _check_redis_available():
        return None
    if _redis_client is None:
        import redis
        config = _get_config()
        _redis_client = redis.Redis(
            host=config["host"],
            port=config["port"],
            password=config["password"],
            db=config["db"],
            ssl=config["ssl"],
            decode_responses=True,
        )
    return _redis_client


async def _get_async_client():
    """Get or create async Redis client."""
    global _async_redis_client
    if not _check_redis_available():
        return None
    if _async_redis_client is None:
        import redis.asyncio as aioredis
        config = _get_config()
        _async_redis_client = aioredis.Redis(
            host=config["host"],
            port=config["port"],
            password=config["password"],
            db=config["db"],
            ssl=config["ssl"],
            decode_responses=True,
        )
    return _async_redis_client


# TTL Constants (in seconds)
class CacheTTL:
    SESSION_MEMORY = 60 * 60 * 24  # 24 hours
    RAG_QUERY = 60 * 60  # 1 hour
    USER = 60 * 15  # 15 minutes
    USER_SESSIONS = 60 * 5  # 5 minutes
    ANALYTICS = 60 * 10  # 10 minutes


# Key Prefixes
class CacheKey:
    SESSION_MEMORY = "lawbot:session_memory:{}"
    RAG_QUERY = "lawbot:rag_cache:{}"
    USER = "lawbot:user:{}"
    USER_SESSIONS = "lawbot:user_sessions:{}"
    ANALYTICS = "lawbot:analytics:{}:{}"
    
    @staticmethod
    def hash_query(query: str) -> str:
        """Create a hash for RAG query caching."""
        return hashlib.md5(query.lower().strip().encode()).hexdigest()


class RedisService:
    """
    Centralized Redis caching service.
    Provides both sync and async methods with graceful fallback.
    """
    
    # ==================== Core Operations ====================
    
    @staticmethod
    def is_available() -> bool:
        """Check if Redis is available."""
        return _check_redis_available()
    
    @staticmethod
    def ping() -> bool:
        """Test Redis connection."""
        client = _get_sync_client()
        if client:
            try:
                return client.ping()
            except:
                return False
        return False
    
    # ==================== Sync Operations ====================
    
    @staticmethod
    def get(key: str) -> Optional[Any]:
        """Get value from cache (sync)."""
        client = _get_sync_client()
        if not client:
            return None
        try:
            value = client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            print(f"[RedisService] GET error for {key}: {e}")
        return None
    
    @staticmethod
    def set(key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (sync)."""
        client = _get_sync_client()
        if not client:
            return False
        try:
            serialized = json.dumps(value, default=str)
            client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            print(f"[RedisService] SET error for {key}: {e}")
        return False
    
    @staticmethod
    def delete(key: str) -> bool:
        """Delete key from cache (sync)."""
        client = _get_sync_client()
        if not client:
            return False
        try:
            client.delete(key)
            return True
        except Exception as e:
            print(f"[RedisService] DELETE error for {key}: {e}")
        return False
    
    @staticmethod
    def delete_pattern(pattern: str) -> int:
        """Delete all keys matching pattern (sync)."""
        client = _get_sync_client()
        if not client:
            return 0
        try:
            keys = client.keys(pattern)
            if keys:
                return client.delete(*keys)
        except Exception as e:
            print(f"[RedisService] DELETE PATTERN error for {pattern}: {e}")
        return 0
    
    # ==================== Async Operations ====================
    
    @staticmethod
    async def get_async(key: str) -> Optional[Any]:
        """Get value from cache (async)."""
        client = await _get_async_client()
        if not client:
            return None
        try:
            value = await client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            print(f"[RedisService] ASYNC GET error for {key}: {e}")
        return None
    
    @staticmethod
    async def set_async(key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (async)."""
        client = await _get_async_client()
        if not client:
            return False
        try:
            serialized = json.dumps(value, default=str)
            await client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            print(f"[RedisService] ASYNC SET error for {key}: {e}")
        return False
    
    @staticmethod
    async def delete_async(key: str) -> bool:
        """Delete key from cache (async)."""
        client = await _get_async_client()
        if not client:
            return False
        try:
            await client.delete(key)
            return True
        except Exception as e:
            print(f"[RedisService] ASYNC DELETE error for {key}: {e}")
        return False
    
    # ==================== Specialized Cache Methods ====================
    
    # --- Session Memory ---
    
    @staticmethod
    def get_session_memory(session_id: str) -> Optional[list]:
        """Get session memory from cache."""
        key = CacheKey.SESSION_MEMORY.format(session_id)
        return RedisService.get(key)
    
    @staticmethod
    def set_session_memory(session_id: str, memory_data: list) -> bool:
        """Cache session memory."""
        key = CacheKey.SESSION_MEMORY.format(session_id)
        return RedisService.set(key, memory_data, CacheTTL.SESSION_MEMORY)
    
    @staticmethod
    async def get_session_memory_async(session_id: str) -> Optional[list]:
        """Get session memory from cache (async)."""
        key = CacheKey.SESSION_MEMORY.format(session_id)
        return await RedisService.get_async(key)
    
    @staticmethod
    async def set_session_memory_async(session_id: str, memory_data: list) -> bool:
        """Cache session memory (async)."""
        key = CacheKey.SESSION_MEMORY.format(session_id)
        return await RedisService.set_async(key, memory_data, CacheTTL.SESSION_MEMORY)
    
    @staticmethod
    def invalidate_session_memory(session_id: str) -> bool:
        """Invalidate session memory cache."""
        key = CacheKey.SESSION_MEMORY.format(session_id)
        return RedisService.delete(key)
    
    # --- RAG Query Cache ---
    
    @staticmethod
    def get_rag_results(query: str) -> Optional[list]:
        """Get cached RAG results for query."""
        query_hash = CacheKey.hash_query(query)
        key = CacheKey.RAG_QUERY.format(query_hash)
        return RedisService.get(key)
    
    @staticmethod
    def set_rag_results(query: str, results: list) -> bool:
        """Cache RAG results for query."""
        query_hash = CacheKey.hash_query(query)
        key = CacheKey.RAG_QUERY.format(query_hash)
        # Serialize Document objects to dicts
        serializable = [
            {"page_content": r.page_content, "metadata": r.metadata} 
            if hasattr(r, 'page_content') else r 
            for r in results
        ]
        return RedisService.set(key, serializable, CacheTTL.RAG_QUERY)
    
    # --- User Cache ---
    
    @staticmethod
    def get_user(user_id: int) -> Optional[dict]:
        """Get cached user data."""
        key = CacheKey.USER.format(user_id)
        return RedisService.get(key)
    
    @staticmethod
    def set_user(user_id: int, user_data: dict) -> bool:
        """Cache user data."""
        key = CacheKey.USER.format(user_id)
        return RedisService.set(key, user_data, CacheTTL.USER)
    
    @staticmethod
    def invalidate_user(user_id: int) -> bool:
        """Invalidate user cache."""
        key = CacheKey.USER.format(user_id)
        return RedisService.delete(key)
    
    # --- User Sessions List ---
    
    @staticmethod
    def get_user_sessions(user_id: int) -> Optional[list]:
        """Get cached user sessions list."""
        key = CacheKey.USER_SESSIONS.format(user_id)
        return RedisService.get(key)
    
    @staticmethod
    def set_user_sessions(user_id: int, sessions: list) -> bool:
        """Cache user sessions list."""
        key = CacheKey.USER_SESSIONS.format(user_id)
        return RedisService.set(key, sessions, CacheTTL.USER_SESSIONS)
    
    @staticmethod
    def invalidate_user_sessions(user_id: int) -> bool:
        """Invalidate user sessions cache."""
        key = CacheKey.USER_SESSIONS.format(user_id)
        return RedisService.delete(key)
    
    # --- Analytics Cache ---
    
    @staticmethod
    def get_analytics(user_id: int, analytics_type: str) -> Optional[dict]:
        """Get cached analytics data."""
        key = CacheKey.ANALYTICS.format(user_id, analytics_type)
        return RedisService.get(key)
    
    @staticmethod
    def set_analytics(user_id: int, analytics_type: str, data: dict) -> bool:
        """Cache analytics data."""
        key = CacheKey.ANALYTICS.format(user_id, analytics_type)
        return RedisService.set(key, data, CacheTTL.ANALYTICS)
    
    @staticmethod
    def invalidate_analytics(user_id: int) -> int:
        """Invalidate all analytics cache for user."""
        pattern = f"lawbot:analytics:{user_id}:*"
        return RedisService.delete_pattern(pattern)


# Convenience function
def get_redis_service() -> RedisService:
    """Get RedisService instance."""
    return RedisService
