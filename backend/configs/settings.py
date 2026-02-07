import os

# Required for Django
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-change-in-production")
DEBUG = os.getenv("DEBUG", "True").lower() == "false"
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "3.239.50.12", "100.49.176.178", "*"]

# Database configuration - Supabase PostgreSQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("SUPABASE_DB_NAME", "postgres"),
        "USER": os.getenv("SUPABASE_DB_USER", "postgres"),
        "PASSWORD": os.getenv("SUPABASE_DB_PASSWORD", ""),
        "HOST": os.getenv("SUPABASE_DB_HOST", "localhost"),
        "PORT": os.getenv("SUPABASE_DB_PORT", "5432"),
        "OPTIONS": {
            "sslmode": "require",  # Supabase requires SSL
        },
    }
}

# Apps that will use Django ORM
# NOTE: auth must come BEFORE the app with custom User model
INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "apps.users",     # User management
    "apps.chat",      # Chat and Voice agents
    "apps.analytics", # Metrics and usage
    "apps.core",      # Core utilites and middleware
]

# URL Configuration
ROOT_URLCONF = "configs.urls"

# ASGI Application
ASGI_APPLICATION = "configs.asgi.application"

# Middleware
MIDDLEWARE = [
    "apps.core.middleware.cors.CORSMiddleware",
    "apps.core.middleware.metrics.RequestMetricsMiddleware",
]

# Custom User model - MUST be set before first migration
AUTH_USER_MODEL = "users.User"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Use UTC timezone
USE_TZ = True
TIME_ZONE = "UTC"
