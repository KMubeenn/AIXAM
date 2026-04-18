from django.urls import path
from apps.core.views import (
    get_flashcard_sets,get_flashcard_set_detail,delete_flashcard_set_view,
    get_quizzes,get_quiz_detail,delete_quiz_view,
    get_submissions,get_submission_detail,
    get_performance,
    get_materials,
    get_assignments,get_assignment_detail,delete_assignment_view,get_assignment_submissions
)

urlpatterns = [
    # Flashcards
    path('flashcards/',get_flashcard_sets,name='flashcard_sets'),
    path('flashcards/<uuid:set_id>/',get_flashcard_set_detail,name='flashcard_set_detail'),
    path('flashcards/<uuid:set_id>/delete/',delete_flashcard_set_view,name='delete_flashcard_set'),

    # Quizzes (mock tests + MCQ)
    path('quizzes/',get_quizzes,name='quizzes'),
    path('quizzes/<uuid:quiz_id>/',get_quiz_detail,name='quiz_detail'),
    path('quizzes/<uuid:quiz_id>/delete/',delete_quiz_view,name='delete_quiz'),

    # Submissions
    path('submissions/',get_submissions,name='submissions'),
    path('submissions/<uuid:submission_id>/',get_submission_detail,name='submission_detail'),

    # Performance
    path('performance/',get_performance,name='performance'),

    # Study Materials
    path('materials/',get_materials,name='materials'),

    # Teacher Assignments
    path('assignments/',get_assignments,name='assignments'),
    path('assignments/<uuid:assignment_id>/',get_assignment_detail,name='assignment_detail'),
    path('assignments/<uuid:assignment_id>/delete/',delete_assignment_view,name='delete_assignment'),
    path('assignments/<uuid:assignment_id>/submissions/',get_assignment_submissions,name='assignment_submissions'),
]
