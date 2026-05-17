"""
Core Domain Models for AIXAM.
Contains entities for Study Materials, Flashcards, Assessments,
Assignments, Submissions, and Student Performance.
"""
import uuid
from django.db import models
from django.db.models import Q
from django.conf import settings
from django.utils import timezone


class StudyMaterial(models.Model):
    """
    Uploaded study materials (PDF, PPTX, DOCX).
    processed_content stores the extracted text for AI generation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='study_materials/', blank=True, null=True)
    file_type = models.CharField(
        max_length=10,
        choices=[('pdf', 'PDF'), ('pptx', 'PPTX'), ('docx', 'DOCX')]
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='study_materials'
    )
    processed_content = models.TextField(blank=True, help_text="Extracted text from the file")
    summary = models.TextField(blank=True, help_text="AI generated summary")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_materials'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['uploaded_by', '-created_at']),
        ]

    def __str__(self):
        return self.title


class FlashcardSet(models.Model):
    """
    A collection of flashcards. Can be generated from:
    - An uploaded StudyMaterial (file)
    - A topic name provided by the student
    - Pasted text / summary provided by the student
    """
    SOURCE_CHOICES = [
        ('file', 'From File'),
        ('topic', 'From Topic'),
        ('text', 'From Pasted Text'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    study_material = models.ForeignKey(
        StudyMaterial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='flashcard_sets'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='flashcard_sets'
    )
    title = models.CharField(max_length=255)
    source_type = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='file')
    topic = models.CharField(max_length=255, blank=True, help_text="Topic name for topic-based generation")
    source_text = models.TextField(blank=True, help_text="Pasted text for text-based generation")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'flashcard_sets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_by', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_source_type_display()})"


class Flashcard(models.Model):
    """
    Single flashcard with front (question) and back (answer).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flashcard_set = models.ForeignKey(
        FlashcardSet,
        on_delete=models.CASCADE,
        related_name='cards'
    )
    front = models.TextField()
    back = models.TextField()

    class Meta:
        db_table = 'flashcards'

    def __str__(self):
        return f"Card {self.id} in {self.flashcard_set.title}"


class Quiz(models.Model):
    """
    Assessment entity (Mock Test or Teacher Quiz).
    """
    QUIZ_TYPE_CHOICES = [
        ('mock', 'Mock Test'),
        ('assignment_quiz', 'Assignment Quiz'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPE_CHOICES, default='mock')
    study_material = models.ForeignKey(
        StudyMaterial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quizzes'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_quizzes'
    )
    time_limit_minutes = models.PositiveIntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quizzes'
        verbose_name_plural = "Quizzes"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_by', '-created_at']),
        ]

    def __str__(self):
        return self.title


class Question(models.Model):
    """
    Question within a Quiz.
    """
    QUESTION_TYPE_CHOICES = [
        ('mcq', 'Multiple Choice'),
        ('descriptive', 'Descriptive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='mcq')
    points = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'questions'

    def __str__(self):
        return f"{self.quiz.title} - {self.text[:30]}"


class Choice(models.Model):
    """
    Options for MCQ questions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='choices'
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'choices'

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"


class Assignment(models.Model):
    """
    Classroom Assignment created by a teacher.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    course_id = models.CharField(max_length=100, blank=True, null=True, help_text="Google Classroom Course ID")
    deadline = models.DateTimeField(blank=True, null=True)
    total_marks = models.FloatField(default=100.0)
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments',
        help_text="Optional quiz attached to this assignment"
    )
    study_material = models.ForeignKey(
        StudyMaterial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments',
        help_text="Source material used to generate this assignment"
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['-deadline']
        indexes = [
            models.Index(fields=['deadline']),
            models.Index(fields=['created_by', '-created_at']),
        ]

    def __str__(self):
        return self.title


class Submission(models.Model):
    """
    Student submission for an assignment or quiz.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='submissions'
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='submissions'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    is_late = models.BooleanField(default=False)
    grading_details = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'submissions'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['student', '-submitted_at']),
        ]

    def save(self, *args, **kwargs):
        # Auto-mark zero if late (SRS 2.2)
        # Use timezone.now() since submitted_at isn't set until super().save()
        if self.assignment and timezone.now() > self.assignment.deadline:
            self.is_late = True
            self.score = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Submission by {self.student.username}"


class StudentPerformance(models.Model):
    """
    Tracks student performance across topics and assessments.
    Used for personalized analytics and recommendations.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='performance_metrics'
    )
    topic = models.CharField(max_length=200, db_index=True)
    average_score = models.FloatField(default=0.0)
    tests_taken = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    strength_score = models.FloatField(default=0.0, help_text="Calculated 0-100 score indicating mastery")

    class Meta:
        db_table = 'student_performance'
        constraints = [
            models.UniqueConstraint(fields=['student', 'topic'], name='unique_student_topic')
        ]
        ordering = ['student', '-strength_score']
        indexes = [
            models.Index(fields=['student', 'topic']),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.topic} ({self.strength_score})"
