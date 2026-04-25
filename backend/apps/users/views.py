"""
Authentication Views - Handles user signup, login, logout, and profile.
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

from apps.users.models import User
from apps.users.jwt_utils import generate_token, get_user_from_request, user_to_dict


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
    role = data.get("role", "student").strip().lower()
    
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
        
    if role not in ['student', 'teacher', 'admin']:
        errors["role"] = "Invalid role"
    
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
            role=role,
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
        from apps.chat.services.services.redis_service import RedisService
        
        if not RedisService.is_available():
            return
        
        print(f"[Auth] Preloading data for user {user.id} into Redis cache...")
        
        # 1. Cache user profile
        RedisService.set_user(user.id, user_to_dict(user))
        
        # 2. Cache user sessions list
        try:
            from apps.chat.services.services.ChatPersistence import ChatPersistenceService
            sessions = ChatPersistenceService.get_user_sessions(user)
            if sessions:
                RedisService.set_user_sessions(user.id, sessions)
                
                # 3. Cache most recent session's memory
                if sessions:
                    recent_session_id = sessions[0].get("id")
                    if recent_session_id:
                        memory = ChatPersistenceService._load_session_memory_sync(recent_session_id)
                        if memory:
                            from apps.chat.services.services.SessionManager import _serialize_memory
                            RedisService.set_session_memory(recent_session_id, _serialize_memory(memory))
        except Exception as e:
            print(f"[Auth] Preload sessions error: {e}")
        
        # 4. Cache analytics summary
        try:
            from apps.chat.services.services.token_service import TokenTrackingService
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

# ──────────────────────────────────────────────
# GOOGLE CLASSROOM OAUTH
# ──────────────────────────────────────────────

import os
from django.shortcuts import redirect
import json

def _get_google_flow():
    from google_auth_oauthlib.flow import Flow
    client_config = {
        "web": {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
            "project_id": "aixam-classroom",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET", ""),
            "redirect_uris": [os.environ.get("GOOGLE_REDIRECT_URI", "")],
        }
    }
    scopes = [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.announcements'
    ]
    return Flow.from_client_config(
        client_config, 
        scopes=scopes, 
        redirect_uri=os.environ.get("GOOGLE_REDIRECT_URI", "")
    )

@csrf_exempt
@require_http_methods(["GET"])
def google_classroom_login(request):
    """
    Generate the OAuth URL and redirect the user to Google.
    Must provide Authorization Header to link teacher account.
    """
    user = get_user_from_request(request)
    if not user:
        # For simplicity, if accessed via browser, UI passing token in query string
        auth_token = request.GET.get('token')
        if auth_token:
            from apps.users.jwt_utils import validate_token
            payload = validate_token(auth_token)
            if payload:
                user = User.objects.filter(id=payload['user_id']).first()
    
    if not user:
        return JsonResponse({"error": "Unauthorized or missing token query parameter"}, status=401)
        
    flow = _get_google_flow()
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    # Store state & user ID temporarily in django session
    request.session['google_oauth_state'] = state
    request.session['google_oauth_user_id'] = str(user.id)
    request.session.modified = True
    
    return redirect(auth_url)


@csrf_exempt
@require_http_methods(["GET"])
def google_classroom_callback(request):
    """
    Handle Google's redirect containing the auth code.
    Exchange code for tokens and save to User model.
    """
    state_from_request = request.GET.get('state')
    state_from_session = request.session.get('google_oauth_state')
    user_id = request.session.get('google_oauth_user_id')
    
    if not user_id:
        return JsonResponse({"error": "OAuth session expired. Try again."}, status=400)
    
    try:
        flow = _get_google_flow()
        flow.fetch_token(authorization_response=request.build_absolute_uri())
        
        credentials = flow.credentials
        
        # Save tokens
        user = User.objects.get(id=user_id)
        user.google_access_token = credentials.token
        user.google_refresh_token = credentials.refresh_token if credentials.refresh_token else user.google_refresh_token
        user.save(update_fields=['google_access_token', 'google_refresh_token'])
        
        # Clear session
        if 'google_oauth_state' in request.session: del request.session['google_oauth_state']
        if 'google_oauth_user_id' in request.session: del request.session['google_oauth_user_id']
        
        # Redirect back to frontend
        return JsonResponse({"message": "Google Classroom connected successfully!"})
        
    except Exception as e:
        return JsonResponse({"error": f"OAuth exchange failed: {e}"}, status=500)
