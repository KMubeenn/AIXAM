"""
Analytics URL patterns.
"""
from django.urls import path, include
from apps.analytics.urls.token_usage import urlpatterns as token_usage_patterns
from apps.analytics.urls.system_analytics import urlpatterns as system_analytics_patterns

urlpatterns = [
    # Usage endpoints
    path("", include(token_usage_patterns)),
    
    # Admin endpoints
    path("admin/", include(system_analytics_patterns)),
]
