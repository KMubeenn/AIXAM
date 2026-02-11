"""
Analytics URL patterns.
"""
from django.urls import path, include
from apps.analytics.urls.token_usage import urlpatterns as token_usage_patterns
from apps.analytics.urls.system_analytics import urlpatterns as system_analytics_patterns
from apps.analytics.urls.health import urlpatterns as health_patterns

urlpatterns = [
    # Usage endpoints
    path("", include(token_usage_patterns)),
    
    # Admin endpoints
    # Admin endpoints
    path("admin/", include(system_analytics_patterns)),
    
    # Health endpoints
    path("health/", include(health_patterns)),
]
