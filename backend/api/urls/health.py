"""
Health URL patterns.
"""
from django.urls import path
from api.views.health import health_check, health_status, system_health

urlpatterns = [
    path("", health_check, name="health_root"),
    path("health/", health_status, name="health_status"),
    path("system/", system_health, name="system_health"),
]

