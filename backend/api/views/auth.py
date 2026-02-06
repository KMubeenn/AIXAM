"""
Authentication Views - Handles user signup, login, logout, and profile.
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

from database.models import User
from api.utils.jwt_utils import generate_token, get_user_from_request, user_to_dict


@csrf_exempt
@require_http_methods(["POST"])
def signup(request):
    """
    Create a new user account.
    
    Request body: { name, email, password }
    Response: { user: {...}, token: "..." }
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    # Extract fields
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    # Validation
    errors = {}
    
    if not name:
        errors["name"] = "Name is required"
    elif len(name) < 2:
        errors["name"] = "Name must be at least 2 characters"
    
    if not email:
        errors["email"] = "Email is required"
    elif "@" not in email:
        errors["email"] = "Invalid email format"
    elif User.objects.filter(email=email).exists():
        errors["email"] = "An account with this email already exists"
    
    if not password:
        errors["password"] = "Password is required"
    elif len(password) < 6:
        errors["password"] = "Password must be at least 6 characters"
    
    if errors:
        return JsonResponse({"errors": errors}, status=400)
    
    # Create user
    try:
        # Use email as username (or generate from name)
        username = email.split("@")[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            first_name=name.split()[0] if name else "",
            last_name=" ".join(name.split()[1:]) if len(name.split()) > 1 else "",
        )
        
        # Generate token
        token = generate_token(user)
        
        print(f"[Auth] User created: {user.email}")
        
        return JsonResponse({
            "user": user_to_dict(user),
            "token": token,
        }, status=201)
        
    except Exception as e:
        print(f"[Auth] Signup error: {e}")
        return JsonResponse({"error": "Failed to create user"}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Authenticate user and return token.
    Triggers background preload of user data into Redis cache.
    
    Request body: { email, password }
    Response: { user: {...}, token: "..." }
    """
    print("[Auth] === LOGIN ENDPOINT CALLED ===")
    
    try:
        data = json.loads(request.body)
        print(f"[Auth] Request data: {data}")
    except json.JSONDecodeError:
        print("[Auth] ERROR: Invalid JSON")
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    print(f"[Auth] Login attempt for email: {email}")
    
    if not email or not password:
        print("[Auth] ERROR: Missing email or password")
        return JsonResponse({"error": "Email and password are required"}, status=400)
    
    # Find user by email
    try:
        user = User.objects.get(email=email)
        print(f"[Auth] User found: {user.username}, stored password hash: {user.password[:20]}...")
    except User.DoesNotExist:
        print(f"[Auth] ERROR: No user found with email: {email}")
        return JsonResponse({"error": "Account not found. Please check your email or sign up."}, status=401)
    
    # Verify password
    password_valid = check_password(password, user.password)
    print(f"[Auth] Password check result: {password_valid}")
    
    if not password_valid:
        print(f"[Auth] ERROR: Password mismatch for {email}")
        return JsonResponse({"error": "Incorrect password. Please try again."}, status=401)
    
    # Update last login
    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])
    
    # Generate token
    token = generate_token(user)
    
    # Trigger background preload of user data into Redis cache
    _preload_user_data(user)
    
    print(f"[Auth] User logged in successfully: {user.email}")
    
    return JsonResponse({
        "user": user_to_dict(user),
        "token": token,
    })


def _preload_user_data(user):
    """
    Preload user data into Redis cache for faster subsequent access.
    This runs synchronously after login to warm up the cache.
    
    Preloads:
    - User profile data
    - User's session list
    - Most recent session's memory
    - Analytics summary
    """
    try:
        from core.services.redis_service import RedisService
        
        if not RedisService.is_available():
            return
        
        print(f"[Auth] Preloading data for user {user.id} into Redis cache...")
        
        # 1. Cache user profile
        RedisService.set_user(user.id, user_to_dict(user))
        
        # 2. Cache user sessions list
        try:
            from core.services.ChatPersistence import ChatPersistenceService
            sessions = ChatPersistenceService.get_user_sessions(user)
            if sessions:
                RedisService.set_user_sessions(user.id, sessions)
                
                # 3. Cache most recent session's memory
                if sessions:
                    recent_session_id = sessions[0].get("id")
                    if recent_session_id:
                        memory = ChatPersistenceService._load_session_memory_sync(recent_session_id)
                        if memory:
                            from core.services.SessionManager import _serialize_memory
                            RedisService.set_session_memory(recent_session_id, _serialize_memory(memory))
        except Exception as e:
            print(f"[Auth] Preload sessions error: {e}")
        
        # 4. Cache analytics summary
        try:
            from core.services.token_service import TokenTrackingService
            summary = TokenTrackingService.get_user_summary(user, days=30)
            # get_user_summary now caches automatically, but we call it to warm up
        except Exception as e:
            print(f"[Auth] Preload analytics error: {e}")
        
        print(f"[Auth] Preload completed for user {user.id}")
        
    except ImportError:
        pass
    except Exception as e:
        print(f"[Auth] Preload error: {e}")


@csrf_exempt
@require_http_methods(["POST"])
def logout(request):
    """
    Logout user (client should discard token).
    
    Note: Since we use stateless tokens, logout is handled client-side.
    This endpoint is for consistency and future token blacklisting.
    """
    user = get_user_from_request(request)
    
    if user:
        print(f"[Auth] User logged out: {user.email}")
    
    return JsonResponse({"message": "Logged out successfully"})


@csrf_exempt
@require_http_methods(["GET"])
def me(request):
    """
    Get current authenticated user profile.
    
    Requires Authorization header: "Bearer <token>"
    Response: { user: {...} }
    """
    user = get_user_from_request(request)
    
    if not user:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    return JsonResponse({
        "user": user_to_dict(user),
    })
