"""
Health check views.
"""
import time
from django.http import JsonResponse
from django.db import connection
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Avg

from database.models import RequestMetrics


def health_check(request):
    """Root health check endpoint."""
    return JsonResponse({"status": "ok"})


def health_status(request):
    """Health status endpoint."""
    return JsonResponse({"status": "good"})


def system_health(request):
    """
    Comprehensive system health check (admin view).
    
    Checks:
    - Database connectivity and latency
    - Redis connectivity and latency
    - Pinecone connectivity
    - Error rates (last 1 hour)
    - Average response time (last 1 hour)
    
    Response: {
        status: "healthy" | "degraded" | "down",
        database: { connected: bool, latency_ms: int },
        redis: { connected: bool },
        pinecone: { connected: bool },
        metrics_1h: {
            error_rate: float,
            avg_response_time_ms: int,
            total_requests: int
        }
    }
    """
    health = {
        "status": "healthy",
        "database": _check_database(),
        "redis": _check_redis(),
        "pinecone": _check_pinecone(),
        "metrics_1h": _get_recent_metrics()
    }
    
    # Determine overall status
    if not health["database"]["connected"]:
        health["status"] = "down"
    elif health["metrics_1h"]["error_rate"] > 10:  # >10% errors
        health["status"] = "degraded"
    elif health["database"]["latency_ms"] > 1000:  # DB slow
        health["status"] = "degraded"
    
    return JsonResponse(health)


def _check_database():
    """Check database connectivity and latency."""
    try:
        start = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        latency_ms = int((time.time() - start) * 1000)
        return {"connected": True, "latency_ms": latency_ms}
    except Exception as e:
        return {"connected": False, "error": str(e)[:100]}


def _check_redis():
    """Check Redis connectivity."""
    try:
        from core.services.redis_service import RedisService
        available = RedisService.is_available()
        if available:
            ping = RedisService.ping()
            return {"connected": ping}
        return {"connected": False}
    except Exception:
        return {"connected": False}


def _check_pinecone():
    """Check Pinecone connectivity."""
    try:
        from core.services.pinecone_service import get_pinecone_service
        service = get_pinecone_service()
        if service:
            # Try to get stats as a health check
            stats = service.get_stats()
            return {"connected": bool(stats)}
        return {"connected": False}
    except Exception:
        return {"connected": False}


def _get_recent_metrics():
    """Get metrics from the last hour."""
    try:
        one_hour_ago = timezone.now() - timedelta(hours=1)
        
        stats = RequestMetrics.objects.filter(
            timestamp__gte=one_hour_ago
        ).aggregate(
            total_requests=Count('id'),
            error_count=Count('id', filter=RequestMetrics.is_error == True),
            avg_response_time=Avg('response_time_ms')
        )
        
        total = stats['total_requests'] or 0
        errors = stats['error_count'] or 0
        error_rate = (errors / total * 100) if total > 0 else 0.0
        
        return {
            "error_rate": round(error_rate, 2),
            "avg_response_time_ms": int(stats['avg_response_time'] or 0),
            "total_requests": total
        }
    except Exception:
        return {
            "error_rate": 0.0,
            "avg_response_time_ms": 0,
            "total_requests": 0
        }

