from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom User model extending Django's built-in AbstractUser.
    
    Inherits all fields from AbstractUser:
    - username (required, unique)
    - password (required)
    - email (optional)
    - first_name (optional)
    - last_name (optional)
    - is_active (default: True)
    - is_staff (default: False)
    - is_superuser (default: False)
    - date_joined (auto)
    - last_login (auto)
    
    Add custom fields below as needed.
    """
    
    # Add custom fields here as your app scales
    # Example:
    # phone_number = models.CharField(max_length=15, blank=True, null=True)
    # profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True, help_text="Google OAuth2 ID")
    google_access_token = models.TextField(blank=True, null=True, help_text="Google OAuth Access Token")
    google_refresh_token = models.TextField(blank=True, null=True, help_text="Google OAuth Refresh Token")
    profile_picture = models.URLField(max_length=500, blank=True, null=True, help_text="URL to user's profile picture")
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username


class OTPVerification(models.fields.related.Model if False else models.Model):
    """
    Model to store OTP codes for email verification.
    """
    email = models.EmailField(unique=True)
    otp_code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'otp_verifications'
        
    def __str__(self):
        return f"{self.email} - {self.otp_code}"
