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
    def save_study_material(user_id,title,file,file_type,processed_content=''):
        return StudyMaterial.objects.create(
            title=title,
            file=file,
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
    # SUBMISSIONS & GRADING
    # ──────────────────────────────────────────────

    @staticmethod
    @sync_to_async
    def save_submission(student_id,quiz_id,score,feedback=''):
        return Submission.objects.create(
            student_id=student_id,
            quiz_id=quiz_id,
            score=score,
            feedback=feedback
        )

    @staticmethod
    @sync_to_async
    def get_user_submissions(user_id):
        submissions=list(
            Submission.objects.filter(student_id=user_id)
            .select_related('quiz')
        )
        return [{
            'id':str(s.id),
            'quiz_title':s.quiz.title if s.quiz else 'N/A',
            'quiz_id':str(s.quiz.id) if s.quiz else None,
            'score':s.score,
            'feedback':s.feedback,
            'is_late':s.is_late,
            'submitted_at':s.submitted_at.isoformat()
        } for s in submissions]

    @staticmethod
    @sync_to_async
    def get_submission(submission_id):
        s=Submission.objects.select_related('quiz').get(id=submission_id)
        return {
            'id':str(s.id),
            'quiz_title':s.quiz.title if s.quiz else 'N/A',
            'quiz_id':str(s.quiz.id) if s.quiz else None,
            'score':s.score,
            'feedback':s.feedback,
            'is_late':s.is_late,
            'submitted_at':s.submitted_at.isoformat()
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
