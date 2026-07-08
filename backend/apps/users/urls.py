"""
Auth URL patterns.
"""
from django.urls import path
from apps.users.views import (
    signup, login, logout, me, get_profile_view, change_password,
    delete_account, google_classroom_login, google_classroom_callback, google_classroom_courses,
    send_otp, verify_otp, reset_password
)

urlpatterns = [
    path("signup/", signup, name="auth_signup"),
    path("login/", login, name="auth_login"),
    path("logout/", logout, name="auth_logout"),
    path("me/", me, name="auth_me"),
    path("me/delete/", delete_account, name="delete_account"),
    path("profile/", get_profile_view, name="auth_profile"),
    path("change-password/", change_password, name="auth_change_password"),
    
    # OTP & Reset
    path("send-otp/", send_otp, name="auth_send_otp"),
    path("verify-otp/", verify_otp, name="auth_verify_otp"),
    path("reset-password/", reset_password, name="auth_reset_password"),
    # Google Classroom
    path("google/login/", google_classroom_login, name="google_login"),
    path("google/callback/", google_classroom_callback, name="google_callback"),
    path("google/courses/", google_classroom_courses, name="google_courses"),
]
