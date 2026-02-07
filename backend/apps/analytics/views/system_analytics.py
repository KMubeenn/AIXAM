"""
System Analytics Views - Provides admin-level metrics and system health data.

Endpoints:
- GET /api/analytics/admin/metrics/requests - Admin: All request metrics
- GET /api/analytics/admin/metrics/errors - Admin: All error logs
- GET /api/analytics/admin/usage - Admin: Application-wide token usage
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
import os
import base64

from apps.analytics.models import RequestMetrics, TokenUsage


def _check_admin_auth(request):
    """Check if request has admin credentials from environment variables."""
    # Get credentials from environment
    admin_username = os.getenv("ADMIN_USERNAME", "Hazard")
    admin_password = os.getenv("ADMIN_PASSWORD", "Hazard")
    
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Basic "):
        try:
            decoded = base64.b64decode(auth_header[6:]).decode('utf-8')
            username, password = decoded.split(':', 1)
            if username == admin_username and password == admin_password:
                return True
        except:
            pass
    return False


@csrf_exempt
@require_http_methods(["GET"])
def admin_request_metrics(request):
    """
    Get all request metrics (admin only).
    
    Query params:
    - limit: Number of requests (default: 100, max: 500)
    - endpoint: Filter by endpoint path (optional)
    - status: Filter by status code (optional)
    - hours: Hours to look back (default: 24)
    
    Response: {
        data: [{ id, timestamp, endpoint, method, response_time_ms, 
                 status_code, is_error, error_message, user_email }]
    }
    """
    if not _check_admin_auth(request):
        return JsonResponse({"error": "Admin authentication required"}, status=401)
    
    try:
        limit = min(int(request.GET.get('limit', 100)), 500)
        hours = int(request.GET.get('hours', 24))
        endpoint_filter = request.GET.get('endpoint', '')
        status_filter = request.GET.get('status', '')
    except ValueError:
        limit, hours = 100, 24
        endpoint_filter, status_filter = '', ''
    
    since = timezone.now() - timedelta(hours=hours)
    queryset = RequestMetrics.objects.filter(timestamp__gte=since)
    
    if endpoint_filter:
        queryset = queryset.filter(endpoint__icontains=endpoint_filter)
    if status_filter:
        queryset = queryset.filter(status_code=int(status_filter))
    
    metrics = queryset.select_related('user').order_by('-timestamp')[:limit]
    
    data = [
        {
            "id": str(m.id),
            "timestamp": m.timestamp.isoformat(),
            "endpoint": m.endpoint,
            "method": m.method,
            "response_time_ms": m.response_time_ms,
            "status_code": m.status_code,
            "is_error": m.is_error,
            "error_message": m.error_message or "",
            "user_email": m.user.email if m.user else "anonymous",
        }
        for m in metrics
    ]
    
    return JsonResponse({"data": data, "count": len(data)})


@csrf_exempt
@require_http_methods(["GET"])
def admin_error_logs(request):
    """
    Get all error logs (admin only).
    
    Query params:
    - limit: Number of errors (default: 50, max: 200)
    - hours: Hours to look back (default: 24)
    
    Response: {
        data: [{ id, timestamp, endpoint, method, status_code, 
                 error_message, user_email }]
    }
    """
    if not _check_admin_auth(request):
        return JsonResponse({"error": "Admin authentication required"}, status=401)
    
    try:
        limit = min(int(request.GET.get('limit', 50)), 200)
        hours = int(request.GET.get('hours', 24))
    except ValueError:
        limit, hours = 50, 24
    
    since = timezone.now() - timedelta(hours=hours)
    errors = RequestMetrics.objects.filter(
        timestamp__gte=since,
        is_error=True
    ).select_related('user').order_by('-timestamp')[:limit]
    
    data = [
        {
            "id": str(e.id),
            "timestamp": e.timestamp.isoformat(),
            "endpoint": e.endpoint,
            "method": e.method,
            "status_code": e.status_code,
            "error_message": e.error_message or "",
            "user_email": e.user.email if e.user else "anonymous",
        }
        for e in errors
    ]
    
    return JsonResponse({"data": data, "count": len(data)})


@csrf_exempt
@require_http_methods(["GET"])
def admin_token_usage(request):
    """
    Get application-wide token usage (admin only).
    
    Query params:
    - days: Number of days to look back (default: 7)
    
    Response: {
        total_tokens, total_cost_usd, total_requests, total_users,
        by_model: { model_name: { tokens, cost, requests } },
        daily: [{ date, tokens, cost, requests }]
    }
    """
    if not _check_admin_auth(request):
        return JsonResponse({"error": "Admin authentication required"}, status=401)
    
    try:
        days = min(int(request.GET.get('days', 7)), 90)
    except ValueError:
        days = 7
    
    since = timezone.now() - timedelta(days=days)
    
    # Aggregate totals
    totals = TokenUsage.objects.filter(
        timestamp__gte=since
    ).aggregate(
        total_tokens=Sum('total_tokens'),
        total_cost=Sum('cost_usd'),
        total_requests=Count('id'),
        unique_users=Count('user', distinct=True)
    )
    
    # By model breakdown
    by_model = {}
    model_stats = TokenUsage.objects.filter(
        timestamp__gte=since
    ).values('model_name', 'provider').annotate(
        tokens=Sum('total_tokens'),
        cost=Sum('cost_usd'),
        requests=Count('id'),
    )
    
    for stat in model_stats:
        key = f"{stat['provider']}/{stat['model_name']}"
        by_model[key] = {
            "tokens": stat['tokens'] or 0,
            "cost": float(stat['cost'] or 0),
            "requests": stat['requests'],
        }
    
    # Daily breakdown
    from django.db.models.functions import TruncDate
    daily_data = TokenUsage.objects.filter(
        timestamp__gte=since
    ).annotate(
        date=TruncDate('timestamp')
    ).values('date').annotate(
        tokens=Sum('total_tokens'),
        cost=Sum('cost_usd'),
        requests=Count('id'),
    ).order_by('-date')
    
    daily = [
        {
            "date": item['date'].isoformat() if item['date'] else None,
            "tokens": item['tokens'] or 0,
            "cost": float(item['cost'] or 0),
            "requests": item['requests'],
        }
        for item in daily_data
    ]
    
    return JsonResponse({
        "total_tokens": totals['total_tokens'] or 0,
        "total_cost_usd": float(totals['total_cost'] or 0),
        "total_requests": totals['total_requests'] or 0,
        "total_users": totals['unique_users'] or 0,
        "period_days": days,
        "by_model": by_model,
        "daily": daily,
    })
