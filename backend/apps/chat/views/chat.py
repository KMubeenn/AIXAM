

from django.http import StreamingHttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.chat.services.services.ChatPersistence import ChatPersistenceService,PersistenceServiceError
from apps.chat.services.services.chat_service import generate_response_with_persistence
from apps.chat.models import ChatSession
from apps.chat.services.agents.ChatBot import Agent
from apps.users.jwt_utils import get_user_from_request
from asgiref.sync import sync_to_async 

from langchain.messages import HumanMessage

import json

@csrf_exempt
@require_http_methods(['POST'])
async def agent_endpoint(request):
    try:
        chat_persistence=ChatPersistenceService()
        agent=Agent()
        data=json.loads(request.body)
        if data.get("create_session"):
            user=await sync_to_async(get_user_from_request)(request=request)
            session_id=await chat_persistence.create_session(user_id=user.id)
        else:
            session_id=data.get('session_id')
        message=data.get('message')
        memory=await chat_persistence.get_session_memory(session_id=session_id)
        message=[HumanMessage(content=message)]
        message=memory+message

        response=StreamingHttpResponse(generate_response_with_persistence(chat_agent=agent,session_id=session_id,message=message))
        response['cache-control']='no-cache'
        response['connection']='keep-alive'
        response['X-Accel-Buffering']='no'
        return response 
    except PersistenceServiceError as e:
        print("chat endpoint failed ",str(e))
        print("source of error ",e.source)
        print('python explanation of error ',e.__cause__)
        return JsonResponse({'error':"internal server error",
        'message':'internal server error'}
        ,status=500)





    











































# """
# Chat views - Handles chat endpoints with streaming responses.
# Integrates with database persistence for messages and memory.
# """
# from asgiref.sync import sync_to_async
# from django.http import StreamingHttpResponse, JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_http_methods

# from apps.chat.services.services.ChatPersistence import ChatPersistenceService
# from apps.chat.models import ChatSession
# from apps.users.jwt_utils import get_user_from_request
# from apps.chat.services.services.chat_service import (
#     get_or_create_chatbot,
#     generate_response_with_persistence,
#     generate_response,
#     file_processing,
# )


# @csrf_exempt
# @require_http_methods(["POST"])
# async def chat_endpoint(request):
#     """
#     HTTP endpoint for chat functionality.
#     Receives session_id (or chat_id for legacy), message, and optional files.
#     Returns streaming response.
    
#     Supports both authenticated and unauthenticated requests:
#     - Authenticated: Uses session_id, persists to database
#     - Unauthenticated: Uses chat_id, in-memory only
#     """
#     # Support both session_id (new) and chat_id (legacy)
#     session_id = request.POST.get("session_id") or request.POST.get("chat_id")
#     message = request.POST.get("message")
#     files = request.FILES.getlist("files")
    
#     # Get user from JWT token (wrapped in sync_to_async for async context)
#     user = await sync_to_async(get_user_from_request)(request)

#     print(f"[{session_id}] === CHAT ENDPOINT CALLED ===")
#     print(f"[{session_id}] session_id: {session_id}")
#     print(f"[{session_id}] message: {message}")
#     print(f"[{session_id}] files count: {len(files) if files else 0}")
#     print(f"[{session_id}] authenticated: {user is not None}")

#     if not session_id or not message:
#         return JsonResponse({"error": "session_id and message are required"}, status=400)

#     # Check session ownership if authenticated (wrap in sync_to_async)
#     session_exists = await sync_to_async(ChatPersistenceService.session_exists)(session_id) if user else False
    
#     if user and session_exists:
#         session_belongs = await sync_to_async(ChatPersistenceService.session_belongs_to_user)(session_id, user)
#         if not session_belongs:
#             return JsonResponse({"error": "Session not found"}, status=404)
        
#         # Check message limit
#         try:
#             session = await sync_to_async(ChatSession.objects.get)(id=session_id)
#             can_add = await sync_to_async(session.can_add_message)(ChatPersistenceService.MAX_MESSAGES_PER_SESSION)
#             if not can_add:
#                 return JsonResponse({
#                     "error": "Session has reached maximum message limit",
#                     "max_messages": ChatPersistenceService.MAX_MESSAGES_PER_SESSION
#                 }, status=400)
#         except ChatSession.DoesNotExist:
#             pass

#     chatbot = get_or_create_chatbot(session_id)

#     try:
#         if files:
#             file_processing(files, chatbot, session_id)

#         # Determine if we should use persistence (check once, not in generator)
#         use_persistence = user and session_exists

#         async def stream_wrapper():
#             if use_persistence:
#                 # Use persistence-enabled generator
#                 async for token in generate_response_with_persistence(chatbot, session_id, message, user):
#                     yield token
#             else:
#                 # Use legacy generator (no persistence)
#                 async for token in generate_response(chatbot, session_id, message):
#                     yield token

#         response = StreamingHttpResponse(
#             stream_wrapper(),
#             content_type="text/plain"
#         )
#         response["Cache-Control"] = "no-cache"
#         response["Connection"] = "keep-alive"
#         response["X-Accel-Buffering"] = "no"
#         return response

#     except Exception as e:
#         print(f"[{session_id}] Error processing request: {e}")

#         async def error_response():
#             yield f"Error: {str(e)}"

#         return StreamingHttpResponse(
#             error_response(),
#             content_type="text/plain"
#         )
