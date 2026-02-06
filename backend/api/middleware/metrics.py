"""
Request Metrics Middleware - Tracks API performance metrics.

Collects:
- Response time for each request
- Status codes and error rates
- Endpoint hit counts
"""
import time
from asgiref.sync import sync_to_async
from django.utils.deprecation import MiddlewareMixin

from database.models import RequestMetrics
from api.utils.jwt_utils import get_user_from_request


class RequestMetricsMiddleware(MiddlewareMixin):
    """
    Middleware to record request metrics for analytics.
    Tracks response times, status codes, and errors.
    """
    
    # Endpoints to skip tracking (health checks, static files, etc.)
    SKIP_PATHS = [
        '/api/health',
        '/admin',
        '/static',
        '/favicon.ico',
    ]
    
    def should_track(self, request):
        """Check if this request should be tracked."""
        path = request.path
        for skip_path in self.SKIP_PATHS:
            if path.startswith(skip_path):
                return False
        return path.startswith('/api/')
    
    def process_request(self, request):
        """Mark request start time."""
        request._metrics_start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Record metrics after response is generated."""
        if not self.should_track(request):
            return response
            
        try:
            # Calculate response time
            start_time = getattr(request, '_metrics_start_time', None)
            if start_time:
                response_time_ms = int((time.time() - start_time) * 1000)
            else:
                response_time_ms = 0
            
            # Get user if authenticated
            user = get_user_from_request(request)
            
            # Determine if this is an error
            is_error = response.status_code >= 400
            error_message = None
            if is_error:
                try:
                    # Try to extract error message from response
                    import json
                    content = response.content.decode('utf-8')
                    data = json.loads(content)
                    error_message = data.get('error', '')[:500]
                except:
                    pass
            
            # Create metrics record (run in thread to avoid async issues)
            self._record_metrics(
                endpoint=request.path,
                method=request.method,
                user=user,
                response_time_ms=response_time_ms,
                status_code=response.status_code,
                is_error=is_error,
                error_message=error_message,
            )
            
        except Exception as e:
            # Don't let metrics errors affect the response
            print(f"[Metrics] Error recording metrics: {e}")
        
        return response
    
    def _record_metrics(self, endpoint, method, user, response_time_ms, 
                        status_code, is_error, error_message):
        """Record metrics to database."""
        try:
            RequestMetrics.objects.create(
                endpoint=endpoint[:200],  # Truncate to fit field
                method=method,
                user=user,
                response_time_ms=response_time_ms,
                status_code=status_code,
                is_error=is_error,
                error_message=error_message,
            )
        except Exception as e:
            print(f"[Metrics] DB error: {e}")
