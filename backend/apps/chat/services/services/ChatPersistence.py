
from apps.chat.models import ChatSession,Message,SessionMemory

from langchain.messages import HumanMessage,AIMessage

from asgiref.sync import sync_to_async
 
from django.db import transaction


class PersistenceServiceError(Exception):
    def __init__(self,message,source):
        super().__init__(message)
        self.source=source


class ChatPersistenceService:
    MAX_MESSAGES_PER_SESSION=40


    @staticmethod
    @sync_to_async
    def _create_session_sync(user_id,title):
        with transaction.atomic():
            chat_session=ChatSession.objects.create(user_id=user_id,title=title)
            SessionMemory.objects.create(session=chat_session)
            return chat_session.id


    @staticmethod
    async def create_session(user_id,title:str = "New Chat"):
        try:
            return await ChatPersistenceService._create_session_sync(user_id,title)
        except Exception as e:
            raise PersistenceServiceError("create_session_failed",source='create_session') from e 
       

    @staticmethod
    async def delete_session(session_id):
        session=await sync_to_async(ChatSession.objects.get)(id=session_id)
        await sync_to_async(session.delete)()

        return "session deleted successfully"

    @staticmethod
    def serialization_user_sessions(sessions:list[ChatSession]):
        serialized_sessions=[]
        for sn in sessions:
            serialized_sessions.append({"id":sn.id,"title":sn.title})
        return serialized_sessions

    @staticmethod
    async def get_user_sessions(user):
        chat_sessions=await sync_to_async(list)(ChatSession.objects.filter(user=user))
        serialized_sessions=ChatPersistenceService.serialization_user_sessions(chat_sessions)
        return serialized_sessions

    @staticmethod
    def serialize_session_messages(messages:list[Message]):
        serialized_messages=[]
        for msg in messages:
            serialized_messages.append({
                'id': str(msg.id),
                'role': msg.role,
                'content': msg.content,
                'sequence_number': msg.sequence_number,
                'metadata': msg.metadata,
            })
        return serialized_messages


    @staticmethod
    async def get_session_messages(session_id):
        session=await sync_to_async(ChatSession.objects.get)(id=session_id)
        messages=await sync_to_async(list)(session.messages.all())
        serialized_messages=ChatPersistenceService.serialize_session_messages(messages=messages)
        return serialized_messages

    @staticmethod
    async def update_messages(session_id, role, content, metadata=None):
        await sync_to_async(Message.objects.create)(
            session_id=session_id,
            role=role,
            content=content,
            metadata=metadata
        )

    @classmethod
    async def update_session_memory(cls,session_id,human_message,ai_message):
        memory_state=[
            {"type":'HumanMessage','content':human_message},
            {'type':'AIMessage','content':ai_message}
        ]
        session=await sync_to_async(ChatSession.objects.get)(id=session_id)
        session_memory,created=await sync_to_async(SessionMemory.objects.get_or_create)(session=session)
        if len(session_memory.memory_state)>cls.MAX_MESSAGES_PER_SESSION:
            messages=session_memory.memory_state
            messages.extend(memory_state)
            session_memory.memory_state=messages[2:]
        else:
            session_memory.memory_state.extend(memory_state)

        await sync_to_async(session_memory.save)(update_fields=['memory_state','last_updated'])
    

    @staticmethod
    async def get_session_memory(session_id):
        session=await sync_to_async(ChatSession.objects.select_related('memory').get)(id=session_id)
        if  getattr(session,'memory',None) is None:
            return []
        memory=session.memory
        messages=list(memory.memory_state or [])
        messages_buffer=[]
        for msg in messages:
            if msg['type']=='HumanMessage':
                messages_buffer.append(HumanMessage(content=msg['content']))
            else:
                messages_buffer.append(AIMessage(content=msg['content']))
        return messages_buffer


    @staticmethod 
    async def get_title(session_id):
        session=await sync_to_async(ChatSession.objects.get)(id=session_id)
        return session.title

    @staticmethod
    async def set_title(session_id,message):
        words=message.split()
        title=' '.join(words[:5])
        session=await sync_to_async(ChatSession.objects.get)(id=session_id)
        session.title=title
        await sync_to_async(session.save)(update_fields=['title','updated_at'])



    
    
    







    






































# """
# Chat Persistence Service - Handles memory serialization and database operations.

# Provides:
# - Memory serialization to JSON for database storage
# - Memory deserialization from JSON to LangChain objects
# - Session save/load operations
# - Message persistence
# """
# from typing import Optional
# from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
# from asgiref.sync import sync_to_async

# from apps.chat.services.services.History import BufferWindowMessageHistory
# from apps.chat.models import ChatSession, Message, SessionMemory


