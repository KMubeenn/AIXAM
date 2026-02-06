"""
Auth URL patterns.
"""
from django.urls import path
from api.views.auth import signup, login, logout, me

urlpatterns = [
    path("signup/", signup, name="auth_signup"),
    path("login/", login, name="auth_login"),
    path("logout/", logout, name="auth_logout"),
    path("me/", me, name="auth_me"),
]
