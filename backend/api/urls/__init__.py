"""
API URL configuration - combines all route modules.
"""
from django.urls import path, include

urlpatterns = [
    path("", include("api.urls.health")),
    path("auth/", include("api.urls.auth")),
    path("chat/", include("api.urls.chat")),
    path("voice/", include("api.urls.voice")),
    path("analytics/", include("api.urls.analytics")),
]

