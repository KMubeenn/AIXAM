"""
Auth URL patterns.
"""
from django.urls import path
from apps.users.views import signup, login, logout, me, google_classroom_login, google_classroom_callback

urlpatterns = [
    path("signup/", signup, name="auth_signup"),
    path("login/", login, name="auth_login"),
    path("logout/", logout, name="auth_logout"),
    path("me/", me, name="auth_me"),
    
    # Google Classroom
    path("google/login/", google_classroom_login, name="google_login"),
    path("google/callback/", google_classroom_callback, name="google_callback"),
]
