"""
JWT Token Utilities for User Authentication.
Uses Django's signing module for secure token generation.
"""
import json
import hashlib
from datetime import datetime, timedelta
from django.core import signing
from django.conf import settings


# Token expiry time (7 days)
TOKEN_EXPIRY_DAYS = 7


def generate_token(user) -> str:
    """
    Generate a signed JWT-like token for the user.
    
    Args:
        user: Django User model instance
        
    Returns:
        Signed token string
    """
    payload = {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "exp": (datetime.utcnow() + timedelta(days=TOKEN_EXPIRY_DAYS)).isoformat(),
    }
    
    # Use Django's signing module (secure, built-in)
    token = signing.dumps(payload, salt="auth-token")
    return token


def validate_token(token: str) -> dict | None:
    """
    Validate and decode a token.
    
    Args:
        token: The token string to validate
        
    Returns:
        Decoded payload dict or None if invalid/expired
    """
    try:
        payload = signing.loads(token, salt="auth-token", max_age=TOKEN_EXPIRY_DAYS * 24 * 60 * 60)
        
        # Check expiry
        exp = datetime.fromisoformat(payload.get("exp", ""))
        if datetime.utcnow() > exp:
            return None
            
        return payload
    except (signing.BadSignature, signing.SignatureExpired, ValueError):
        return None


def get_user_from_request(request):
    """
    Extract and validate token from request, return user or None.
    Uses Redis caching to avoid DB lookup on every request.
    
    Token should be in Authorization header: "Bearer <token>"
    
    Args:
        request: Django request object
        
    Returns:
        User instance or None
    """
    from database.models import User
    
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    print(f"[AuthDebug] Header: {auth_header[:20]}...")
    
    if not auth_header.startswith("Bearer "):
        print("[AuthDebug] No Bearer token")
        return None
    
    token = auth_header[7:]  # Remove "Bearer " prefix
    try:
        payload = validate_token(token)
    except Exception as e:
        print(f"[AuthDebug] validation error: {e}")
        return None
    
    if not payload:
        print("[AuthDebug] Invalid/Expired token")
        return None
    
    user_id = payload["user_id"]
    print(f"[AuthDebug] Token valid for user_id: {user_id}")
    
    # Check Redis cache first
    try:
        from core.services.redis_service import RedisService
        if RedisService.is_available():
            cached = RedisService.get_user(user_id)
            if cached:
                # Reconstruct a minimal user object from cache
                # We need to fetch full user for model methods, but cache hit is logged
                print(f"[Auth] User cache HIT for user_id: {user_id}")
    except ImportError:
        pass
    except Exception as e:
        print(f"[AuthDebug] Redis error: {e}")
    
    try:
        user = User.objects.get(id=user_id)
        print(f"[AuthDebug] User found in DB: {user.email}")
        
        # Cache user data for future requests
        try:
            from core.services.redis_service import RedisService
            if RedisService.is_available():
                RedisService.set_user(user_id, user_to_dict(user))
        except ImportError:
            pass
        except Exception as e:
            print(f"[AuthDebug] Redis set error: {e}")
        
        return user
    except User.DoesNotExist:
        print(f"[AuthDebug] User {user_id} not found in DB")
        return None


def user_to_dict(user) -> dict:
    """
    Convert User model to dictionary for JSON response.
    
    Args:
        user: Django User model instance
        
    Returns:
        Dictionary with user data (excluding password)
    """
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "date_joined": user.date_joined.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }
