from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.core.services import CoreService
from apps.users.jwt_utils import get_user_from_request
from asgiref.sync import sync_to_async

import json


# ──────────────────────────────────────────────
# TEACHER ANALYTICS
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_teacher_analytics_view(request):
    """
    Return real analytics data for the teacher dashboard:
    - Total assignments, quizzes, submissions
    - Class average score
    - Top and bottom performing topics (derived from StudentPerformance)
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        from apps.core.models import Assignment, Quiz, Submission, StudentPerformance
        from django.db.models import Avg, Count

        # Assignments & quizzes created by this teacher
        assignment_count = await sync_to_async(
            lambda: Assignment.objects.filter(created_by_id=user.id).count()
        )()
        quiz_count = await sync_to_async(
            lambda: Quiz.objects.filter(created_by_id=user.id, quiz_type='assignment_quiz').count()
        )()

        # Submissions for assignments this teacher created
        teacher_assignment_ids = await sync_to_async(
            lambda: list(Assignment.objects.filter(created_by_id=user.id).values_list('id', flat=True))
        )()

        submission_stats = await sync_to_async(
            lambda: Submission.objects.filter(
                assignment_id__in=teacher_assignment_ids
            ).aggregate(total=Count('id'), avg=Avg('score'))
        )()

        total_submissions = submission_stats.get('total') or 0
        class_avg = round(submission_stats.get('avg') or 0, 1)

        # Top topics from StudentPerformance for students in this class
        # Step 1: Get student IDs who submitted to this teacher's assignments
        student_ids = await sync_to_async(
            lambda: list(Submission.objects.filter(
                assignment_id__in=teacher_assignment_ids
            ).values_list('student_id', flat=True).distinct())
        )()

        # Step 2: Get performance only for those students
        if student_ids:
            topic_data = await sync_to_async(
                lambda: list(
                    StudentPerformance.objects.filter(student_id__in=student_ids)
                    .values('topic')
                    .annotate(avg_score=Avg('average_score'), count=Count('id'))
                    .order_by('-avg_score')[:10]
                )
            )()
        else:
            topic_data = []

        strongest = topic_data[0]['topic'] if topic_data else 'N/A'
        weakest = topic_data[-1]['topic'] if len(topic_data) > 1 else 'N/A'
        strongest_avg = round(topic_data[0]['avg_score'], 1) if topic_data else 0
        weakest_avg = round(topic_data[-1]['avg_score'], 1) if len(topic_data) > 1 else 0

        return JsonResponse({
            'assignment_count': assignment_count,
            'quiz_count': quiz_count,
            'total_submissions': total_submissions,
            'class_average': class_avg,
            'strongest_topic': strongest,
            'strongest_avg': strongest_avg,
            'weakest_topic': weakest,
            'weakest_avg': weakest_avg,
            'topics': [{
                'topic': t['topic'],
                'avg_score': round(t['avg_score'], 1),
                'student_count': t['count']
            } for t in topic_data]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(['GET'])
async def get_student_performance_view(request):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'student':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        data = await CoreService.get_student_performance(user.id)
        return JsonResponse({'performance': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ──────────────────────────────────────────────
# FLASHCARDS
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_flashcard_sets(request):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        sets=await CoreService.get_user_flashcard_sets(user.id)
        return JsonResponse({'flashcard_sets':sets})
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


@csrf_exempt
@require_http_methods(['GET'])
async def get_flashcard_set_detail(request,set_id):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        data=await CoreService.get_flashcard_set(set_id)
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


@csrf_exempt
@require_http_methods(['DELETE'])
async def delete_flashcard_set_view(request,set_id):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        deleted=await CoreService.delete_flashcard_set(set_id,user.id)
        if deleted:
            return JsonResponse({'message':'Flashcard set deleted'})
        return JsonResponse({'error':'Not found or not authorized'},status=404)
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


# ──────────────────────────────────────────────
# QUIZZES (Mock Tests + MCQ)
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_quizzes(request):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        quizzes=await CoreService.get_user_quizzes(user.id)
        return JsonResponse({'quizzes':quizzes})
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


@csrf_exempt
@require_http_methods(['GET'])
async def get_quiz_detail(request,quiz_id):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        data=await CoreService.get_quiz(quiz_id)
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


@csrf_exempt
@require_http_methods(['DELETE'])
async def delete_quiz_view(request,quiz_id):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        deleted=await CoreService.delete_quiz(quiz_id,user.id)
        if deleted:
            return JsonResponse({'message':'Quiz deleted'})
        return JsonResponse({'error':'Not found or not authorized'},status=404)
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


# ──────────────────────────────────────────────
# SUBMISSIONS
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
async def get_submissions(request):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)

        if request.method == 'POST':
            body = json.loads(request.body)
            quiz_id = body.get('quiz_id')
            score = body.get('score', 0)
            feedback = body.get('feedback', '')
            grading_details = body.get('grading_details', None)
            if not quiz_id:
                return JsonResponse({'error': 'quiz_id is required'}, status=400)
            submission = await CoreService.save_submission(
                student_id=user.id,
                quiz_id=quiz_id,
                score=score,
                feedback=feedback,
                grading_details=grading_details
            )
            return JsonResponse({'id': str(submission.id), 'message': 'Submission saved'}, status=201)

        submissions=await CoreService.get_user_submissions(user.id)
        return JsonResponse({'submissions':submissions})
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


@csrf_exempt
@require_http_methods(['GET'])
async def get_submission_detail(request,submission_id):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        data=await CoreService.get_submission(submission_id)
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


@csrf_exempt
@require_http_methods(['DELETE'])
async def delete_submission_view(request, submission_id):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        deleted = await CoreService.delete_submission(submission_id, user.id)
        if deleted:
            return JsonResponse({'message': 'Submission deleted'})
        return JsonResponse({'error': 'Not found or not authorized'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['DELETE'])
async def delete_material_view(request, material_id):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        deleted = await CoreService.delete_study_material(material_id, user.id)
        if deleted:
            return JsonResponse({'message': 'Study material deleted'})
        return JsonResponse({'error': 'Not found or not authorized'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ──────────────────────────────────────────────
# STUDENT PERFORMANCE
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_performance(request):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        performance=await CoreService.get_student_performance(user.id)
        return JsonResponse({'performance':performance})
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


# ──────────────────────────────────────────────
# STUDY MATERIALS
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_materials(request):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        materials=await CoreService.get_user_materials(user.id)
        return JsonResponse({'materials':materials})
    except Exception as e:
        return JsonResponse({'error':str(e)},status=500)


@csrf_exempt
@require_http_methods(['GET'])
async def get_material_detail(request, material_id):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
        data = await CoreService.get_material_detail(material_id)
        return JsonResponse(data)
    except ValueError as e:
        return JsonResponse({'error':str(e)},status=404)
    except Exception as e:
        if "is not a valid UUID" in str(e):
            return JsonResponse({'error': 'Invalid material ID format'},status=400)
        return JsonResponse({'error':str(e)},status=500)

# ──────────────────────────────────────────────
# TEACHER ASSIGNMENTS
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_assignments(request):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        assignments = await CoreService.get_teacher_assignments(user.id)
        return JsonResponse({'assignments': assignments})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(['GET'])
async def get_assignment_detail(request, assignment_id):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        from apps.core.models import Assignment
        try:
            assignment = await sync_to_async(Assignment.objects.get)(id=assignment_id, created_by_id=user.id)
        except Assignment.DoesNotExist:
            return JsonResponse({'error': 'Assignment not found'}, status=404)
            
        data = {
            "id": str(assignment.id),
            "title": assignment.title,
            "description": assignment.description,
            "course_id": assignment.course_id,
            "deadline": assignment.deadline.isoformat() if assignment.deadline else None,
            "total_marks": assignment.total_marks,
            "created_at": assignment.created_at.isoformat()
        }
        
        # If it has an attached quiz (for questions)
        quiz_id = await sync_to_async(getattr)(assignment, 'quiz_id', None)
        if quiz_id:
            quiz_detail = await CoreService.get_quiz(quiz_id)
            data["questions"] = quiz_detail.get('questions', [])
            
        return JsonResponse({'assignment': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(['DELETE'])
async def delete_assignment_view(request, assignment_id):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        from apps.core.models import Assignment
        deleted, _ = await sync_to_async(Assignment.objects.filter(id=assignment_id, created_by_id=user.id).delete)()
        if deleted:
            return JsonResponse({'message': 'Assignment deleted successfully'})
        return JsonResponse({'error': 'Assignment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(['GET'])
async def get_assignment_submissions(request, assignment_id):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        from apps.core.models import Submission, Assignment
        try:
            assignment = await sync_to_async(Assignment.objects.get)(id=assignment_id, created_by_id=user.id)
        except Assignment.DoesNotExist:
            return JsonResponse({'error': 'Assignment not found'}, status=404)
            
        submissions = await sync_to_async(list)(
            Submission.objects.filter(assignment=assignment).select_related('student')
        )
        
        data = [{
            "id": str(s.id),
            "student_id": str(s.student.id),
            "student_name": s.student.username,
            "score": s.score,
            "feedback": s.feedback,
            "is_late": s.is_late,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None
        } for s in submissions]
        
        return JsonResponse({'submissions': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ──────────────────────────────────────────────
# QUESTION UPDATE
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['PATCH'])
async def update_question_view(request, question_id):
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        body = json.loads(request.body)
        new_text = body.get('text')
        
        from apps.core.models import Question
        try:
            # Get the question and verify the teacher owns the parent quiz
            q = await sync_to_async(Question.objects.select_related('quiz').get)(id=question_id)
        except Question.DoesNotExist:
            return JsonResponse({'error': 'Question not found'}, status=404)
            
        if q.quiz.created_by_id != user.id:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
            
        if new_text is not None:
            q.text = new_text
            
        if 'points' in body:
            q.points = int(body.get('points', 1))
            
        await sync_to_async(q.save)()
        return JsonResponse({'message': 'Question updated successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ──────────────────────────────────────────────
# TEACHER QUIZZES
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_teacher_quizzes(request):
    """List all quizzes (assignment_quiz type) created by the teacher."""
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        quizzes = await CoreService.get_teacher_quizzes(user.id)
        return JsonResponse({'quizzes': quizzes})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ──────────────────────────────────────────────
# GOOGLE CLASSROOM INTEGRATION
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def list_google_courses_view(request):
    """List all Google Classroom courses managed by the authenticated teacher."""
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        from apps.chat.services.utilities.ClassroomService import ClassroomService, ClassroomServiceError
        courses = await sync_to_async(ClassroomService.list_courses)(user)
        return JsonResponse({'courses': courses})
    except ClassroomServiceError as e:
        return JsonResponse({'error': str(e), 'not_authorized': True}, status=403)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['GET'])
async def list_google_coursework_view(request, course_id):
    """List all coursework (assignments) in a specific Google Classroom course."""
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        from apps.chat.services.utilities.ClassroomService import ClassroomService, ClassroomServiceError
        coursework = await sync_to_async(ClassroomService.list_coursework)(user, course_id)
        return JsonResponse({'coursework': coursework})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['GET'])
async def list_google_submissions_view(request, course_id, coursework_id):
    """
    List all student submissions (metadata only) for a given Google Classroom assignment.
    Each submission includes hasAttachments flag so the frontend knows whether content can be fetched.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        from apps.chat.services.utilities.ClassroomService import ClassroomService, ClassroomServiceError
        submissions = await sync_to_async(ClassroomService.get_submissions)(user, course_id, coursework_id)
        return JsonResponse({'submissions': submissions})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['GET'])
async def fetch_submission_content_view(request, course_id, coursework_id, submission_id):
    """
    Extract and return the plain-text content of a single student's submission attachments.
    Supports Google Docs, PDFs, and DOCX files stored in Google Drive.
    Used to feed submission text into the AI batch grading flow.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        from apps.chat.services.utilities.ClassroomService import ClassroomService, ClassroomServiceError
        content = await sync_to_async(ClassroomService.fetch_submission_content)(
            user, course_id, coursework_id, submission_id
        )
        return JsonResponse({'submission_id': submission_id, 'content': content})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
async def patch_grade_view(request, course_id, coursework_id, submission_id):
    """
    Push a grade back to Google Classroom for a specific student submission.
    Body: { "assigned_grade": float, "draft_grade": float (optional) }
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        body = json.loads(request.body)
        assigned_grade = body.get('assigned_grade')
        draft_grade = body.get('draft_grade', None)
        if assigned_grade is None:
            return JsonResponse({'error': 'assigned_grade is required'}, status=400)
        from apps.chat.services.utilities.ClassroomService import ClassroomService, ClassroomServiceError
        result = await sync_to_async(ClassroomService.patch_grade)(
            user, course_id, coursework_id, submission_id,
            float(assigned_grade),
            float(draft_grade) if draft_grade is not None else None
        )
        return JsonResponse({'message': 'Grade synced to Google Classroom', 'result': result})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ──────────────────────────────────────────────
# BATCH GRADES & CLASS REPORT
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
async def get_batch_grades_view(request, assignment_id):
    """
    Return all student submissions and their AI-graded details for a specific assignment.
    Used for reviewing past batch grading results. Resolves Quiz ID to Assignment ID if needed.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        from apps.core.models import Assignment, Quiz
        real_assignment_id = assignment_id
        try:
            await sync_to_async(Assignment.objects.get)(id=assignment_id)
        except Assignment.DoesNotExist:
            try:
                quiz = await sync_to_async(Quiz.objects.get)(id=assignment_id)
                linked_assignment = await sync_to_async(
                    lambda: Assignment.objects.filter(quiz=quiz).first()
                )()
                if linked_assignment:
                    real_assignment_id = linked_assignment.id
                else:
                    return JsonResponse({'error': 'No assignment links to this quiz'}, status=404)
            except Quiz.DoesNotExist:
                return JsonResponse({'error': 'Invalid ID'}, status=404)

        grades = await CoreService.get_batch_grades_for_assignment(real_assignment_id)
        return JsonResponse({'grades': grades})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
async def generate_class_report_view(request, assignment_id):
    """
    Generate a downloadable PDF class performance report for a given assignment/quiz.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        body = json.loads(request.body) if request.body else {}
        grades_data = body.get('grades_data')

        # If grades_data is provided directly (e.g. from Classroom panel), skip DB lookup
        if grades_data:
            assignment_title = body.get('title', 'Class Report')
        else:
            from apps.core.models import Assignment, Quiz
            real_assignment_id = assignment_id
            try:
                asgn = await sync_to_async(Assignment.objects.get)(id=assignment_id)
                assignment_title = asgn.title
            except Assignment.DoesNotExist:
                try:
                    quiz = await sync_to_async(Quiz.objects.get)(id=assignment_id)
                    linked = await sync_to_async(lambda: Assignment.objects.filter(quiz=quiz).first())()
                    if linked:
                        real_assignment_id = linked.id
                        assignment_title = linked.title
                    else:
                        return JsonResponse({'error': 'No assignment linked to this quiz'}, status=404)
                except Quiz.DoesNotExist:
                    return JsonResponse({'error': 'Invalid assignment ID'}, status=404)

            submissions = await CoreService.get_batch_grades_for_assignment(real_assignment_id)
            if not submissions:
                return JsonResponse({'error': 'No grading data found for this assignment'}, status=404)

            total_score = sum(s.get('score') or 0 for s in submissions)
            grades_data = {
                'grades': [{'student_name': s['student_name'], 'marks': s.get('score') or 0, 'max_marks': 100, 'feedback': s.get('feedback', '')} for s in submissions],
                'total_marks': total_score,
                'max_total_marks': 100 * len(submissions),
                'overall_feedback': '',
                'class_average': total_score / len(submissions) if submissions else 0,
            }

        from apps.chat.services.utilities.ReportGenerator import generate_class_report_pdf
        report = await sync_to_async(generate_class_report_pdf)(assignment_title, grades_data)
        return JsonResponse(report)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_http_methods(['POST'])
