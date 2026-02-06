"""
Voice URL patterns.
"""
from django.urls import path
from api.views.voice import voice_endpoint

urlpatterns = [
    path("", voice_endpoint, name="voice"),
]
