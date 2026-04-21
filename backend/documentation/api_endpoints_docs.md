# AIXAM Backend API Endpoints

This document is the **complete integration contract** for frontend developers.
It covers every endpoint, every accepted field, every possible response shape, and all edge cases.

---

## Authentication

All protected endpoints require the following HTTP header:
```
Authorization: Bearer <token>
```
The token is obtained from the login or register response. The token encodes the user's `id` and `role` — no separate role field is needed in requests.

---

## 1. Users & Authentication (`/api/users/`)

### 1.1 Register
**POST** `/api/users/register/`

**Request Body (JSON):**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Min 2 characters |
| `email` | string | ✅ | Must be unique |
| `password` | string | ✅ | Min 6 characters |
| `role` | string | ❌ | `"student"` (default), `"teacher"`, or `"admin"` |

```json
{
    "name": "John Doe",
    "email": "john@email.com",
    "password": "securepass",
    "role": "teacher"
}
```

**Response (201 Created):**
```json
{
    "message": "User registered successfully",
    "token": "django-signed-token-string",
    "user": {
        "id": "uuid",
        "username": "John Doe",
        "email": "john@email.com",
        "role": "teacher",
        "date_joined": "2026-04-21T10:00:00Z"
    }
}
```

**Error Response (400):**
```json
{
    "errors": {
        "email": "An account with this email already exists",
        "password": "Password must be at least 6 characters"
    }
}
```

---

### 1.2 Login
**POST** `/api/users/login/`

**Request Body (JSON):**
| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

```json
{
    "email": "john@email.com",
    "password": "securepass"
}
```

**Response (200 OK):**
```json
{
    "token": "django-signed-token-string",
    "user": {
        "id": "uuid",
        "username": "John Doe",
        "email": "john@email.com",
        "role": "student",
        "last_login": "2026-04-21T10:00:00Z"
    }
}
```

**Error Response (401):**
```json
{ "error": "Invalid credentials" }
```

---

