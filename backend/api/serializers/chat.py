"""
Chat Serializers - Django REST Framework serializers for chat models.
"""
from rest_framework import serializers
from database.models import ChatSession, Message, SessionMemory


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model."""
    
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'timestamp', 'sequence_number']
        read_only_fields = ['id', 'timestamp', 'sequence_number']


class SessionMemorySerializer(serializers.ModelSerializer):
    """Serializer for SessionMemory model."""
    
    class Meta:
        model = SessionMemory
        fields = ['memory_state', 'last_updated']
        read_only_fields = ['last_updated']


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Serializer for listing chat sessions (summary view)."""
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at', 'message_count']


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """Serializer for chat session with messages (detail view)."""
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'is_active', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at', 'message_count']


class CreateSessionSerializer(serializers.Serializer):
    """Serializer for creating a new chat session."""
    title = serializers.CharField(max_length=255, required=False, default="New Chat")


class ChatMessageSerializer(serializers.Serializer):
    """Serializer for incoming chat messages."""
    session_id = serializers.UUIDField(required=True)
    message = serializers.CharField(required=True)


class SessionResponseSerializer(serializers.Serializer):
    """Serializer for session list response."""
    sessions = ChatSessionListSerializer(many=True)
    total_count = serializers.IntegerField()
    max_sessions = serializers.IntegerField()
