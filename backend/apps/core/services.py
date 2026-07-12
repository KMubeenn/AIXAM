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
    def save_study_material(user_id,title,file_type,processed_content='',origin_session_id=None):
        return StudyMaterial.objects.create(
            title=title,
            file_type=file_type,
            uploaded_by_id=user_id,
            processed_content=processed_content,
            origin_session_id=origin_session_id
        )

    @staticmethod
    @sync_to_async
    def get_user_materials(user_id):
        materials=list(StudyMaterial.objects.filter(uploaded_by_id=user_id).select_related('origin_session'))
        return [{
            'id':str(m.id),
            'title':m.title,
            'file_type':m.file_type,
            'origin_session_id': str(m.origin_session.id) if m.origin_session else None,
            'origin_session_title': m.origin_session.title if m.origin_session else None,
            'created_at':m.created_at.isoformat()
        } for m in materials]

    @staticmethod
    @sync_to_async
    def get_material_detail(material_id):
        try:
            m = StudyMaterial.objects.select_related('origin_session').get(id=material_id)
            return {
                'id': str(m.id),
                'title': m.title,
                'file_type': m.file_type,
                'content': m.processed_content,
                'origin_session_id': str(m.origin_session.id) if m.origin_session else None,
                'origin_session_title': m.origin_session.title if m.origin_session else None,
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
            
        # Invalidate the insights cache automatically on any update
        from django.core.cache import cache
        cache_key = f'student_insights_{student_id}'
        cache.delete(cache_key)
        
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
    def save_assignment(user_id, title, description, questions, deadline=None, total_marks=100.0, study_material_id=None, course_id=None, objective='', submission_requirements=''):
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
            tasks_text = ''
            deliverables_text = ''
            tasks = q.get('tasks', [])
            deliverables = q.get('deliverables', [])
            if tasks:
                tasks_text = '\n\nTASKS:\n' + '\n'.join(f'- {t}' for t in tasks)
            if deliverables:
                deliverables_text = '\n\nDELIVERABLES:\n' + '\n'.join(f'- {d}' for d in deliverables)
            rubric_text = f'\n\nRUBRIC: {q.get("rubric", "")}' if q.get('rubric') else ''
            q_text = f"{q.get('question', '')}{tasks_text}{deliverables_text}{rubric_text}"
            marks = q.get('marks', 1.0)
            q_objs.append(Question(
                quiz=quiz,
                text=q_text,
                question_type='descriptive',
                points=marks
            ))
        if q_objs:
            Question.objects.bulk_create(q_objs)
        
        # Build a rich description that includes objective and submission requirements
        full_description = description
        if objective:
            full_description = f"Objective: {objective}\n\n{full_description}"
        if submission_requirements:
            full_description += f"\n\nSubmission Requirements:\n{submission_requirements}"
            
        assignment = Assignment.objects.create(
            title=title,
            description=full_description,
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
            q_type = q.get('question_type', 'mcq')
            q_obj = Question.objects.create(
                quiz=quiz,
                text=f"{q.get('question', '')} \n\nEXPLANATION: {q.get('explanation', '')}",
                question_type=q_type,
                points=q.get('points', 1)
            )
            
            if q_type == 'mcq':
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
    def save_batch_grades(teacher_id, assignment_id, grades_data, course_id=None, coursework_name=None):
        """
        Persist batch-graded submissions locally so that teacher analytics can aggregate them.

        Works for both:
        - Local AIXAM assignments (assignment_id is a valid UUID in the DB)
        - Google Classroom grading flows (assignment_id may be None/invalid; we use course_id +
          coursework_name to find or create a local Assignment mirror).

        For Classroom students, whose IDs are Google string identifiers rather than local UUIDs,
        we get-or-create a lightweight placeholder User (role='student') keyed by username
        'classroom_<student_id>' and store the human-readable name in grading_details.
        """
        import uuid as _uuid
        from apps.core.models import Submission, Assignment, StudentPerformance
        from apps.users.models import User

        # ── 1. Resolve the local Assignment ──────────────────────────────────
        assignment = None

        # Try direct UUID lookup first
        if assignment_id:
            try:
                _uuid.UUID(str(assignment_id))  # validate it's a UUID
                assignment = Assignment.objects.filter(id=assignment_id).first()
            except (ValueError, AttributeError):
                pass

        # Fall back to course_id + coursework_name lookup or creation
        if assignment is None:
            if course_id and coursework_name:
                assignment = Assignment.objects.filter(
                    created_by_id=teacher_id,
                    course_id=course_id,
                    title=coursework_name
                ).first()

                if assignment is None:
                    # Create a lightweight local mirror of the Classroom coursework
                    assignment = Assignment.objects.create(
                        title=coursework_name,
                        description=f"Google Classroom assignment: {coursework_name}",
                        created_by_id=teacher_id,
                        course_id=course_id,
                        total_marks=100.0,
                    )
            else:
                # Cannot resolve — nothing to save against
                return None

        grades = grades_data.get('grades', [])

        # ── 2. Aggregate per-student scores & feedback ────────────────────────
        student_scores = {}
        student_feedback = {}
        student_names = {}
        for g in grades:
            sid = str(g.get('student_id', '')).strip()
            if not sid:
                continue
            student_scores[sid] = student_scores.get(sid, 0) + g.get('marks', 0)
            fb = g.get('feedback', '')
            if fb:
                student_feedback[sid] = student_feedback.get(sid, '') + "\n" + fb
            # Capture human-readable name provided by the grading payload
            name = g.get('student_name', '')
            if name and sid not in student_names:
                student_names[sid] = name

        # ── 3. Persist one Submission row per student ─────────────────────────
        for sid, total_score in student_scores.items():
            try:
                # Detect whether sid is a local UUID or a Classroom string ID
                is_local_uuid = True
                try:
                    _uuid.UUID(sid)
                except ValueError:
                    is_local_uuid = False

                if is_local_uuid:
                    student = User.objects.filter(id=sid).first()
                    if student is None:
                        continue  # unknown local UUID — skip
                else:
                    # Classroom student — get or create a placeholder account
                    classroom_username = f"classroom_{sid}"
                    student, _ = User.objects.get_or_create(
                        username=classroom_username,
                        defaults={
                            'role': 'student',
                            'is_active': True,
                            'first_name': student_names.get(sid, 'Student'),
                        }
                    )

                # Normalise score as a percentage against total_marks
                total_marks = assignment.total_marks or 100.0
                score_pct = (total_score / total_marks * 100) if total_marks > 0 else total_score

                Submission.objects.update_or_create(
                    student=student,
                    assignment=assignment,
                    defaults={
                        'score': score_pct,
                        'feedback': student_feedback.get(sid, '').strip(),
                        'quiz': assignment.quiz,
                        'grading_details': {
                            'student_name': student_names.get(sid, student.first_name or student.username),
                            'classroom_student_id': sid if not is_local_uuid else None,
                            'raw_score': total_score,
                            'total_marks': total_marks,
                        },
                    }
                )

                # Update generic student performance
                perf, created = StudentPerformance.objects.get_or_create(
                    student=student,
                    topic=assignment.title,
                    defaults={'average_score': score_pct, 'tests_taken': 1, 'strength_score': score_pct}
                )
                if not created:
                    running_total = perf.average_score * perf.tests_taken
                    perf.tests_taken += 1
                    perf.average_score = (running_total + score_pct) / perf.tests_taken
                    perf.strength_score = perf.average_score
                    perf.save(update_fields=['average_score', 'tests_taken', 'strength_score', 'last_updated'])

            except Exception as e:
                print(f"[save_batch_grades] Failed to save grade for student {sid}: {e}")

        return str(assignment.id)

    @staticmethod
    @sync_to_async
    def get_teacher_assignments(user_id):
        from apps.core.models import Assignment, Submission
        assignments = list(Assignment.objects.filter(created_by_id=user_id, quiz__isnull=False).order_by('-created_at')[:50])
        result = []
        for a in assignments:
            subs = list(Submission.objects.filter(assignment_id=a.id))
            has_submissions = len(subs) > 0
            is_graded = any(s.score is not None for s in subs) if has_submissions else False
            result.append({
                "id": str(a.id),
                "title": a.title,
                "course_id": a.course_id,
                "deadline": a.deadline.isoformat() if a.deadline else None,
                "total_marks": a.total_marks,
                "created_at": a.created_at.isoformat(),
                "has_submissions": has_submissions,
                "is_graded": is_graded,
            })
        return result

    @staticmethod
    @sync_to_async
    def get_teacher_quizzes(user_id):
        """Returns all teacher-created quizzes (assignment_quiz type)."""
        from apps.core.models import Quiz
        quizzes = list(
            Quiz.objects.filter(created_by_id=user_id, quiz_type='assignment_quiz')
            .filter(assignments__isnull=True)
            .prefetch_related('questions')
            .order_by('-created_at')[:50]
        )
        return [{
            'id': str(q.id),
            'title': q.title,
            'question_count': q.questions.count(),
            'total_marks': sum(question.points for question in q.questions.all()),
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
        result = []
        for s in submissions:
            # Prefer the human-readable name stored at grading time (e.g. for Classroom students)
            details = s.grading_details or {}
            if isinstance(details, list):
                # Legacy format — grading_details was a list of per-question breakdowns
                stored_name = None
            else:
                stored_name = details.get('student_name')

            display_name = (
                stored_name
                or f"{s.student.first_name} {s.student.last_name}".strip()
                or s.student.username
            )
            result.append({
                'id': str(s.id),
                'student_id': str(s.student.id),
                'student_name': display_name,
                'student_email': s.student.email,
                'score': s.score,
                'feedback': s.feedback,
                'is_late': s.is_late,
                'submitted_at': s.submitted_at.isoformat(),
                'grading_details': s.grading_details or [],
            })
        return result
