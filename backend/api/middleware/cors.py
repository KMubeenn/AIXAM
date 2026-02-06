"""
CORS Middleware for Django.
Handles Cross-Origin Resource Sharing headers.
"""


class CORSMiddleware:
    """
    Middleware to add CORS headers to responses....
    """

    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://lexa-rho.vercel.app",
        "http://3.239.50.12",
        "http://100.49.176.178",
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            response = self._build_preflight_response(request)
        else:
            response = self.get_response(request)
            response = self._add_cors_headers(request, response)
        return response

    def _get_origin(self, request):
        return request.META.get("HTTP_ORIGIN", "")

    def _is_allowed_origin(self, origin):
        return origin in self.ALLOWED_ORIGINS

    def _add_cors_headers(self, request, response):
        origin = self._get_origin(request)
        if self._is_allowed_origin(origin):
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response

    def _build_preflight_response(self, request):
        from django.http import HttpResponse

        response = HttpResponse()
        origin = self._get_origin(request)
        if self._is_allowed_origin(origin):
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response["Access-Control-Max-Age"] = "86400"  # 24 hours
        return response
