"""
Auth URL patterns.
"""
from django.urls import path
from apps.users.views import (
    signup, login, logout, me, get_profile_view,
    google_classroom_login, google_classroom_callback, google_classroom_courses
)

urlpatterns = [
    path("signup/", signup, name="auth_signup"),
    path("login/", login, name="auth_login"),
    path("logout/", logout, name="auth_logout"),
    path("me/", me, name="auth_me"),
    path("profile/", get_profile_view, name="auth_profile"),
    
    # Google Classroom
    path("google/login/", google_classroom_login, name="google_login"),
    path("google/callback/", google_classroom_callback, name="google_callback"),
    path("google/courses/", google_classroom_courses, name="google_courses"),
]
