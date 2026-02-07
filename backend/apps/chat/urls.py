"""
Chat URL patterns.
"""
from django.urls import path
from apps.chat.views.chat import chat_endpoint
from apps.chat.views.voice import voice_endpoint
from apps.chat.views.sessions import sessions_list, session_detail

urlpatterns = [
    # Chat endpoints
    path("", chat_endpoint, name="chat"),
    
    # Voice endpoints
    path("voice/", voice_endpoint, name="voice"),
    
    # Session endpoints
    path("sessions/", sessions_list, name="sessions_list"),
    path("sessions/<uuid:session_id>/", session_detail, name="session_detail"),
]