# class ChatPersistenceService:
#     """
#     Service for persisting chat sessions and memory to database.
#     Handles serialization/deserialization of LangChain memory objects.
#     """
    
#     # Configuration
#     MAX_SESSIONS_PER_USER = 10
#     MAX_MESSAGES_PER_SESSION = 40  # 20 pairs
#     MEMORY_WINDOW_SIZE = 8  # Last 4 pairs for LLM context
    
#     @staticmethod
#     def serialize_memory(history: BufferWindowMessageHistory) -> list[dict]:
#         """
#         Serialize LangChain message history to JSON-compatible format.
        
#         Args:
#             history: BufferWindowMessageHistory instance
            
#         Returns:
#             List of dicts with type and content
#         """
#         serialized = []
#         for msg in history.messages:
#             serialized.append({
#                 "type": msg.__class__.__name__,
#                 "content": msg.content,
#             })
#         return serialized
    
#     @staticmethod
#     def deserialize_memory(data: list[dict], k: int = 8) -> BufferWindowMessageHistory:
#         """
#         Deserialize JSON data back to LangChain BufferWindowMessageHistory.
        
#         Args:
#             data: List of message dicts from database
#             k: Window size for memory
            
#         Returns:
#             Restored BufferWindowMessageHistory instance
#         """
#         history = BufferWindowMessageHistory(k=k)
#         messages = []
        
#         for item in data:
#             msg_type = item.get("type", "")
#             content = item.get("content", "")
            
#             if msg_type == "HumanMessage":
#                 messages.append(HumanMessage(content=content))
#             elif msg_type == "AIMessage":
#                 messages.append(AIMessage(content=content))
        
#         # Keep only last k messages
#         history.messages = messages[-k:]
#         return history
    
#     @classmethod
#     def _save_session_memory_sync(cls, session_id: str, memory: BufferWindowMessageHistory) -> bool:
#         """Synchronous version for use in sync contexts."""
#         try:
#             session = ChatSession.objects.get(id=session_id)
#             memory_state = cls.serialize_memory(memory)
            
#             SessionMemory.objects.update_or_create(
#                 session=session,
#                 defaults={'memory_state': memory_state}
#             )
#             return True
#         except ChatSession.DoesNotExist:
#             print(f"[ChatPersistence] Session not found: {session_id}")
#             return False
#         except Exception as e:
#             print(f"[ChatPersistence] Error saving memory: {e}")
#             return False
    
#     @classmethod
#     def save_session_memory(cls, session_id: str, memory: BufferWindowMessageHistory) -> bool:
#         """
#         Save memory state to database for a session.
#         Works in both sync and async contexts.
#         """
#         return cls._save_session_memory_sync(session_id, memory)
    
#     @classmethod
#     async def save_session_memory_async(cls, session_id: str, memory: BufferWindowMessageHistory) -> bool:
#         """Async version for use in async contexts (ASGI)."""
#         return await sync_to_async(cls._save_session_memory_sync, thread_sensitive=True)(session_id, memory)
    
#     @classmethod
#     def _load_session_memory_sync(cls, session_id: str) -> Optional[BufferWindowMessageHistory]:
#         """Synchronous version for use in sync contexts."""
#         try:
#             session = ChatSession.objects.get(id=session_id)
#             memory = SessionMemory.objects.filter(session=session).first()
            
#             if memory and memory.memory_state:
#                 return cls.deserialize_memory(memory.memory_state, k=cls.MEMORY_WINDOW_SIZE)
#             return None
#         except ChatSession.DoesNotExist:
#             return None
#         except Exception as e:
#             print(f"[ChatPersistence] Error loading memory: {e}")
#             return None
    
#     @classmethod
#     def load_session_memory(cls, session_id: str) -> Optional[BufferWindowMessageHistory]:
#         """
#         Load memory state from database for a session.
#         Works in both sync and async contexts.
#         """
#         return cls._load_session_memory_sync(session_id)
    
#     @classmethod
#     async def load_session_memory_async(cls, session_id: str) -> Optional[BufferWindowMessageHistory]:
#         """Async version for use in async contexts (ASGI)."""
#         return await sync_to_async(cls._load_session_memory_sync, thread_sensitive=True)(session_id)
    
#     @classmethod
#     def save_message(cls, session_id: str, role: str, content: str) -> Optional[Message]:
#         """
#         Save a single message to the database.
        
#         Args:
#             session_id: UUID of the chat session
#             role: 'user' or 'assistant'
#             content: Message content
            
#         Returns:
#             Created Message object or None on failure
#         """
#         try:
#             session = ChatSession.objects.get(id=session_id)
            
#             # Check message limit
#             if not session.can_add_message(cls.MAX_MESSAGES_PER_SESSION):
#                 print(f"[ChatPersistence] Session {session_id} has reached max messages")
#                 return None
            