### 1.3 Get Current User
**GET** `/api/users/me/`
- **Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
    "user": {
        "id": "uuid",
        "username": "John Doe",
        "email": "john@email.com",
        "role": "teacher",
        "date_joined": "2026-04-21T10:00:00Z",
        "last_login": "2026-04-21T12:00:00Z"
    }
}
```

---

## 2. Chat & AI Agent (`/api/chat/`)

There is **one single endpoint** for all chat interactions. Grading, generation, and conversation all go through it. The behavior changes based on the fields sent.

**POST** `/api/chat/`
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `application/json` (or `multipart/form-data` if uploading files)
- **Response:** HTTP Streaming Response (`Content-Type: text/plain`)

---

### 2.1 Field Reference (All Possible Fields)

| Field | Type | Required | Notes |
|---|---|---|---|
| `message` | string | ✅ | The user's chat message |
| `session_id` | string (UUID) | ✅* | Required unless `create_session: true` |
| `create_session` | boolean | ❌ | `true` to create a new session. Returns `session_id` in response header `X-Session-Id` |
| `grade_test` | boolean | ❌ | Set to `true` to trigger grading mode |
| `test_submission` | array | ❌ | Required when `grade_test: true`. Array of student answers |
| `quiz_id` | string (UUID) | ❌ | The `record_id` of the quiz to grade against |
| `grading_instructions` | string | ❌ | Optional custom grading rubric text |
| `files` | file (multipart) | ❌ | Upload a PDF/DOCX/PPTX as study material context |
| `study_material_id` | string (UUID) | ❌ | Reference a previously uploaded material |

---

### 2.2 Use Case: Regular Conversation
```json
{
    "session_id": "47ffa3aa-8c24-479d-a2ee-0cf9bef1640e",
    "message": "Explain what transformers are in deep learning"
}
```

---

### 2.3 Use Case: Create New Session
```json
{
    "create_session": true,
    "message": "Hello, let's start studying"
}
```
The response header will contain `X-Session-Id: <new-uuid>`. **Store this and send it in all subsequent requests.**

---

### 2.4 Use Case: Generate Study Materials (Student)
```json
{
    "session_id": "47ffa3aa-8c24-479d-a2ee-0cf9bef1640e",
    "message": "Generate me 10 MCQ questions on neural networks"
}
```

```json
{
    "session_id": "47ffa3aa-8c24-479d-a2ee-0cf9bef1640e",
    "message": "Give me 5 flashcards on Python decorators"
}
```

---

### 2.5 Use Case: Upload File + Generate From It
Send as `multipart/form-data`:
| Field | Value |
|---|---|
| `session_id` | `"47ffa3aa-..."` |
| `message` | `"Generate a mock test from this document"` |
| `files` | `<PDF/DOCX/PPTX binary>` |

---

### 2.6 Use Case: Grade a Student Test Submission
```json
{
    "session_id": "47ffa3aa-8c24-479d-a2ee-0cf9bef1640e",
    "message": "Please grade my answers",
    "grade_test": true,
    "quiz_id": "b28f9cba-dfef-463f-b150-3e4b7adf1aee",
    "test_submission": [
        {
            "question_id": 1,
            "question": "What is backpropagation?",
            "student_answer": "It is the process of updating weights using gradients."
        },
        {
            "question_id": 2,
            "question": "What is an activation function?",
            "student_answer": "A mathematical function applied to neuron output."
        }
    ]
}
```

> **Note:** The `quiz_id` is the `record_id` returned in the structured payload when the quiz was first generated. The frontend must store this when it first receives a `mock_test` or `mcq_test` payload.

---

### 2.7 Use Case: Teacher — Generate Assignment / Quiz / Slides
The backend automatically detects the teacher's role from the JWT token. Simply send a natural language request:
```json
{
    "session_id": "...",
    "message": "Create an assignment on database normalization with 5 questions worth 50 marks total"
}
```
```json
{
    "session_id": "...",
    "message": "Generate a teacher quiz on neural networks and export it as PDF"
}
```

---

### 2.8 Streaming Response Format

The response is a **text stream**. Each chunk is a JSON string terminated by `\n`. The frontend should parse each line as a JSON object.

**Token chunks (streaming text):**
```
I can help you with that...
```
(Raw text, not JSON — just streamed characters)

**Structured payload chunks (sent after streaming finishes):**
```json
{"type": "flashcards", "data": [...], "record_id": "uuid"}
{"type": "mock_test", "data": [...], "record_id": "uuid"}
{"type": "mcq_test", "data": [...], "record_id": "uuid"}
{"type": "mock_test_grades", "data": {...}}
{"type": "document", "data": {"filename": "test.pdf", "file_base64": "...", "mime_type": "application/pdf"}}
{"type": "assignment", "data": {...}, "record_id": "uuid"}
{"type": "teacher_quiz", "data": {...}, "record_id": "uuid"}
{"type": "slide_outline", "data": {...}}
{"type": "batch_grades", "data": [...]}
```

**Important — `record_id`:** When you receive a structured payload with a `record_id`, **store it**. You will need it to:
- Submit quiz answers for grading (`quiz_id` field)
- Reference assignments or materials in future requests

---

## 3. Core Database Endpoints (`/api/core/`)

All require `Authorization: Bearer <token>`.

---

### 3.1 Get Teacher Assignments
**GET** `/api/core/assignments/`

**Response (200 OK):**
```json
{
    "assignments": [
        {
            "id": "uuid",
            "title": "Semester Final Assignment",
            "total_marks": 100,
            "course_id": "google-classroom-course-id",
            "deadline": "2026-05-18T10:00:00Z",
            "created_at": "2026-04-21T10:00:00Z"
        }
    ]
}
```

---

### 3.2 Get Assignment Detail (with Questions)
**GET** `/api/core/assignments/<assignment_id>/`

**Response (200 OK):**
```json
{
    "assignment": {
        "id": "uuid",
        "title": "Semester Final",
        "description": "Full instructions...",
        "course_id": "google-classroom-id",
        "deadline": "2026-05-18T10:00:00Z",
        "total_marks": 100,
        "created_at": "2026-04-21T10:00:00Z",
        "questions": [
            {
                "id": 1,
                "question": "Explain normalization.",
                "marks": 20,
                "answer": "Official answer...",
                "rubric": "Check for 1NF, 2NF, 3NF coverage."
            }
        ]
    }
}
```

---

### 3.3 Delete Assignment
**DELETE** `/api/core/assignments/<assignment_id>/delete/`

**Response (200 OK):**
```json
{ "message": "Assignment deleted successfully" }
```

**Error (404):**
```json
{ "error": "Assignment not found" }
```

---

### 3.4 Get Assignment Submissions (Graded)
**GET** `/api/core/assignments/<assignment_id>/submissions/`

**Response (200 OK):**
```json
{
    "submissions": [
        {
            "id": "uuid",
            "student_id": "uuid",
            "student_name": "Jane",
            "score": 87.5,
            "feedback": "Strong answer but missing BCNF explanation.",
            "is_late": false,
            "submitted_at": "2026-05-17T09:00:00Z"
        }
    ]
}
```

---

### 3.5 Get Study Materials
**GET** `/api/core/materials/`

**Response (200 OK):**
```json
{
    "materials": [
        {
            "id": "uuid",
            "title": "Chapter4_Databases.pdf",
            "file_type": "pdf",
            "created_at": "2026-04-20T10:00:00Z"
        }
    ]
}
```

---

### 3.6 Get User Quizzes
**GET** `/api/core/quizzes/`

**Response (200 OK):**
```json
{
    "quizzes": [
        {
            "id": "uuid",
            "title": "Neural Networks MCQ Quiz",
            "created_at": "2026-04-21T10:00:00Z"
        }
    ]
}
```

---

### 3.7 Get Quiz Detail
**GET** `/api/core/quizzes/<quiz_id>/`

**Response (200 OK):**
```json
{
    "quiz": {
        "id": "uuid",
        "title": "Neural Networks Quiz",
        "questions": [
            {
                "id": 1,
                "question": "What is ReLU?",
                "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
                "answer": "A"
            }
        ]
    }
}
```

---

### 3.8 Get Submissions (Student's Own)
**GET** `/api/core/submissions/`

**Response (200 OK):**
```json
{
    "submissions": [
        {
            "id": "uuid",
            "score": 90.0,
            "feedback": "Excellent answers across all categories.",
            "submitted_at": "2026-04-21T11:00:00Z"
        }
    ]
}
```

---

### 3.9 Get Performance Stats
**GET** `/api/core/performance/`

**Response (200 OK):**
```json
{
    "performance": {
        "average_score": 84.5,
        "total_submissions": 12,
        "improvement_trend": "positive"
    }
}
```

---

## 4. Error Response Reference

| Status | Meaning |
|---|---|
| `400` | Bad request — missing or invalid fields |
| `401` | Unauthorized — missing, expired, or invalid token |
| `403` | Forbidden — user role does not have access to this resource |
| `404` | Resource not found |
| `500` | Internal server error |

All errors return: `{ "error": "description" }` or `{ "errors": { "field": "message" } }`
