"""
Session Memory Manager - Manages chat session memory with Redis + DB persistence.

Cache Hierarchy:
1. In-memory (fastest, per-process)
2. Redis (shared across workers, survives restarts)
3. Database (persistent, source of truth)
"""
import asyncio
from core.services.History import BufferWindowMessageHistory


def _is_async_context():
    """Check if we're running in an async context."""
    try:
        asyncio.get_running_loop()
        return True
    except RuntimeError:
        return False


def _get_redis_service():
    """Lazy import to avoid circular imports."""
    try:
        from core.services.redis_service import RedisService
        return RedisService
    except ImportError:
        return None


def _serialize_memory(history: BufferWindowMessageHistory) -> list:
    """Serialize memory to JSON-compatible format for Redis."""
    messages = []
    for msg in history.messages:
        msg_type = msg.__class__.__name__
        messages.append({
            "type": msg_type,
            "content": msg.content
        })
    return messages


def _deserialize_memory(data: list, k: int = 8) -> BufferWindowMessageHistory:
    """Deserialize memory from Redis cache."""
    from langchain_core.messages import HumanMessage, AIMessage
    
    history = BufferWindowMessageHistory(k=k)
    for msg_data in data:
        msg_type = msg_data.get("type", "")
        content = msg_data.get("content", "")
        
        if msg_type == "HumanMessage":
            history.add_message(HumanMessage(content=content))
        elif msg_type == "AIMessage":
            history.add_message(AIMessage(content=content))
    
    return history


