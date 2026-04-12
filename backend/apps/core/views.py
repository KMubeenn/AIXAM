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
@require_http_methods(['GET'])
async def get_submissions(request):
    try:
        user=await sync_to_async(get_user_from_request)(request=request)
        if not user:
            return JsonResponse({'error':'Unauthorized'},status=401)
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
