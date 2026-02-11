from django.urls import path, include

urlpatterns = [
    path("api/auth/", include("apps.users.urls")),
    path("api/chat/", include("apps.chat.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/health/", include("apps.analytics.urls.health")),
]
