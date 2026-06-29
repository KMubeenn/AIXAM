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
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.profile.emails',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',       # upload/manage files created by this app
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
    Must provide Authorization Header or ?token= to link teacher account.
    """
    auth_token = None
    
    # Check Header first
    auth_header = request.headers.get("Authorization", "") or request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header and auth_header.startswith("Bearer "):
        auth_token = auth_header[7:]
    
    # Fallback to GET param
    if not auth_token:
        auth_token = request.GET.get('token')
        
    if not auth_token:
        return JsonResponse({"error": "Unauthorized. Missing token in Header or Query Parameter."}, status=401)
        
    # Validate token to ensure user exists
    from apps.users.jwt_utils import validate_token
    payload = validate_token(auth_token)
    if not payload:
        return JsonResponse({"error": "Token invalid or expired."}, status=401)
        
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    flow = _get_google_flow()
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
    )
    
    # Encode both JWT and code_verifier into state so callback can recover them
    code_verifier = getattr(flow, 'code_verifier', None) or ''
    combined_state = f"{auth_token}|||{code_verifier}"
    
    # Rebuild auth_url with our combined state
    from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
    parsed = urlparse(auth_url)
    params = parse_qs(parsed.query, keep_blank_values=True)
    params['state'] = [combined_state]
    new_query = urlencode(params, doseq=True)
    auth_url = urlunparse(parsed._replace(query=new_query))
    
    return redirect(auth_url)


@csrf_exempt
@require_http_methods(["GET"])
def google_classroom_callback(request):
    """
    Handle Google's redirect containing the auth code.
    Exchange code for tokens and save to User model.
    """
    combined_state = request.GET.get('state', '')
    
    if '|||' not in combined_state:
        return JsonResponse({"error": "OAuth state missing or malformed. Try again."}, status=400)
    
    auth_token, code_verifier = combined_state.split('|||', 1)
    
    from apps.users.jwt_utils import validate_token
    payload = validate_token(auth_token)
    if not payload:
        return JsonResponse({"error": "OAuth state token invalid or expired."}, status=401)
        
    user_id = payload['user_id']
    
    try:
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        flow = _get_google_flow()
        
        # Restore the code_verifier so PKCE exchange succeeds
        if code_verifier:
            flow.code_verifier = code_verifier
        
        flow.fetch_token(authorization_response=request.build_absolute_uri())
        
        credentials = flow.credentials
        
        # Save tokens
        user = User.objects.get(id=user_id)
        user.google_access_token = credentials.token
        user.google_refresh_token = credentials.refresh_token if credentials.refresh_token else user.google_refresh_token
        user.save(update_fields=['google_access_token', 'google_refresh_token'])
        
        # Redirect back to frontend
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        profile_route = f"/{user.role}-profile" if user.role in ['teacher', 'student'] else "/teacher-profile"
        return redirect(f"{frontend_url}{profile_route}?connected=true")
        
    except Exception as e:
        return JsonResponse({"error": f"OAuth exchange failed: {e}"}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def google_classroom_courses(request):
    """
    Direct endpoint for the frontend to list connected Google Classroom courses.
    Requires Authorization Header.
    """
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)
        
    try:
        from apps.chat.services.utilities.ClassroomService import ClassroomService
        courses = ClassroomService.list_courses(user)
        return JsonResponse({"courses": courses})
    except Exception as e:
        if "has not authorized" in str(e):
            return JsonResponse({"error": "Google Classroom not connected"}, status=403)
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_profile_view(request):
    """
    Return basic profile data for the authenticated user, including Google connection status.
    """
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    
    # Check if they have valid google tokens
    google_connected = bool(user.google_access_token or user.google_refresh_token)
    google_email = None
    
    if google_connected:
        try:
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            creds = ClassroomService.get_credentials(user)
            from googleapiclient.discovery import build
            oauth2_service = build('oauth2', 'v2', credentials=creds)
            user_info = oauth2_service.userinfo().get().execute()
            google_email = user_info.get('email')
        except Exception:
            pass

    return JsonResponse({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
        "google_connected": google_connected,
        "google_email": google_email,
        "date_joined": user.date_joined.isoformat() if user.date_joined else None
    })

@csrf_exempt
@require_http_methods(["POST"])
def change_password(request):
    """
    Change user password.
    Requires Authorization Header.
    Body: { current_password, new_password }
    """
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)
        
    try:
        data = json.loads(request.body)
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        
        if not current_password or not new_password:
            return JsonResponse({"error": "Both current and new passwords are required."}, status=400)
            
        if not check_password(current_password, user.password):
            return JsonResponse({"error": "Incorrect current password."}, status=400)
            
        if len(new_password) < 6:
            return JsonResponse({"error": "New password must be at least 6 characters."}, status=400)
            
        user.password = make_password(new_password)
        user.save(update_fields=['password'])
        
        return JsonResponse({"message": "Password updated successfully."})
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
