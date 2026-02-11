# Core Models Reference

This document describes each model in `apps/core/models.py` and its role within AIXAM.

---

## StudyMaterial

| Field               | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `title`             | Name of the uploaded material                               |
| `file`              | The uploaded document (PDF/PPTX/DOCX)                       |
| `file_type`         | Format of the uploaded file                                 |
| `uploaded_by`       | The user (student or teacher) who uploaded it               |
| `processed_content` | Extracted raw text from the file, used by AI for generation |
| `summary`           | AI-generated summary of the material                        |

**Purpose**: The entry point for content in AIXAM. Students upload study materials which are then processed by the AI to generate flashcards and mock tests. Teachers can also upload content to create quizzes and assignments.

---

## FlashcardSet

| Field            | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `study_material` | _(Nullable)_ Link to the source file, if generated from one |
| `created_by`     | The student who created/requested the flashcard set         |
| `title`          | Name of the set (e.g., "Chapter 5 - Photosynthesis")        |
| `source_type`    | How the set was generated: `file`, `topic`, or `text`       |
| `topic`          | Topic name if `source_type='topic'`                         |
| `source_text`    | Pasted text if `source_type='text'`                         |

**Purpose**: Groups flashcards together. Students can generate flashcards from three sources:

1. **File** — from an uploaded `StudyMaterial`
2. **Topic** — by providing a topic name (e.g., "Quantum Mechanics")
3. **Text** — by pasting a summary or notes directly

---

## Flashcard

| Field           | Purpose                      |
| --------------- | ---------------------------- |
| `flashcard_set` | The set this card belongs to |
| `front`         | The question side            |
| `back`          | The answer side              |

**Purpose**: A single Q&A study unit. AI generates these from the source content provided in the parent `FlashcardSet`.

---

## Quiz

| Field                | Purpose                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `title`              | Name of the quiz/test                                            |
| `description`        | Optional description or instructions                             |
| `quiz_type`          | `mock` (student practice) or `assignment_quiz` (teacher-created) |
| `study_material`     | _(Nullable)_ Source material the quiz was generated from         |
| `created_by`         | Teacher or system that created the quiz                          |
| `time_limit_minutes` | Duration allowed for completion                                  |

**Purpose**: Represents a mock test or teacher-assigned quiz. Contains multiple `Question` entries. Supports both AI-generated mock tests for students and manually created quizzes by teachers.

---

## Question

| Field           | Purpose                                |
| --------------- | -------------------------------------- |
| `quiz`          | The quiz this question belongs to      |
| `text`          | The question text                      |
| `question_type` | `mcq` (auto-gradable) or `descriptive` |
| `points`        | Score weight for this question         |

**Purpose**: A single question within a quiz. MCQ questions have associated `Choice` entries. Descriptive questions are open-ended.

---

## Choice

| Field        | Purpose                                 |
| ------------ | --------------------------------------- |
| `question`   | The MCQ question this option belongs to |
| `text`       | The option text                         |
| `is_correct` | Whether this is the correct answer      |

**Purpose**: Options for MCQ questions. Multiple choices per question, exactly one should have `is_correct=True` for proper auto-grading.

---

## Assignment

| Field         | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `title`       | Assignment name                                           |
| `description` | Instructions and details                                  |
| `course_id`   | Google Classroom Course ID for integration                |
| `deadline`    | Submission cutoff — late submissions are auto-scored zero |
| `created_by`  | The teacher who created it                                |

**Purpose**: A teacher-created assignment linked to Google Classroom. The `deadline` field is critical — the system uses it to automatically mark late submissions as zero (SRS 3.5).

---

## Submission

| Field          | Purpose                                        |
| -------------- | ---------------------------------------------- |
| `student`      | The student who submitted                      |
| `assignment`   | _(Nullable)_ The assignment being submitted to |
| `quiz`         | _(Nullable)_ The quiz being submitted to       |
| `submitted_at` | Timestamp of submission                        |
| `score`        | Grade (auto or manual)                         |
| `feedback`     | Teacher or AI feedback                         |
| `is_late`      | Whether the submission was past deadline       |

**Purpose**: Records a student's attempt at an assignment or quiz. A constraint ensures exactly one of `assignment`/`quiz` is set (never both, never neither). Late assignment submissions are automatically scored zero.

---

## StudentPerformance

| Field            | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `student`        | The student being tracked                   |
| `topic`          | Subject/topic name                          |
| `average_score`  | Mean score across attempts                  |
| `tests_taken`    | Number of assessments completed             |
| `strength_score` | 0–100 mastery score for analytics dashboard |

**Purpose**: Powers the personalized analytics dashboard (SRS 3.6). Aggregates student performance per topic to identify strengths and weaknesses and provide improvement recommendations.