async def grade_submission_view(request, submission_id):
    """
    Allow teacher to grade a local submission.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        body = json.loads(request.body)
        score = body.get('score')
        feedback = body.get('feedback', '')
        if score is None:
            return JsonResponse({'error': 'score is required'}, status=400)
        from apps.core.models import Submission
        submission = await sync_to_async(Submission.objects.select_related('assignment').get)(id=submission_id)
        if submission.assignment and submission.assignment.created_by_id != user.id:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        submission.score = float(score)
        submission.feedback = feedback
        await sync_to_async(submission.save)()
        return JsonResponse({'message': 'Submission graded successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
async def post_report_to_classroom_view(request, assignment_id):
    """
    Generate performance summary and post it as announcement in linked Google Classroom.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        from apps.core.models import Assignment
        assignment = await sync_to_async(Assignment.objects.get)(id=assignment_id)
        if assignment.created_by_id != user.id:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        if not assignment.course_id:
            return JsonResponse({'error': 'This assignment is not linked to a Google Classroom course'}, status=400)
        submissions = await CoreService.get_batch_grades_for_assignment(assignment_id)
        if not submissions:
            return JsonResponse({'error': 'No submissions found to generate report'}, status=400)
        total_score = sum(s.get('score') or 0 for s in submissions)
        class_avg = total_score / len(submissions) if submissions else 0
        text = f"Class performance report for Assignment: {assignment.title}\n"
        text += f"Class Average: {class_avg:.1f}%\n\n"
        text += "Student Grades:\n"
        for s in submissions:
            score = s.get('score')
            score_str = f"{score}%" if score is not None else "Not graded"
            text += f"- {s['student_name']}: {score_str}\n"
        from apps.chat.services.utilities.ClassroomService import ClassroomService
        await sync_to_async(ClassroomService.post_announcement)(user, assignment.course_id, text)
        return JsonResponse({'message': 'Report posted to Google Classroom successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ──────────────────────────────────────────────
# POST ASSIGNMENT TO CLASSROOM
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
async def post_assignment_to_classroom_view(request, assignment_id):
    """
    Post a saved AIXAM assignment to one or more Google Classroom courses.

    Body:
        {
            "course_ids": ["course_id_1", "course_id_2", ...]   // required
        }

    For each course_id, creates a new Classroom coursework (assignment) using
    the assignment's title, description, and total_marks as maxPoints.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        body = json.loads(request.body) if request.body else {}
        course_ids = body.get('course_ids', [])
        if not course_ids:
            return JsonResponse({'error': 'course_ids is required and must be a non-empty list'}, status=400)

        from apps.core.models import Assignment
        try:
            assignment = await sync_to_async(Assignment.objects.get)(id=assignment_id)
        except Assignment.DoesNotExist:
            return JsonResponse({'error': 'Assignment not found'}, status=404)

        if assignment.created_by_id != user.id:
            return JsonResponse({'error': 'Unauthorized'}, status=403)

        # Assignment questions are stored in description (as text), not in the Question model
        title = body.get('title') or assignment.title
        extra_desc = body.get('description', '')
        due_date_str = body.get('due_date')
        due_time_str = body.get('due_time')
        
        # Build the base description
        description = (extra_desc + '\n\n' if extra_desc else '') + (assignment.description or f"Assignment: {assignment.title}")

        # If this assignment is backed by a quiz, fetch the questions and append them
        quiz_id = getattr(assignment, 'quiz_id', None)
        if quiz_id:
            from apps.core.models import Question
            questions = await sync_to_async(
                lambda: list(Question.objects.filter(quiz_id=quiz_id).order_by('id'))
            )()
            if questions:
                description += "\n\n--- Questions ---\n\n"
                for i, q in enumerate(questions, 1):
                    # Strip the rubric part out of the text so students don't see it
                    question_text = q.text.split("\n\nRUBRIC:")[0].strip() if q.text else ""
                    description += f"{i}. {question_text}\n"
                    description += f"Points: {q.points}\n\n"

        max_points = float(body.get('max_points') or assignment.total_marks or 100)

        from apps.chat.services.utilities.ClassroomService import ClassroomService

        results = []
        errors = []
        for course_id in course_ids:
            try:
                result = await sync_to_async(ClassroomService.post_assignment)(
                    user, course_id, title, description, max_points, due_date_str, due_time_str
                )
                results.append({'course_id': course_id, 'coursework_id': result.get('id'), 'status': 'success'})
            except Exception as e:
                errors.append({'course_id': course_id, 'error': str(e)})

        return JsonResponse({
            'message': f'Posted to {len(results)} classroom(s).',
            'results': results,
            'errors': errors,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



# ──────────────────────────────────────────────
# POST QUIZ TO CLASSROOM
# ──────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
async def post_quiz_to_classroom_view(request, quiz_id):
    """
    Post a saved AIXAM teacher quiz to one or more Google Classroom courses as an assignment.
    Answer keys and explanations are stripped before posting.

    Body:
        {
            "course_ids": ["course_id_1", ...],   // required
            "title":       "Custom Title",          // optional override
            "description": "Extra instructions",    // optional override
            "max_points":  100                      // optional override
        }
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        body = json.loads(request.body) if request.body else {}
        course_ids = body.get('course_ids', [])
        if not course_ids:
            return JsonResponse({'error': 'course_ids is required and must be a non-empty list'}, status=400)

        from apps.core.models import Quiz, Question, Choice
        try:
            quiz = await sync_to_async(Quiz.objects.select_related('created_by').get)(id=quiz_id)
        except Quiz.DoesNotExist:
            return JsonResponse({'error': 'Quiz not found'}, status=404)

        if quiz.created_by_id != user.id:
            return JsonResponse({'error': 'Unauthorized'}, status=403)

        # Build a student-safe description from quiz questions (no answers/explanations)
        questions = await sync_to_async(
            lambda: list(Question.objects.filter(quiz=quiz).prefetch_related('choices').order_by('id'))
        )()

        title = body.get('title') or quiz.title
        extra_description = body.get('description', '')
        max_points = float(body.get('max_points', 100))
        due_date_str = body.get('due_date')
        due_time_str = body.get('due_time')

        description = extra_description + ('\n\n' if extra_description else '')
        description += f"Quiz: {quiz.title}\n\n"

        for idx, q in enumerate(questions, 1):
            # Strip out EXPLANATION and RUBRIC sections
            question_text = (q.text or '').split('\n\nEXPLANATION:')[0]
            question_text = question_text.split('\n\nRUBRIC:')[0].strip()
            
            description += f"Q{idx}. {question_text}\n"
            if q.points:
                description += f"   [{q.points} mark{'s' if q.points != 1 else ''}]\n"

            # Include choices but remove is_correct marking
            choices = await sync_to_async(lambda q=q: list(q.choices.all()))()
            if choices:
                for i, choice in enumerate(choices):
                    description += f"   {chr(65 + i)}) {choice.text}\n"
            description += "\n"

        from apps.chat.services.utilities.ClassroomService import ClassroomService

        results = []
        errors = []
        for course_id in course_ids:
            try:
                result = await sync_to_async(ClassroomService.post_assignment)(
                    user,
                    course_id,
                    title,
                    description.strip(),
                    max_points,
                    due_date_str,
                    due_time_str
                )
                results.append({'course_id': course_id, 'coursework_id': result.get('id'), 'status': 'success'})
            except Exception as e:
                errors.append({'course_id': course_id, 'error': str(e)})

        return JsonResponse({
            'message': f'Posted to {len(results)} classroom(s).',
            'results': results,
            'errors': errors,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
async def post_classroom_announcement_view(request, course_id):
    """
    Post an announcement to the Google Classroom course stream.
    Body: { "text": "Announcement content..." }
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        
        import json
        body = json.loads(request.body) if request.body else {}
        text = body.get('text', '')
        if not text:
            return JsonResponse({'error': 'Text is required'}, status=400)
            
        from apps.chat.services.utilities.ClassroomService import ClassroomService
        await sync_to_async(ClassroomService.post_announcement)(user, course_id, text)
        return JsonResponse({'message': 'Announcement posted successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

