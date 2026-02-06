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
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
