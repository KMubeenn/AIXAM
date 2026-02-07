"""
Token Usage Views - Provides user-facing token usage statistics.

Endpoints:
- GET /api/analytics/usage/ - User's token usage summary
- GET /api/analytics/usage/daily/ - Daily breakdown (last 30 days)
- GET /api/analytics/usage/sessions/ - Per-session usage stats
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.users.jwt_utils import get_user_from_request
from apps.chat.services.services.token_service import TokenTrackingService


@csrf_exempt
@require_http_methods(["GET"])
def usage_summary(request):
    """
    Get user's token usage summary.
    
    Query params:
    - days: Number of days to look back (default: 30)
    
    Response: {
        total_tokens, total_cost_usd, total_requests,
        by_model: { model_name: { tokens, cost, requests } }
    }
    """
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    try:
        days = int(request.GET.get('days', 30))
        days = min(days, 365)  # Cap at 1 year
    except ValueError:
        days = 30
    
    summary = TokenTrackingService.get_user_summary(user, days=days)
    
    return JsonResponse({
        "total_tokens": summary['total_tokens'],
        "total_input_tokens": summary['total_input_tokens'],
        "total_output_tokens": summary['total_output_tokens'],
        "total_cost_usd": summary['total_cost_usd'],
        "total_requests": summary['total_requests'],
        "period_days": summary['period_days'],
        "by_model": summary['by_model'],
    })


@csrf_exempt
@require_http_methods(["GET"])
def usage_daily(request):
    """
    Get daily token usage breakdown.
    
    Query params:
    - days: Number of days to look back (default: 30)
    
    Response: {
        data: [{ date, tokens, cost, requests }, ...]
    }
    """
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    try:
        days = int(request.GET.get('days', 30))
        days = min(days, 90)  # Cap at 90 days for daily data
    except ValueError:
        days = 30
    
    daily_data = TokenTrackingService.get_daily_breakdown(user, days=days)
    
    return JsonResponse({
        "data": daily_data,
        "period_days": days,
    })


@csrf_exempt
@require_http_methods(["GET"])
def usage_sessions(request):
    """
    Get per-session token usage.
    
    Query params:
    - limit: Max sessions to return (default: 20)
    
    Response: {
        data: [{ session_id, title, tokens, cost, requests }, ...]
    }
    """
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    try:
        limit = int(request.GET.get('limit', 20))
        limit = min(limit, 50)  # Cap at 50 sessions
    except ValueError:
        limit = 20
    
    session_data = TokenTrackingService.get_session_breakdown(user, limit=limit)
    
    return JsonResponse({
        "data": session_data,
    })
