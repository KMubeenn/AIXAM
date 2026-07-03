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

CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://lexa-rho.vercel.app",
        "http://3.239.50.12",
        "http://100.49.176.178",
]

# Apps that will use Django ORM
# NOTE: auth must come BEFORE the app with custom User model
INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.sessions",
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
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "apps.core.middleware.metrics.RequestMetricsMiddleware",
]

# Custom User model - MUST be set before first migration
AUTH_USER_MODEL = "users.User"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Use UTC timezone
USE_TZ = True
TIME_ZONE = "UTC"

CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["X-Session-Id"]

# Sessions (used for caching LLM responses like student insights)
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = False
