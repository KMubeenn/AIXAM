from apps.core.models import (
    StudyMaterial,FlashcardSet,Flashcard,
    Quiz,Question,Choice,
    Submission,StudentPerformance
)
from asgiref.sync import sync_to_async
from django.db import transaction


class CoreService:

    # ──────────────────────────────────────────────
    # STUDY MATERIALS
    # ──────────────────────────────────────────────

    @staticmethod
    @sync_to_async
    def save_study_material(user_id,title,file_type,processed_content=''):
        return StudyMaterial.objects.create(
            title=title,
            file_type=file_type,
            uploaded_by_id=user_id,
            processed_content=processed_content
        )

    @staticmethod
    @sync_to_async
    def get_user_materials(user_id):
        materials=list(StudyMaterial.objects.filter(uploaded_by_id=user_id))
        return [{
            'id':str(m.id),
            'title':m.title,
            'file_type':m.file_type,
            'created_at':m.created_at.isoformat()
        } for m in materials]

    @staticmethod
    @sync_to_async
    def get_material_detail(material_id):
        try:
            m = StudyMaterial.objects.get(id=material_id)
            return {
                'id': str(m.id),
                'title': m.title,
                'file_type': m.file_type,
                'content': m.processed_content,
                'created_at': m.created_at.isoformat()
            }
        except StudyMaterial.DoesNotExist:
            raise ValueError("Material not found")

    # ──────────────────────────────────────────────
    # FLASHCARDS
    # ──────────────────────────────────────────────

    @staticmethod
    @sync_to_async
    def save_flashcard_set(user_id,cards,title='Flashcard Set',source_type='topic',topic='',study_material_id=None):
        with transaction.atomic():
            flashcard_set=FlashcardSet.objects.create(
                created_by_id=user_id,
                title=title,
                source_type=source_type,
                topic=topic,
                study_material_id=study_material_id
            )
            flashcard_objects=[]
            for card in cards:
                flashcard_objects.append(Flashcard(
                    flashcard_set=flashcard_set,
                    front=card.get('question',''),
                    back=card.get('answer','')
                ))
            Flashcard.objects.bulk_create(flashcard_objects)
            return str(flashcard_set.id)

    @staticmethod
    @sync_to_async
    def get_user_flashcard_sets(user_id):
        sets=list(
            FlashcardSet.objects.filter(created_by_id=user_id)
            .prefetch_related('cards')
        )
        return [{
            'id':str(s.id),
            'title':s.title,
            'source_type':s.source_type,
            'topic':s.topic,
            'card_count':s.cards.count(),
            'created_at':s.created_at.isoformat()
        } for s in sets]

    @staticmethod
    @sync_to_async
    def get_flashcard_set(set_id):
        s=FlashcardSet.objects.prefetch_related('cards').get(id=set_id)
        return {
            'id':str(s.id),
            'title':s.title,
            'source_type':s.source_type,
            'topic':s.topic,
            'created_at':s.created_at.isoformat(),
            'cards':[{
                'id':str(c.id),
                'front':c.front,
                'back':c.back
            } for c in s.cards.all()]
        }

    @staticmethod
    @sync_to_async
    def delete_flashcard_set(set_id,user_id):
        deleted,_=FlashcardSet.objects.filter(id=set_id,created_by_id=user_id).delete()
        return deleted > 0

    # ──────────────────────────────────────────────
    # QUIZZES (Mock Tests + MCQ Tests)
    # ──────────────────────────────────────────────

    @staticmethod
    @sync_to_async
    def save_mock_test(user_id,questions,title='Mock Test',study_material_id=None):
        with transaction.atomic():
            quiz=Quiz.objects.create(
                title=title,
                quiz_type='mock',
                created_by_id=user_id,
                study_material_id=study_material_id
            )
            question_objects=[]
            for q in questions:
                question_objects.append(Question(
                    quiz=quiz,
                    text=q.get('question',''),
                    question_type='descriptive',
                    points=q.get('points',1)
                ))
            Question.objects.bulk_create(question_objects)
            return str(quiz.id)

    @staticmethod
    @sync_to_async
    def save_mcq_test(user_id,questions,title='MCQ Test',study_material_id=None):
        with transaction.atomic():
            quiz=Quiz.objects.create(
                title=title,
                quiz_type='mock',
                created_by_id=user_id,
                study_material_id=study_material_id
            )
            for q in questions:
                question=Question.objects.create(
                    quiz=quiz,
                    text=q.get('question',''),
                    question_type='mcq',
                    points=q.get('points',1)
                )
                correct_answer=q.get('answer','')
                options=q.get('options',{})
                for key,text in options.items():
                    Choice.objects.create(
                        question=question,
                        text=text,
                        is_correct=(key==correct_answer)
                    )
            return str(quiz.id)

    @staticmethod
    @sync_to_async
    def get_user_quizzes(user_id):
        quizzes=list(
            Quiz.objects.filter(created_by_id=user_id)
            .prefetch_related('questions')
        )
        return [{
            'id':str(q.id),
            'title':q.title,
            'quiz_type':q.quiz_type,
            'question_count':q.questions.count(),
            'time_limit_minutes':q.time_limit_minutes,
            'created_at':q.created_at.isoformat()
        } for q in quizzes]

    @staticmethod
    @sync_to_async
    def get_quiz(quiz_id):
        quiz=Quiz.objects.prefetch_related('questions__choices').get(id=quiz_id)
        questions=[]
        for q in quiz.questions.all():
            question_data={
                'id':str(q.id),
                'text':q.text,
                'question_type':q.question_type,
                'points':q.points
            }
            if q.question_type=='mcq':
                question_data['choices']=[{
                    'id':str(c.id),
                    'text':c.text,
                    'is_correct':c.is_correct
                } for c in q.choices.all()]
            questions.append(question_data)

        return {
            'id':str(quiz.id),
            'title':quiz.title,
            'quiz_type':quiz.quiz_type,
            'time_limit_minutes':quiz.time_limit_minutes,
            'created_at':quiz.created_at.isoformat(),
            'questions':questions
        }

    @staticmethod
    @sync_to_async
    def delete_quiz(quiz_id,user_id):
        deleted,_=Quiz.objects.filter(id=quiz_id,created_by_id=user_id).delete()
        return deleted > 0

    # ──────────────────────────────────────────────
    @staticmethod
    @sync_to_async
    def save_submission(student_id, quiz_id, score, feedback, grading_details=None):
        return Submission.objects.create(
            student_id=student_id,
            quiz_id=quiz_id,
            score=score,
            feedback=feedback,
            grading_details=grading_details
        )

    @staticmethod
    @sync_to_async
    def get_user_submissions(user_id):
        submissions = list(
            Submission.objects.filter(student_id=user_id)
            .select_related('quiz')
            .prefetch_related('quiz__questions')
        )
        return [{
            'id': str(s.id),
            'quiz_title': s.quiz.title if s.quiz else 'N/A',
            'quiz_id': str(s.quiz.id) if s.quiz else None,
            'question_count': s.quiz.questions.count() if s.quiz else 0,
            'score': s.score,
            'submitted_at': s.submitted_at.isoformat(),
        } for s in submissions]

    @staticmethod
    @sync_to_async
    def get_submission(submission_id):
        s = Submission.objects.select_related('quiz').get(id=submission_id)
        return {
            'id': str(s.id),
            'quiz_title': s.quiz.title if s.quiz else 'N/A',
            'quiz_id': str(s.quiz.id) if s.quiz else None,
            'score': s.score,
            'feedback': s.feedback,
            'is_late': s.is_late,
            'submitted_at': s.submitted_at.isoformat(),
            'grading_details': s.grading_details or [],
        }

    # ──────────────────────────────────────────────
    # STUDENT PERFORMANCE
    # ──────────────────────────────────────────────

    @staticmethod
    @sync_to_async
    def update_student_performance(student_id,topic,score):
        perf,created=StudentPerformance.objects.get_or_create(
            student_id=student_id,
            topic=topic,
            defaults={'average_score':score,'tests_taken':1,'strength_score':score}
        )
        if not created:
            total=perf.average_score*perf.tests_taken
            perf.tests_taken+=1
            perf.average_score=(total+score)/perf.tests_taken
            perf.strength_score=perf.average_score
            perf.save(update_fields=['average_score','tests_taken','strength_score','last_updated'])
        return perf

    @staticmethod
    @sync_to_async
    def get_student_performance(user_id):
        perfs=list(StudentPerformance.objects.filter(student_id=user_id))
        return [{
            'id':str(p.id),
            'topic':p.topic,
            'average_score':p.average_score,
            'tests_taken':p.tests_taken,
            'strength_score':p.strength_score,
            'last_updated':p.last_updated.isoformat()
        } for p in perfs]

    @staticmethod
    @sync_to_async
    def delete_submission(submission_id, student_id):
        deleted, _ = Submission.objects.filter(id=submission_id, student_id=student_id).delete()
        return deleted > 0

    @staticmethod
    @sync_to_async
    def delete_study_material(material_id, user_id):
        deleted, _ = StudyMaterial.objects.filter(id=material_id, uploaded_by_id=user_id).delete()
        return deleted > 0

    # ──────────────────────────────────────────────
    # TEACHER AGENT SPECIFIC SERVICES
    # ──────────────────────────────────────────────

    @staticmethod
    @sync_to_async
    def save_assignment(user_id, title, description, questions, deadline=None, total_marks=100.0, study_material_id=None, course_id=None):
        from apps.core.models import Assignment, Quiz, Question
        
        quiz = Quiz.objects.create(
            title=f"Questions for {title}",
            description="Auto-generated backend for assignment",
            quiz_type='assignment_quiz',
            study_material_id=study_material_id,
            created_by_id=user_id
        )
        
        q_objs = []
        for q in questions:
            q_text = f"{q.get('question', '')} \n\nRUBRIC: {q.get('rubric', '')}"
            marks = q.get('marks', 1.0)
            q_objs.append(Question(
                quiz=quiz,
                text=q_text,
                question_type='descriptive',
                points=marks
            ))
        if q_objs:
            Question.objects.bulk_create(q_objs)
            
        assignment = Assignment.objects.create(
            title=title,
            description=description,
            created_by_id=user_id,
            deadline=deadline,
            total_marks=total_marks,
            study_material_id=study_material_id,
            course_id=course_id,
            quiz=quiz
        )
        return str(assignment.id)

    @staticmethod
    @sync_to_async
    def save_teacher_quiz(user_id, title, questions, study_material_id=None):
        from apps.core.models import Quiz, Question, Choice
        
        quiz = Quiz.objects.create(
            title=title,
            quiz_type='assignment_quiz',
            study_material_id=study_material_id,
            created_by_id=user_id
        )
        
        for q in questions:
            q_obj = Question.objects.create(
                quiz=quiz,
                text=f"{q.get('question', '')} \n\nEXPLANATION: {q.get('explanation', '')}",
                question_type='mcq',
                points=q.get('points', 1)
            )
            choices_to_create = []
            correct_key = q.get('answer', '').upper()
            options = q.get('options', {})
            for key, val in options.items():
                is_correct = (key.upper() == correct_key)
                choices_to_create.append(Choice(
                    question=q_obj,
                    text=f"{key}) {val}",
                    is_correct=is_correct
                ))
            if choices_to_create:
                Choice.objects.bulk_create(choices_to_create)
                
        return str(quiz.id)

    @staticmethod
    @sync_to_async
    def save_batch_grades(teacher_id, assignment_id, grades_data):
        from apps.core.models import Submission, Assignment, StudentPerformance
        from apps.users.models import User
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except:
            return None
            
        grades = grades_data.get('grades', [])
        
        student_scores = {}
        student_feedback = {}
        for g in grades:
            sid = g.get('student_id')
            if not sid:
                continue
            student_scores[sid] = student_scores.get(sid, 0) + g.get('marks', 0)
            fb = g.get('feedback', '')
            if fb:
                student_feedback[sid] = student_feedback.get(sid, '') + "\n" + fb
                
        for sid, total_score in student_scores.items():
            try:
                student = User.objects.get(id=sid)
                Submission.objects.update_or_create(
                    student=student,
                    assignment=assignment,
                    defaults={
                        'score': total_score,
                        'feedback': student_feedback.get(sid, '').strip(),
                        'quiz': assignment.quiz
                    }
                )
                
                # Update generic performance
                perf, created = StudentPerformance.objects.get_or_create(
                    student=student,
                    topic=assignment.title,
                    defaults={'average_score': total_score, 'tests_taken': 1, 'strength_score': total_score}
                )
                if not created:
                    total = perf.average_score * perf.tests_taken
                    perf.tests_taken += 1
                    perf.average_score = (total + total_score) / perf.tests_taken
                    perf.strength_score = perf.average_score
                    perf.save(update_fields=['average_score', 'tests_taken', 'strength_score', 'last_updated'])
            except:
                pass
                
        return str(assignment_id)

    @staticmethod
    @sync_to_async
    def get_teacher_assignments(user_id):
        from apps.core.models import Assignment
        assignments = list(Assignment.objects.filter(created_by_id=user_id).order_by('-created_at')[:50])
        return [{
            "id": str(a.id),
            "title": a.title,
            "course_id": a.course_id,
            "deadline": a.deadline.isoformat() if a.deadline else None,
            "total_marks": a.total_marks,
            "created_at": a.created_at.isoformat()
        } for a in assignments]

    @staticmethod
    @sync_to_async
    def get_teacher_quizzes(user_id):
        """Returns all teacher-created quizzes (assignment_quiz type)."""
        from apps.core.models import Quiz
        quizzes = list(
            Quiz.objects.filter(created_by_id=user_id, quiz_type='assignment_quiz')
            .prefetch_related('questions')
            .order_by('-created_at')[:50]
        )
        return [{
            'id': str(q.id),
            'title': q.title,
            'question_count': q.questions.count(),
            'created_at': q.created_at.isoformat(),
        } for q in quizzes]

    @staticmethod
    @sync_to_async
    def get_batch_grades_for_assignment(assignment_id):
        """Returns all submissions and their grading details for a given assignment."""
        from apps.core.models import Submission
        submissions = list(
            Submission.objects.filter(assignment_id=assignment_id)
            .select_related('student')
            .order_by('-submitted_at')
        )
        return [{
            'id': str(s.id),
            'student_id': str(s.student.id),
            'student_name': f"{s.student.first_name} {s.student.last_name}".strip() or s.student.username,
            'student_email': s.student.email,
            'score': s.score,
            'feedback': s.feedback,
            'is_late': s.is_late,
            'submitted_at': s.submitted_at.isoformat(),
            'grading_details': s.grading_details or [],
        } for s in submissions]
