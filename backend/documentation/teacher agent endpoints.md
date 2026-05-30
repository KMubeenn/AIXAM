# Teacher Agent — API Endpoints Documentation
**For Frontend Integration**
**Base URL:** `/api/core/`
**Auth:** All endpoints require `Authorization: Bearer <jwt_token>` header.
**Role Guard:** All teacher endpoints return `401` if the user role is not `teacher`.

---

## Table of Contents
1. [Assignments](#1-assignments)
2. [Teacher Quizzes](#2-teacher-quizzes)
3. [Batch Grades & Class Report](#3-batch-grades--class-report)
4. [Google Classroom Integration](#4-google-classroom-integration)

---

## 1. Assignments

### `GET /api/core/assignments/`
List all assignments created by the authenticated teacher.

**Response `200`:**
```json
{
  "assignments": [
    {
      "id": "uuid",
      "title": "Databases Mid-Term",
      "course_id": "google_classroom_course_id_or_null",
      "deadline": "2026-06-15T23:59:00Z",
      "total_marks": 100.0,
      "created_at": "2026-05-30T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/core/assignments/<assignment_id>/`
Get full detail of a single assignment including its questions.

**Response `200`:**
```json
{
  "assignment": {
    "id": "uuid",
    "title": "Databases Mid-Term",
    "description": "Generated assignment for Databases",
    "course_id": "google_course_id",
    "deadline": "2026-06-15T23:59:00Z",
    "total_marks": 100.0,
    "created_at": "2026-05-30T10:00:00Z",
    "questions": [
      {
        "id": "uuid",
        "text": "Explain normalization.\n\nRUBRIC: Must include 1NF, 2NF, 3NF.",
        "question_type": "descriptive",
        "points": 20
      }
    ]
  }
}
```

**Response `404`:** `{ "error": "Assignment not found" }`

---

### `DELETE /api/core/assignments/<assignment_id>/delete/`
Delete an assignment and its linked quiz/questions.

**Response `200`:** `{ "message": "Assignment deleted successfully" }`
**Response `404`:** `{ "error": "Assignment not found" }`

---

### `GET /api/core/assignments/<assignment_id>/submissions/`
Get all student submissions for a specific assignment (local DB records only — not Google Classroom).

**Response `200`:**
```json
{
  "submissions": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "John Doe",
      "score": 78.5,
      "feedback": "Good understanding of normalization concepts.",
      "is_late": false,
      "submitted_at": "2026-06-14T20:00:00Z"
    }
  ]
}
```

---

## 2. Teacher Quizzes

### `GET /api/core/teacher/quizzes/`
List all quizzes of type `assignment_quiz` created by the teacher (generated via the AI agent).

**Response `200`:**
```json
{
  "quizzes": [
    {
      "id": "uuid",
      "title": "Databases Teacher Quiz",
      "question_count": 10,
      "created_at": "2026-05-30T10:00:00Z"
    }
  ]
}
```

---

## 3. Batch Grades & Class Report

### `GET /api/core/assignments/<assignment_id>/grades/`
Retrieve all AI-graded submissions for a specific assignment.
Useful for displaying the grading results after a batch grading session.

**Response `200`:**
```json
{
  "grades": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Jane Smith",
      "student_email": "jane@school.edu",
      "score": 82.0,
      "feedback": "Strong on joins, weak on indexing.",
      "is_late": false,
      "submitted_at": "2026-06-14T20:00:00Z",
      "grading_details": [
        {
          "student_name": "Jane Smith",
          "question_id": 1,
          "marks": 18.0,
          "max_marks": 20.0,
          "feedback": "Correctly identified 1NF and 2NF."
        }
      ]
    }
  ]
}
```

---

### `POST /api/core/assignments/<assignment_id>/report/`
Generate a downloadable PDF class performance report for the given assignment.

**Request Body (optional):**
If `grades_data` is omitted, the server automatically pulls grading data from the DB.
```json
{
  "grades_data": {
    "grades": [
      {
        "student_name": "Jane Smith",
        "marks": 82.0,
        "max_marks": 100.0,
        "feedback": "Strong on joins."
      }
    ],
    "total_marks": 82.0,
    "max_total_marks": 100.0,
    "overall_feedback": "Class performed above average.",
    "class_average": 74.5
  }
}
```

**Response `200`:**
```json
{
  "filename": "Class_Report_Databases_Mid_Term.pdf",
  "mime_type": "application/pdf",
  "file_base64": "JVBERi0xLjQK..."
}
```

> **Frontend note:** Decode the `file_base64` string and offer it as a blob download using:
> ```js
> const bytes = atob(file_base64);
> const blob = new Blob([bytes], { type: 'application/pdf' });
> const url = URL.createObjectURL(blob);
> ```

**Response `404`:** `{ "error": "No grading data found for this assignment" }`

---

## 4. Google Classroom Integration

### `GET /api/core/classroom/courses/`
List all Google Classroom courses the teacher currently manages.

> **Prerequisite:** Teacher must have authorized Google Classroom OAuth and stored their tokens in the database.

**Response `200`:**
```json
{
  "courses": [
    {
      "id": "google_course_id_string",
      "name": "Computer Science 101",
      "description": "Introduction to CS"
    }
  ]
}
```

**Response `500` (no auth):** `{ "error": "User has not authorized Google Classroom" }`

---

### `GET /api/core/classroom/courses/<course_id>/coursework/<coursework_id>/submissions/`
List all student submission metadata for a Google Classroom assignment.

**URL Parameters:**
- `course_id` — Google Classroom course ID (from `list_courses`)
- `coursework_id` — Google Classroom coursework/assignment ID

**Response `200`:**
```json
{
  "submissions": [
    {
      "id": "google_submission_id",
      "userId": "google_user_id",
      "studentName": "John Doe",
      "state": "TURNED_IN",
      "assignedGrade": null,
      "hasAttachments": true
    }
  ]
}
```

> **Frontend note:** Use `hasAttachments: true` to show an "Analyze Submission" button. Use `state` values: `TURNED_IN`, `RETURNED`, `CREATED`, `RECLAIMED_BY_STUDENT`.

---

### `GET /api/core/classroom/courses/<course_id>/coursework/<coursework_id>/submissions/<submission_id>/content/`
Extract and return the full plain-text content of a student's submission attachments (Google Docs, Drive PDFs, DOCX).

> **Use case:** Call this before sending data to the AI grading agent so the LLM has actual student work to evaluate.

**Response `200`:**
```json
{
  "submission_id": "google_submission_id",
  "content": "--- Attachment: Essay.docx ---\nNormalization is the process of...\n\n--- Attachment: Diagram.pdf ---\n[Could not extract text from PDF: Diagram.pdf]"
}
```

> **Frontend note:** Pass `content` as `grading_instructions` or alongside student submission data into the chat agent's grading endpoint.

---

### `POST /api/core/classroom/courses/<course_id>/coursework/<coursework_id>/submissions/<submission_id>/grade/`
Push a grade back to Google Classroom for a specific student submission.
This releases the grade to the student in their Google Classroom gradebook.

**Request Body:**
```json
{
  "assigned_grade": 85.0,
  "draft_grade": 85.0
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `assigned_grade` | `float` | ✅ Yes | Grade released to the student |
| `draft_grade` | `float` | ❌ Optional | Draft grade (teacher-only view) |

**Response `200`:**
```json
{
  "message": "Grade synced to Google Classroom",
  "result": {
    "submission_id": "google_submission_id",
    "assignedGrade": 85.0,
    "draftGrade": 85.0,
    "state": "RETURNED"
  }
}
```

**Response `400`:** `{ "error": "assigned_grade is required" }`

---

## Error Reference

| HTTP Status | Meaning |
|---|---|
| `401` | Missing/invalid token, or user role is not `teacher` |
| `400` | Missing required body fields |
| `404` | Record not found |
| `500` | Server/Google API error (check `error` field for details) |

---

## Typical Grading Workflow (for reference)

```
1. GET /classroom/courses/                          → pick a course
2. GET /classroom/courses/<id>/coursework/<cw_id>/submissions/  → list students
3. GET /classroom/courses/.../submissions/<s_id>/content/       → extract text per student
4. POST /api/chat/ with grade_test=true, student submissions[]  → AI grades them all
5. GET /assignments/<id>/grades/                    → review AI grades in local DB
6. POST /assignments/<id>/report/                  → download PDF class report
7. POST /classroom/.../grade/ (per student)        → sync grades back to Classroom
```
