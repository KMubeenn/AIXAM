from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.core.services import CoreService
from apps.users.jwt_utils import get_user_from_request
from asgiref.sync import sync_to_async

import json


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
    Used for reviewing past batch grading results.
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        grades = await CoreService.get_batch_grades_for_assignment(assignment_id)
        return JsonResponse({'grades': grades})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
async def generate_class_report_view(request, assignment_id):
    """
    Generate a downloadable PDF class performance report for a given assignment.
    Accepts optional pre-computed grades_data in the body; otherwise fetches from DB.
    Body (optional): {
        "grades_data": { ... BatchGradingResult ... }
    }
    Returns: { "filename": str, "mime_type": "application/pdf", "file_base64": str }
    """
    try:
        user = await sync_to_async(get_user_from_request)(request=request)
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        body = json.loads(request.body) if request.body else {}
        grades_data = body.get('grades_data')

        if not grades_data:
            # Build grades_data from DB submissions
            submissions = await CoreService.get_batch_grades_for_assignment(assignment_id)
            if not submissions:
                return JsonResponse({'error': 'No grading data found for this assignment'}, status=404)

            grades = []
            total_score = 0
            for s in submissions:
                score = s.get('score') or 0
                total_score += score
                grades.append({
                    'student_name': s['student_name'],
                    'marks': score,
                    'max_marks': 100,
                    'feedback': s.get('feedback', ''),
                })
            class_avg = total_score / len(submissions) if submissions else 0
            grades_data = {
                'grades': grades,
                'total_marks': total_score,
                'max_total_marks': 100 * len(submissions),
                'overall_feedback': '',
                'class_average': class_avg,
            }

        # Get assignment title for the report
        from apps.core.models import Assignment
        try:
            assignment = await sync_to_async(Assignment.objects.get)(id=assignment_id)
            assignment_title = assignment.title
        except Assignment.DoesNotExist:
            assignment_title = 'Assignment'

        from apps.chat.services.utilities.ReportGenerator import generate_class_report_pdf
        report = await sync_to_async(generate_class_report_pdf)(assignment_title, grades_data)
        return JsonResponse(report)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