class SessionMemoryManager:
    """
    Manages session memory with multi-tier caching:
    1. In-memory dict (L1 - per process)
    2. Redis cache (L2 - shared, survives restarts)
    3. Database (L3 - persistent source of truth)
    
    On cache miss, checks Redis → DB → Creates new
    On save, writes to: In-memory + Redis + DB (write-through)
    """
    session_memory_map = {}  # L1 Cache
    _persistence_enabled = True
    _redis_enabled = True
    
    @staticmethod
    def _get_persistence_service():
        """Lazy import to avoid circular imports."""
        try:
            from core.services.ChatPersistence import ChatPersistenceService
            return ChatPersistenceService
        except ImportError:
            return None

    @staticmethod
    def get_session(session_id: str, k: int = 8):
        """
        Get or create session memory with Redis caching.
        Hierarchy: In-memory → Redis → Database → New
        """
        # L1: Check in-memory cache first
        if session_id in SessionMemoryManager.session_memory_map:
            return SessionMemoryManager.session_memory_map[session_id]
        
        # L2: Check Redis cache
        if SessionMemoryManager._redis_enabled:
            redis = _get_redis_service()
            if redis and redis.is_available():
                try:
                    cached = redis.get_session_memory(session_id)
                    if cached:
                        print(f"[SessionManager] Cache HIT (Redis) for session {session_id}")
                        memory = _deserialize_memory(cached, k)
                        SessionMemoryManager.session_memory_map[session_id] = memory
                        return memory
                except Exception as e:
                    print(f"[SessionManager] Redis error: {e}")
        
        # L3: Try database
        if SessionMemoryManager._persistence_enabled:
            persistence = SessionMemoryManager._get_persistence_service()
            if persistence:
                try:
                    if _is_async_context():
                        import concurrent.futures
                        with concurrent.futures.ThreadPoolExecutor() as executor:
                            future = executor.submit(persistence._load_session_memory_sync, session_id)
                            loaded_memory = future.result(timeout=10)
                    else:
                        loaded_memory = persistence.load_session_memory(session_id)
                    
                    if loaded_memory:
                        print(f"[SessionManager] Loaded from DB for session {session_id}")
                        SessionMemoryManager.session_memory_map[session_id] = loaded_memory
                        
                        # Warm up Redis cache
                        if SessionMemoryManager._redis_enabled:
                            redis = _get_redis_service()
                            if redis and redis.is_available():
                                redis.set_session_memory(session_id, _serialize_memory(loaded_memory))
                        
                        return loaded_memory
                except Exception as e:
                    print(f"[SessionManager] DB load error: {e}")
        
        # Create new memory
        print(f"[SessionManager] Creating new memory for session {session_id}")
        SessionMemoryManager.session_memory_map[session_id] = BufferWindowMessageHistory(k=k)
        return SessionMemoryManager.session_memory_map[session_id]

    @staticmethod
    async def get_session_async(session_id: str, k: int = 8):
        """
        Get or create session memory (async version).
        Hierarchy: In-memory → Redis → Database → New
        """
        # L1: Check in-memory cache first
        if session_id in SessionMemoryManager.session_memory_map:
            return SessionMemoryManager.session_memory_map[session_id]
        
        # L2: Check Redis cache
        if SessionMemoryManager._redis_enabled:
            redis = _get_redis_service()
            if redis and redis.is_available():
                try:
                    cached = await redis.get_session_memory_async(session_id)
                    if cached:
                        print(f"[SessionManager] Cache HIT (Redis) for session {session_id}")
                        memory = _deserialize_memory(cached, k)
                        SessionMemoryManager.session_memory_map[session_id] = memory
                        return memory
                except Exception as e:
                    print(f"[SessionManager] Redis async error: {e}")
        
        # L3: Try database
        if SessionMemoryManager._persistence_enabled:
            persistence = SessionMemoryManager._get_persistence_service()
            if persistence:
                try:
                    loaded_memory = await persistence.load_session_memory_async(session_id)
                    if loaded_memory:
                        print(f"[SessionManager] Loaded from DB for session {session_id}")
                        SessionMemoryManager.session_memory_map[session_id] = loaded_memory
                        
                        # Warm up Redis cache
                        if SessionMemoryManager._redis_enabled:
                            redis = _get_redis_service()
                            if redis and redis.is_available():
                                await redis.set_session_memory_async(session_id, _serialize_memory(loaded_memory))
                        
                        return loaded_memory
                except Exception as e:
                    print(f"[SessionManager] DB async load error: {e}")
        
        # Create new memory
        print(f"[SessionManager] Creating new memory for session {session_id}")
        SessionMemoryManager.session_memory_map[session_id] = BufferWindowMessageHistory(k=k)
        return SessionMemoryManager.session_memory_map[session_id]

    @staticmethod
    def save_session(session_id: str):
        """
        Persist session memory (write-through to Redis + DB).
        """
        if session_id not in SessionMemoryManager.session_memory_map:
            return
            
        memory = SessionMemoryManager.session_memory_map[session_id]
        
        # Write to Redis
        if SessionMemoryManager._redis_enabled:
            redis = _get_redis_service()
            if redis and redis.is_available():
                try:
                    redis.set_session_memory(session_id, _serialize_memory(memory))
                    print(f"[SessionManager] Saved to Redis for session {session_id}")
                except Exception as e:
                    print(f"[SessionManager] Redis save error: {e}")
        
        # Write to Database
        if SessionMemoryManager._persistence_enabled:
            persistence = SessionMemoryManager._get_persistence_service()
            if persistence:
                success = persistence.save_session_memory(session_id, memory)
                if success:
                    print(f"[SessionManager] Saved to DB for session {session_id}")

    @staticmethod
    async def save_session_async(session_id: str):
        """
        Persist session memory async (write-through to Redis + DB).
        """
        if session_id not in SessionMemoryManager.session_memory_map:
            return
            
        memory = SessionMemoryManager.session_memory_map[session_id]
        
        # Write to Redis
        if SessionMemoryManager._redis_enabled:
            redis = _get_redis_service()
            if redis and redis.is_available():
                try:
                    await redis.set_session_memory_async(session_id, _serialize_memory(memory))
                    print(f"[SessionManager] Saved to Redis for session {session_id}")
                except Exception as e:
                    print(f"[SessionManager] Redis async save error: {e}")
        
        # Write to Database
        if SessionMemoryManager._persistence_enabled:
            persistence = SessionMemoryManager._get_persistence_service()
            if persistence:
                success = await persistence.save_session_memory_async(session_id, memory)
                if success:
                    print(f"[SessionManager] Saved to DB for session {session_id}")

    @staticmethod
    def clear_session(session_id: str):
        """Clear session from all caches (does not delete from DB)."""
        # Clear from in-memory
        if session_id in SessionMemoryManager.session_memory_map:
            del SessionMemoryManager.session_memory_map[session_id]
        
        # Clear from Redis
        if SessionMemoryManager._redis_enabled:
            redis = _get_redis_service()
            if redis and redis.is_available():
                redis.invalidate_session_memory(session_id)

    @staticmethod
    def clear_all():
        """Clear all sessions from in-memory cache."""
        SessionMemoryManager.session_memory_map.clear()
    
    @staticmethod
    def set_persistence_enabled(enabled: bool):
        """Enable or disable database persistence (useful for testing)."""
        SessionMemoryManager._persistence_enabled = enabled
    
    @staticmethod
    def set_redis_enabled(enabled: bool):
        """Enable or disable Redis caching (useful for testing)."""
        SessionMemoryManager._redis_enabled = enabled