#             message = Message.objects.create(
#                 session=session,
#                 role=role,
#                 content=content
#             )
#             return message
#         except ChatSession.DoesNotExist:
#             print(f"[ChatPersistence] Session not found: {session_id}")
#             return None
#         except Exception as e:
#             print(f"[ChatPersistence] Error saving message: {e}")
#             return None
    
#     @classmethod
#     async def save_message_async(cls, session_id: str, role: str, content: str) -> Optional[Message]:
#         """Async version of save_message for ASGI contexts."""
#         return await sync_to_async(cls.save_message, thread_sensitive=True)(session_id, role, content)
    
#     @classmethod
#     def get_session_messages(cls, session_id: str) -> list[dict]:
#         """
#         Get all messages for a session.
        
#         Args:
#             session_id: UUID of the chat session
            
#         Returns:
#             List of message dicts with id, role, content, timestamp
#         """
#         try:
#             messages = Message.objects.filter(session_id=session_id).order_by('sequence_number')
#             return [
#                 {
#                     'id': str(msg.id),
#                     'role': msg.role,
#                     'content': msg.content,
#                     'timestamp': msg.timestamp.isoformat(),
#                 }
#                 for msg in messages
#             ]
#         except Exception as e:
#             print(f"[ChatPersistence] Error getting messages: {e}")
#             return []
    
#     @classmethod
#     def create_session(cls, user, title: str = "New Chat") -> Optional[ChatSession]:
#         """
#         Create a new chat session for a user.
        
#         Args:
#             user: User model instance
#             title: Initial session title
            
#         Returns:
#             Created ChatSession or None if limit reached
#         """
#         if not ChatSession.can_create_session(user, cls.MAX_SESSIONS_PER_USER):
#             print(f"[ChatPersistence] User {user.username} has reached max sessions")
#             return None
        
        
#         try:
#             session = ChatSession.objects.create(user=user, title=title)
#             # Create empty memory record
#             SessionMemory.objects.create(session=session)
#             return session
#         except Exception as e:
#             print(f"[ChatPersistence] Error creating session: {e}")
#             return None
    
#     @classmethod
#     def get_user_sessions(cls, user) -> list[dict]:
#         """
#         Get all sessions for a user.
        
#         Args:
#             user: User model instance
            
#         Returns:
#             List of session dicts
#         """
#         sessions = ChatSession.objects.filter(user=user, is_active=True).order_by('-updated_at')
#         return [
#             {
#                 'id': str(session.id),
#                 'title': session.title,
#                 'created_at': session.created_at.isoformat(),
#                 'updated_at': session.updated_at.isoformat(),
#                 'message_count': session.message_count,
#             }
#             for session in sessions
#         ]
    
#     @classmethod
#     def delete_session(cls, session_id: str, user) -> bool:
#         """
#         Delete a session (soft delete by marking inactive).
        
#         Args:
#             session_id: UUID of the session
#             user: User model instance (for ownership verification)
            
#         Returns:
#             True if deleted, False otherwise
#         """
#         try:
#             session = ChatSession.objects.get(id=session_id, user=user)
#             session.is_active = False
#             session.save(update_fields=['is_active'])
#             return True
#         except ChatSession.DoesNotExist:
#             return False
#         except Exception as e:
#             print(f"[ChatPersistence] Error deleting session: {e}")
#             return False
    
#     @classmethod
#     def update_session_title(cls, session_id: str, title: str) -> bool:
#         """
#         Update session title (usually from first user message).
        
#         Args:
#             session_id: UUID of the session
#             title: New title (truncated to 50 chars)
            
#         Returns:
#             True if updated, False otherwise
#         """
#         try:
#             session = ChatSession.objects.get(id=session_id)
#             session.title = title[:50] if len(title) > 50 else title
#             session.save(update_fields=['title'])
#             return True
#         except ChatSession.DoesNotExist:
#             return False
#         except Exception as e:
#             print(f"[ChatPersistence] Error updating title: {e}")
#             return False
    
#     @classmethod
#     async def update_session_title_async(cls, session_id: str, title: str) -> bool:
#         """Async version of update_session_title for ASGI contexts."""
#         return await sync_to_async(cls.update_session_title, thread_sensitive=True)(session_id, title)
    
#     @classmethod
#     def session_exists(cls, session_id: str) -> bool:
#         """Check if a session exists."""
#         return ChatSession.objects.filter(id=session_id, is_active=True).exists()
    
#     @classmethod
#     def session_belongs_to_user(cls, session_id: str, user) -> bool:
#         """Check if a session belongs to a specific user."""
#         return ChatSession.objects.filter(id=session_id, user=user, is_active=True).exists()
