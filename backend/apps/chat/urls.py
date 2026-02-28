"""
Chat URL patterns.
"""
from django.urls import path
from apps.chat.views.chat import agent_endpoint
# from apps.chat.views.voice import voice_endpoint
from apps.chat.views.sessions import get_sessions,get_session_messages,delete_session

urlpatterns = [
    # Chat endpoints
    path("", agent_endpoint, name="agent"),
    
    # Voice endpoints
    # path("voice/", voice_endpoint, name="voice"),
    
    # Session endpoints
    path("sessions/", get_sessions, name="get_sessions"),
    path("sessions/messages/", get_session_messages, name="get_session_messages"),
    path("sessions/delete/",delete_session,name="delete_session")
]
