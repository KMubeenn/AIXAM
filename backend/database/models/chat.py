"""
Chat Session Models - Database-backed chat persistence.

Models:
- ChatSession: Represents a chat conversation for a user
- Message: Individual messages within a session
- SessionMemory: Serialized LangChain memory state for recovery
"""
from django.db import models
from django.conf import settings
import uuid


class ChatSession(models.Model):
    """
    Represents a chat conversation session for a user.
    Each user can have up to MAX_SESSIONS_PER_USER active sessions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    title = models.CharField(max_length=255, default='New Chat')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    message_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title[:30]}"
    
    @classmethod
    def get_user_session_count(cls, user):
        """Get the number of sessions for a user."""
        return cls.objects.filter(user=user, is_active=True).count()
    
    @classmethod
    def can_create_session(cls, user, max_sessions=10):
        """Check if user can create a new session."""
        return cls.get_user_session_count(user) < max_sessions
    
    def can_add_message(self, max_messages=40):
        """Check if session can accept more messages (20 pairs = 40 messages)."""
        return self.message_count < max_messages


class Message(models.Model):
    """
    Individual message within a chat session.
    Stores both user and assistant messages with sequence ordering.
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    sequence_number = models.PositiveIntegerField()
    
    class Meta:
        db_table = 'messages'
        ordering = ['sequence_number']
        indexes = [
            models.Index(fields=['session', 'sequence_number']),
        ]
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
    
    def save(self, *args, **kwargs):
        """Auto-assign sequence number if not set."""
        if not self.sequence_number:
            last_msg = Message.objects.filter(session=self.session).order_by('-sequence_number').first()
            self.sequence_number = (last_msg.sequence_number + 1) if last_msg else 1
        super().save(*args, **kwargs)
        # Update session message count
        self.session.message_count = Message.objects.filter(session=self.session).count()
        self.session.save(update_fields=['message_count', 'updated_at'])


class SessionMemory(models.Model):
    """
    Stores the LangChain memory state for session recovery.
    Contains serialized BufferWindowMessageHistory messages.
    
    Format of memory_state:
    [
        {"type": "HumanMessage", "content": "user message"},
        {"type": "AIMessage", "content": "assistant response"}
    ]
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='memory'
    )
    memory_state = models.JSONField(default=list)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'session_memories'
    
    def __str__(self):
        return f"Memory for session {self.session.id}"
