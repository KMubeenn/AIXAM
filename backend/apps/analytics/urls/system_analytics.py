"""
System Analytics URL patterns.
"""
from django.urls import path
from apps.analytics.views import system_analytics

urlpatterns = [
    path('metrics/requests', system_analytics.admin_request_metrics, name='admin_request_metrics'),
    path('metrics/errors', system_analytics.admin_error_logs, name='admin_error_logs'),
    path('usage', system_analytics.admin_token_usage, name='admin_token_usage'),
]
