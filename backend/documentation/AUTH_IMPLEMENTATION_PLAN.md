# User Authentication Implementation Plan

## Current State Analysis

### Frontend (Already Exists)

| Component            | Status                  | Notes                      |
| -------------------- | ----------------------- | -------------------------- |
| `Login.jsx`          | ✅ Page exists          | Uses `LoginForm`           |
| `Signup.jsx`         | ✅ Page exists          | Uses `SignupForm`          |
| `LoginForm.jsx`      | ✅ Form with validation | Email/password fields      |
| `SignupForm.jsx`     | ✅ Form with validation | Name/email/password/terms  |
| `AuthContext.jsx`    | ⚠️ Client-side only     | No backend calls           |
| `ProtectedRoute.jsx` | ✅ Works                | Checks `isAuthenticated`   |
| `storage.js`         | ✅ Utilities            | User/token storage helpers |

### Backend (Needs Implementation)

| Component      | Status     | Notes                            |
| -------------- | ---------- | -------------------------------- |
| `User` model   | ✅ Exists  | Django AbstractUser              |
| Auth views     | ❌ Missing | Need signup, login, logout, me   |
| Auth URLs      | ❌ Missing | Need `/api/auth/*` routes        |
| JWT/Token auth | ❌ Missing | Need token generation/validation |

---

## Proposed Changes

### Backend - Auth Views

#### [NEW] `api/views/auth.py`

```python
# Endpoints:
POST /api/auth/signup/    # Create user, return token
POST /api/auth/login/     # Verify credentials, return token
POST /api/auth/logout/    # Invalidate token
GET  /api/auth/me/        # Get current user profile
```

**Signup Flow:**

```
Request: { username, email, password, name }
    ↓
Validate input (email unique, password strength)
    ↓
Create User in database (password hashed)
    ↓
Generate JWT token
    ↓
Response: { user: {...}, token: "..." }
```

**Login Flow:**

```
Request: { email, password }
    ↓
Find user by email
    ↓
Verify password hash
    ↓
Generate JWT token
    ↓
Response: { user: {...}, token: "..." }
```

---

#### [NEW] `api/urls/auth.py`

URL patterns for auth endpoints.

#### [MODIFY] `api/urls/__init__.py`

Add auth routes: `path("auth/", include("api.urls.auth"))`

---

### Backend - Auth Utilities

#### [NEW] `api/utils/jwt_utils.py`

JWT token generation and validation:

- `generate_token(user)` → Returns JWT string
- `validate_token(token)` → Returns user or None
- `get_user_from_request(request)` → Extract token, return user

---

### Frontend - API Service

#### [NEW] `frontend/src/api/auth.js`

```javascript
const API_BASE = 'http://localhost:8000/api';

export const authAPI = {
    signup: (name, email, password) =>
        fetch(`${API_BASE}/auth/signup/`, {...}),

    login: (email, password) =>
        fetch(`${API_BASE}/auth/login/`, {...}),

    logout: () =>
        fetch(`${API_BASE}/auth/logout/`, {...}),

    getMe: () =>
        fetch(`${API_BASE}/auth/me/`, {...}),
};
```

---

#### [MODIFY] `frontend/src/context/AuthContext.jsx`

Replace client-side fake auth with real API calls.

---

## Request Flow

```
User fills signup form
    ↓
Frontend validates input
    ↓
POST /api/auth/signup/
    ↓
Backend hashes password
    ↓
INSERT INTO users table
    ↓
Generate JWT token
    ↓
Return { user, token }
    ↓
Frontend stores in localStorage
    ↓
Redirect to /chat
```

---

## Summary of Changes

| File                                   | Action | Purpose                         |
| -------------------------------------- | ------ | ------------------------------- |
| `api/views/auth.py`                    | NEW    | Signup, login, logout, me views |
| `api/urls/auth.py`                     | NEW    | Auth URL patterns               |
| `api/urls/__init__.py`                 | MODIFY | Include auth routes             |
| `api/utils/jwt_utils.py`               | NEW    | JWT token utilities             |
| `frontend/src/api/auth.js`             | NEW    | Auth API service                |
| `frontend/src/context/AuthContext.jsx` | MODIFY | Use real API calls              |
| `frontend/src/utils/storage.js`        | MODIFY | Add token storage               |

---

## Verification Plan

1. Test signup: Create user, verify in database
2. Test login: Verify token returned
3. Test protected routes: Verify token validation
4. Test frontend flow: Signup → Login → Access chat
