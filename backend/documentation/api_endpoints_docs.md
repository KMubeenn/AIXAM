# AIXAM Backend API Endpoints

This document serves as the master contract for all Frontend to Backend HTTP interfaces. 

---

## 1. Authentication & Users (`apps/users`)

### Register User
**POST** `/api/users/register/`
* **Expects**:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@email.com",
    "password": "securepassword",
    "role": "student" // or "teacher", "admin"
  }
  ```
* **Returns (201 Created)**:
  ```json
  {
     "message": "User registered successfully",
     "user": {"id": "uuid", "email": "johndoe@email.com", ...},
     "access_token": "jwt.header.payload"
  }
  ```

### Login User
**POST** `/api/users/login/`
* **Expects**:
  ```json
  {
    "email": "johndoe@email.com",
    "password": "securepassword"
  }
  ```
* **Returns (200 OK)**:
  ```json
  {
     "token": "jwt.header.payload",
     "user": {"id": "uuid", "role": "teacher", ...}
  }
  ```

### Get Current User
**GET** `/api/users/me/`
* **Headers**: `Authorization: Bearer <token>`
* **Returns (200 OK)**:
  ```json
  {
     "user": {"id": "uuid", "username": "John Doe", "role": "student"}
  }
  ```

---

## 2. Chat & AI Agents (`apps/chat`)

### Streaming Agent Interaction
**POST** `/api/chat/agent_endpoint/`
* **Headers**: `Authorization: Bearer <token>` (optional if session_id passed, but recommended)
* **Expects (Body/Form-Data if files present)**:
  ```json
  {
     "message": "Generate me a mock test on calculus.",
     "session_id": "uuid" (optional),
     "create_session": true,
     "role": "student",
     "grade_test": false
  }
  ```
* **Returns**:
  An HTTP `StreamingHttpResponse` (Content-Type: text/plain). Content streams rapidly in continuous JSON-encoded chunks.
  *Chunk Format Example*:
  `[{"type": "token", "content": "I "}, {"type": "token", "content": "can "}, ...]`
  *Structured Payload Chunk Formatting*:
  `[{"type": "mock_test", "data": {"title": "Calculus Test", "questions": [...]}}]`

---

## 3. Core Database Endpoints (`apps/core`)

All requests require `Authorization: Bearer <token>` header checking the JWT payload automatically.

### Get Teacher Assignments
**GET** `/api/core/assignments/`
* **Returns (200 OK)**:
  ```json
  {
     "assignments": [
        {
          "id": "uuid",
          "title": "Semester Final",
          "total_marks": 100,
          "has_quiz": true
        }
     ]
  }
  ```

### Get Specific Assignment Details
**GET** `/api/core/assignments/<assignment_id>/`
* **Returns (200 OK)**:
  ```json
  {
     "assignment": {
         "id": "uuid",
         "title": "Semester Final",
         "deadline": "2026-05-18T10:00:00Z",
         "questions": [{"question": "What is 2+2?", "answer": "4"}]
     }
  }
  ```

### Delete Assignment
**DELETE** `/api/core/assignments/<assignment_id>/delete/`
* **Returns (200 OK)**:
  `{"message": "Assignment deleted successfully"}`

### Get Assignment Submissions 
**GET** `/api/core/assignments/<assignment_id>/submissions/`
* **Returns (200 OK)**:
  ```json
  {
     "submissions": [
        {
           "id": "uuid",
           "student_name": "Johnny",
           "score": 95.0,
           "feedback": "Great structural formatting."
        }
     ]
  }
  ```

### Get User Study Materials
**GET** `/api/core/materials/`
* **Returns (200 OK)**:
  ```json
  {
      "materials": [
         {
             "id": "uuid",
             "title": "Science_Chapter_4.pdf",
             "file_type": "pdf"
         }
      ]
  }
  ```
