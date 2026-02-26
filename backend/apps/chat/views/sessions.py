from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
import json
from apps.users.jwt_utils import get_user_from_request
from asgiref.sync import sync_to_async

from apps.chat.services.services.ChatPersistence import ChatPersistenceService




@csrf_exempt
@require_http_methods(['GET'])
async def get_sessions(request):
    user=await sync_to_async(get_user_from_request)(request)
    chat_persistence=ChatPersistenceService()
    user_sessions=await chat_persistence.get_user_sessions(user)

    return JsonResponse({'user_sessions':user_sessions})

@csrf_exempt
@require_http_methods(['GET'])
async def get_session_messages(request):
    session_id=request.GET.get('session_id')
    chat_persistence=ChatPersistenceService()
    session_messages=await chat_persistence.get_session_messages(session_id=session_id)

    return JsonResponse({'session_messages':session_messages})


@csrf_exempt
@require_http_methods(['DELETE'])
async def delete_session(request):
    session_id=request.GET.get("session_id")
    chat_persistence=ChatPersistenceService()
    await chat_persistence.delete_session(session_id=session_id)

    return JsonResponse({'response':'session deleted successfully'})




























































# """
# Session Views - Handles chat session CRUD operations.

# Endpoints:
# - GET /api/chat/sessions/ - List user's sessions
# - POST /api/chat/sessions/ - Create new session
# - GET /api/chat/sessions/{id}/ - Get session with messages
# - DELETE /api/chat/sessions/{id}/ - Delete session
# """
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_http_methods

# from apps.chat.services.services.ChatPersistence import ChatPersistenceService
# from apps.chat.models import ChatSession
# from apps.users.jwt_utils import get_user_from_request


# @csrf_exempt
# @require_http_methods(["GET", "POST"])
# def sessions_list(request):
#     """
#     GET: List all chat sessions for the authenticated user.
#     POST: Create a new chat session.
#     """
#     user = get_user_from_request(request)
#     if not user:
#         return JsonResponse({"error": "Authentication required"}, status=401)
    
#     if request.method == 'GET':
#         sessions = ChatPersistenceService.get_user_sessions(user)
#         return JsonResponse({
#             'sessions': sessions,
#             'total_count': len(sessions),
#             'max_sessions': ChatPersistenceService.MAX_SESSIONS_PER_USER,
#         })
    
#     elif request.method == 'POST':
#         # Check session limit
#         if not ChatSession.can_create_session(user, ChatPersistenceService.MAX_SESSIONS_PER_USER):
#             return JsonResponse({
#                 'error': 'Maximum number of sessions reached',
#                 'max_sessions': ChatPersistenceService.MAX_SESSIONS_PER_USER,
#             }, status=400)
        
#         # Get title from request body
#         import json
#         try:
#             data = json.loads(request.body) if request.body else {}
#             title = data.get('title', 'New Chat')
#         except:
#             title = 'New Chat'
        
#         # Create session
#         session = ChatPersistenceService.create_session(user, title)
        
#         if session:
#             return JsonResponse({
#                 'id': str(session.id),
#                 'title': session.title,
#                 'created_at': session.created_at.isoformat(),
#                 'message_count': 0,
#             }, status=201)
        
#         return JsonResponse({
#             'error': 'Failed to create session',
#         }, status=500)


# @csrf_exempt
# @require_http_methods(["GET", "DELETE", "PATCH"])
# def session_detail(request, session_id):
#     """
#     GET: Get session details with all messages.
#     DELETE: Delete (deactivate) a session.
#     PATCH: Update session title.
#     """
#     user = get_user_from_request(request)
#     if not user:
#         return JsonResponse({"error": "Authentication required"}, status=401)
    
#     # Verify session belongs to user
#     if not ChatPersistenceService.session_belongs_to_user(session_id, user):
#         return JsonResponse({
#             'error': 'Session not found',
#         }, status=404)
    
#     if request.method == 'GET':
#         try:
#             session = ChatSession.objects.get(id=session_id)
#             messages = ChatPersistenceService.get_session_messages(session_id)
#             return JsonResponse({
#                 'id': str(session.id),
#                 'title': session.title,
#                 'created_at': session.created_at.isoformat(),
#                 'updated_at': session.updated_at.isoformat(),
#                 'message_count': session.message_count,
#                 'messages': messages,
#             })
#         except ChatSession.DoesNotExist:
#             return JsonResponse({
#                 'error': 'Session not found',
#             }, status=404)
    
#     elif request.method == 'DELETE':
#         success = ChatPersistenceService.delete_session(session_id, user)
#         if success:
#             from django.http import HttpResponse
#             return HttpResponse(status=204)
#         return JsonResponse({
#             'error': 'Failed to delete session',
#         }, status=500)
    
#     elif request.method == 'PATCH':
#         import json
#         try:
#             data = json.loads(request.body)
#             title = data.get('title')
#         except:
#             title = None
        
#         if not title:
#             return JsonResponse({
#                 'error': 'Title is required',
#             }, status=400)
        
#         success = ChatPersistenceService.update_session_title(session_id, title)
#         if success:
#             return JsonResponse({'title': title[:50]})
#         return JsonResponse({
#             'error': 'Failed to update title',
#         }, status=500)
