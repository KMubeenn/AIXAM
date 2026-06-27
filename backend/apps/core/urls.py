from django.urls import path
from apps.core.views import (
    # Student — Flashcards
    get_flashcard_sets, get_flashcard_set_detail, delete_flashcard_set_view,
    # Student — Quizzes
    get_quizzes, get_quiz_detail, delete_quiz_view,
    # Student — Submissions
    get_submissions, get_submission_detail, delete_submission_view,
    # Student — Performance
    get_student_performance_view,
    # Student — Study Materials
    get_materials, get_material_detail, delete_material_view,
    # Teacher — Assignments
    get_assignments, get_assignment_detail, delete_assignment_view, get_assignment_submissions,
    # Teacher — Quizzes
    get_teacher_quizzes,
    # Teacher — Google Classroom
    list_google_courses_view, list_google_submissions_view,
    fetch_submission_content_view, patch_grade_view, list_google_coursework_view,
    # Teacher — Batch Grades & Report
    get_batch_grades_view, generate_class_report_view, grade_submission_view, post_report_to_classroom_view,
    post_assignment_to_classroom_view,
    post_quiz_to_classroom_view,
    # Teacher — Questions
    update_question_view,
    # Teacher — Analytics
    get_teacher_analytics_view,
)

urlpatterns = [
    # ── Student: Flashcards ────────────────────────────────────────────────
    path('flashcards/', get_flashcard_sets, name='flashcard_sets'),
    path('flashcards/<uuid:set_id>/', get_flashcard_set_detail, name='flashcard_set_detail'),
    path('flashcards/<uuid:set_id>/delete/', delete_flashcard_set_view, name='delete_flashcard_set'),

    # ── Student: Quizzes (Mock Tests + MCQ) ───────────────────────────────
    path('quizzes/', get_quizzes, name='quizzes'),
    path('quizzes/<uuid:quiz_id>/', get_quiz_detail, name='quiz_detail'),
    path('quizzes/<uuid:quiz_id>/delete/', delete_quiz_view, name='delete_quiz'),

    # ── Student: Submissions ───────────────────────────────────────────────
    path('submissions/', get_submissions, name='submissions'),
    path('submissions/<uuid:submission_id>/', get_submission_detail, name='submission_detail'),
    path('submissions/<uuid:submission_id>/delete/', delete_submission_view, name='delete_submission'),

    # ── Student: Performance ───────────────────────────────────────────────
    path('performance/', get_student_performance_view, name='performance'),

    # ── Student: Study Materials ───────────────────────────────────────────
    path('materials/', get_materials, name='materials'),
    path('materials/<str:material_id>/', get_material_detail, name='material_detail'),
    path('materials/<str:material_id>/delete/', delete_material_view, name='delete_material'),

    # ── Teacher: Assignments ───────────────────────────────────────────────
    path('assignments/', get_assignments, name='assignments'),
    path('assignments/<uuid:assignment_id>/', get_assignment_detail, name='assignment_detail'),
    path('assignments/<uuid:assignment_id>/delete/', delete_assignment_view, name='delete_assignment'),
    path('assignments/<uuid:assignment_id>/submissions/', get_assignment_submissions, name='assignment_submissions'),
    path('assignments/<uuid:assignment_id>/grades/', get_batch_grades_view, name='batch_grades'),
    path('assignments/<uuid:assignment_id>/report/', generate_class_report_view, name='class_report'),
    path('assignments/<uuid:assignment_id>/post-report/', post_report_to_classroom_view, name='post_classroom_report'),
    path('assignments/<uuid:assignment_id>/post-to-classroom/', post_assignment_to_classroom_view, name='post_assignment_to_classroom'),
    path('submissions/<uuid:submission_id>/grade/', grade_submission_view, name='grade_submission'),

    # ── Teacher: Questions ─────────────────────────────────────────────────
    path('questions/<uuid:question_id>/', update_question_view, name='update_question'),

    # ── Teacher: Quizzes ───────────────────────────────────────────────────
    path('teacher/quizzes/', get_teacher_quizzes, name='teacher_quizzes'),
    path('teacher/quizzes/<uuid:quiz_id>/post-to-classroom/', post_quiz_to_classroom_view, name='post_quiz_to_classroom'),

    # ── Teacher: Google Classroom ──────────────────────────────────────────
    path('classroom/courses/', list_google_courses_view, name='classroom_courses'),
    path('classroom/courses/<str:course_id>/coursework/', list_google_coursework_view, name='classroom_coursework'),
    path('classroom/courses/<str:course_id>/coursework/<str:coursework_id>/submissions/', list_google_submissions_view, name='classroom_submissions'),
    path('classroom/courses/<str:course_id>/coursework/<str:coursework_id>/submissions/<str:submission_id>/content/', fetch_submission_content_view, name='submission_content'),
    path('classroom/courses/<str:course_id>/coursework/<str:coursework_id>/submissions/<str:submission_id>/grade/', patch_grade_view, name='patch_grade'),

    # ── Teacher: Analytics ─────────────────────────────────────────────────
    path('teacher/analytics/', get_teacher_analytics_view, name='teacher_analytics'),
]
