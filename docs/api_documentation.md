# API Documentation

The AIXAM backend provides a RESTful API built with Django and Django REST Framework. 

## Base URL
All API routes are prefixed with `/api/`. Local development URL is typically `http://localhost:8000/api/`.

---

## 1. Authentication Routes (`/api/auth/`)
All authentication relies on JWT (JSON Web Tokens). The Refresh Token is stored securely in an HTTP-only cookie, while the Access Token is returned to the client.

### POST `/auth/signup/`
Registers a new user (student or teacher) and sends an OTP to their email.
*   **Body:** `{"first_name": "John", "last_name": "Doe", "email": "john@example.com", "password": "secure123", "role": "student"}`
*   **Response (200):** `{"message": "User registered successfully. Check email for OTP."}`

### POST `/auth/verify-otp/`
Verifies the 6-digit OTP sent to the user's email to activate the account.
*   **Body:** `{"email": "john@example.com", "otp": "123456"}`
*   **Response (200):** Returns JWT tokens.

### POST `/auth/login/`
Authenticates an active user.
*   **Body:** `{"email": "john@example.com", "password": "secure123"}`
*   **Response (200):** `{"access": "ey...", "user": {"id": 1, "role": "student"}}` (Refresh token is set via `Set-Cookie` header).

---

## 2. Core API Routes (`/api/core/`)
Requires a valid `Authorization: Bearer <token>` header.

### GET `/core/materials/`
Fetches all study materials associated with the logged-in user.
*   **Response (200):** `[{"id": 1, "title": "Math Basics", "type": "pdf"}]`

### GET `/core/analytics/insights/`
Triggers the LLM to analyze the student's performance data and returns a structured study plan and performance summary.
*   **Response (200):** 
```json
{
  "overall_summary": {
    "accuracy": 75.5,
    "questions_attempted": 120
  },
  "exam_readiness": {
    "score": 8,
    "status": "Ready",
    "explanation": "Strong fundamentals in DB systems."
  },
  "study_plan": [
    {"timeframe": "Week 1", "task": "Review SQL Joins"}
  ]
}
```

---

## 3. Chat API Routes (`/api/chat/`)
Requires a valid `Authorization: Bearer <token>` header.

### POST `/chat/message/`
Sends a message to the LangGraph AI Agent (Student or Teacher) and returns the AI's response along with any newly generated structured artifacts (like Flashcards or Mock Tests).
*   **Body:** `{"message": "Generate a mock test for Machine Learning", "session_id": "uuid"}`
*   **Response (200):** `{"reply": "Here is your mock test...", "artifacts": {"mock_test": [...]}}`
