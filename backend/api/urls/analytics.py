"""
Analytics URL patterns.

Endpoints:
- GET /api/analytics/usage/ - User's token usage summary
- GET /api/analytics/usage/daily/ - Daily breakdown
- GET /api/analytics/usage/sessions/ - Per-session usage
- GET /api/analytics/admin/metrics/requests - Admin: All request metrics
- GET /api/analytics/admin/metrics/errors - Admin: All error logs
- GET /api/analytics/admin/usage - Admin: Application token usage
"""
from django.urls import path

from api.views import analytics


urlpatterns = [
    # User analytics
    path('usage/', analytics.usage_summary, name='usage_summary'),
    path('usage/daily/', analytics.usage_daily, name='usage_daily'),
    path('usage/sessions/', analytics.usage_sessions, name='usage_sessions'),
    
    # Admin analytics
    path('admin/metrics/requests', analytics.admin_request_metrics, name='admin_request_metrics'),
    path('admin/metrics/errors', analytics.admin_error_logs, name='admin_error_logs'),
    path('admin/usage', analytics.admin_token_usage, name='admin_token_usage'),
]

