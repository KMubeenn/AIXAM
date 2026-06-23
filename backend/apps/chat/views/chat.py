

from django.http import StreamingHttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.chat.services.services.ChatPersistence import ChatPersistenceService,PersistenceServiceError
from apps.chat.services.services.chat_service import generate_response_with_persistence
from apps.chat.models import ChatSession
from apps.chat.services.agents.ChatBot import Agent
from apps.users.jwt_utils import get_payload_from_request
from asgiref.sync import sync_to_async 

from langchain.messages import HumanMessage

import json

@csrf_exempt
@require_http_methods(['POST'])
async def agent_endpoint(request):
    try:
        chat_persistence=ChatPersistenceService()
        # Handle both multipart/form-data (file uploads) and application/json
        if request.content_type and 'multipart' in request.content_type:
            data = request.POST
        else:
            data = json.loads(request.body)
        user_payload = await sync_to_async(get_payload_from_request)(request)
        if not user_payload:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        user_id = user_payload.get("user_id")
        # JWT payload inherently trusts the stored role now
        role = user_payload.get("role", data.get("role", "student"))

        create_session = data.get("create_session")
        if isinstance(create_session, str):
            create_session = create_session.lower() == 'true'

        if create_session:
            session_id=await chat_persistence.create_session(user_id=user_id)
        else:
            session_id=data.get('session_id')

        agent=Agent(role=role)

        memory=await chat_persistence.get_session_memory(session_id=session_id)
        agent.load_history(memory)

        # Load any materials previously associated with this session
        if session_id:
            try:
                from apps.core.models import StudyMaterial
                session_materials = await sync_to_async(
                    lambda: list(StudyMaterial.objects.filter(origin_session_id=session_id).only('processed_content', 'title'))
                )()
                for mat in session_materials:
                    if mat.processed_content:
                        agent.load_document_context_direct(mat.title, mat.processed_content)
            except Exception as e:
                print(f"[Chat] Failed to load session study materials: {e}")

        from apps.core.services import CoreService

        files=request.FILES.getlist("files")
        study_material_id = data.get('study_material_id', None)
        
        if files:
            for uploaded_file in files:
                print(f"[FileUpload] File received: '{uploaded_file.name}' | Size: {uploaded_file.size} bytes | Content-Type: {uploaded_file.content_type}")
                extracted_content = agent.load_document(uploaded_file)
                file_ext=uploaded_file.name.rsplit('.',1)[-1].lower() if '.' in uploaded_file.name else ''
                file_type_map={'pdf':'pdf','docx':'docx','pptx':'pptx','doc':'docx','ppt':'pptx'}
                file_type=file_type_map.get(file_ext,'pdf')
                material=await CoreService.save_study_material(
                    user_id=user_id,
                    title=uploaded_file.name,
                    file_type=file_type,
                    processed_content=extracted_content or '',
                    origin_session_id=session_id
                )
                study_material_id=str(material.id)
        elif study_material_id:
            # User referenced an old document
            try:
                from apps.core.models import StudyMaterial
                material = await sync_to_async(StudyMaterial.objects.get)(id=study_material_id)
                if material and material.processed_content:
                    agent.load_text_context(material.processed_content)
            except Exception as e:
                print(f"[Chat] Failed to load existing study material {study_material_id}: {e}")

        message=[HumanMessage(content=data.get('message'))]
        
        grade_test = data.get('grade_test', False)
        if isinstance(grade_test, str):
            grade_test = grade_test.lower() == 'true'
            
        test_submission=data.get('test_submission',None)
        quiz_id=data.get('quiz_id',None)
        grading_instructions=data.get('grading_instructions',None)

        response=StreamingHttpResponse(
            generate_response_with_persistence(
                chat_agent=agent,
                session_id=session_id,
                message=message,
                user_id=user_id,
                grade_test=grade_test,
                test_submission=test_submission,
                study_material_id=study_material_id,
                quiz_id=quiz_id,
                grading_instructions=grading_instructions
            )
        )
        response['cache-control']='no-cache'
        response['connection']='keep-alive'
        response['X-Accel-Buffering']='no'
        response['X-Session-Id']=str(session_id)
        return response 
    except PersistenceServiceError as e:
        print("chat endpoint failed ",str(e))
        print("source of error ",e.source)
        print('python explanation of error ',e.__cause__)
        return JsonResponse({'error':"internal server error",
        'message':'internal server error'}
        ,status=500)
    except Exception as e:
        import traceback
        print("=== UNHANDLED CHAT ERROR ===")
        traceback.print_exc()
        print("============================")
        return JsonResponse({'error': str(e)}, status=500)





    











































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
