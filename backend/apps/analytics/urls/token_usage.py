"""
Token Usage URL patterns.
"""
from django.urls import path
from apps.analytics.views import token_usage

urlpatterns = [
    path('', token_usage.usage_summary, name='usage_summary'),
    path('daily/', token_usage.usage_daily, name='usage_daily'),
    path('sessions/', token_usage.usage_sessions, name='usage_sessions'),
]
