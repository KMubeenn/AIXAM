
import json

from apps.chat.services.services.ChatPersistence import ChatPersistenceService
from apps.core.services import CoreService


AVG_CHARS_PER_TOKEN=4

def estimate_tokens(input:str)->int:
    """ used to get an estimate of tokens in text"""
    return max(1,len(input)//AVG_CHARS_PER_TOKEN)



async def generate_response_with_persistence(chat_agent,session_id,message,user_id=None,grade_test=False,test_submission=None,study_material_id=None,quiz_id=None,grading_instructions=None):
    chat_persistence=ChatPersistenceService()
    query=message[-1].content
    await chat_persistence.update_messages(session_id=session_id,role="user",content=query)
    full_response=[]
    if await chat_persistence.get_title(session_id=session_id)=='New Chat':
        from apps.chat.services.utilities.TopicExtractor import TopicExtractor
        extractor = TopicExtractor()
        topic = await extractor.extract_topic(query)
        await chat_persistence.set_title(session_id=session_id,message=topic)

    async for output in chat_agent.run(input=message,id=session_id,grade_test=grade_test,test_submission=test_submission,grading_instructions=grading_instructions,user_id=user_id):
        if output["type"]=="token":
            full_response.append(output["content"])
            yield output["content"]
        else:
            if user_id:
                record_id=await _persist_structured_output(user_id,output,session_id,study_material_id,quiz_id)
                if record_id:
                    output['record_id']=record_id
            yield f"\n{json.dumps(output)}\n"

    response=''.join(full_response)
    if response:
        await chat_persistence.update_messages(session_id=session_id,role='assistant',content=response)
        await chat_persistence.update_session_memory(session_id=session_id,human_message=query,ai_message=response)


async def _persist_structured_output(user_id,output,session_id,study_material_id=None,quiz_id=None):
    """Persist structured output to DB. Returns the DB record ID if created."""
    output_type=output.get('type')
    data=output.get('data')
    if not data:
        return None

    # Determine topic from chat session
    chat_persistence = ChatPersistenceService()
    session_title = await chat_persistence.get_title(session_id)
    topic = session_title if session_title and session_title != "New Chat" else "General"

    try:
        if output_type=='flashcards':
            source_type = 'file' if study_material_id else 'topic'
            return await CoreService.save_flashcard_set(
                user_id=user_id,
                cards=data,
                title=f"{topic} Flashcards",
                source_type=source_type,
                topic=topic,
                study_material_id=study_material_id
            )
        elif output_type=='mock_test':
            return await CoreService.save_mock_test(
                user_id=user_id,
                questions=data,
                title=f"{topic} Mock Test",
                study_material_id=study_material_id
            )
        elif output_type=='mcq_test':
            return await CoreService.save_mcq_test(
                user_id=user_id,
                questions=data,
                title=f"{topic} MCQ Test",
                study_material_id=study_material_id
            )
        elif output_type=='mock_test_grades':
            total_marks=data.get('total_marks',0)
            max_total_marks=data.get('max_total_marks',0)
            overall_feedback=data.get('overall_feedback','')
            score_pct=(total_marks/max_total_marks*100) if max_total_marks>0 else 0

            submission=await CoreService.save_submission(
                student_id=user_id,
                quiz_id=quiz_id,
                score=score_pct,
                feedback=overall_feedback
            )
            await CoreService.update_student_performance(
                student_id=user_id,
                topic=topic,
                score=score_pct
            )
            return str(submission.id)
        elif output_type=='document' or output_type=='slide_outline':
            return None
        elif output_type=='assignment':
            return await CoreService.save_assignment(
                user_id=user_id,
                title=data.get('title', f"{topic} Assignment"),
                description=f"Generated assignment for {topic}",
                questions=data.get('questions', []),
                total_marks=data.get('total_marks', 100),
                study_material_id=study_material_id
            )
        elif output_type=='teacher_quiz':
            return await CoreService.save_teacher_quiz(
                user_id=user_id,
                title=f"{topic} Teacher Quiz",
                questions=data,
                study_material_id=study_material_id
            )
        elif output_type=='batch_grades':
            return await CoreService.save_batch_grades(
                teacher_id=user_id,
                assignment_id=quiz_id,
                grades_data=data
            )
    except Exception as e:
        print(f"[CorePersistence] Failed to save {output_type}: {e}")
        return None




















































# """
# Chat Service - Business logic for chat functionality.
# Handles chatbot management, response generation, and file processing.
# """
# import asyncio
# from asgiref.sync import sync_to_async
# from typing import Optional

# from apps.chat.services.agents.ChatBot import ChatBot
# from apps.chat.services.services.ChatPersistence import ChatPersistenceService
# from apps.chat.services.services.SessionManager import SessionMemoryManager
# from apps.chat.services.services.token_service import TokenTrackingService
# from apps.chat.models import ChatSession


# # In-memory chatbot cache (per session_id)
# # redis will be implemented later for faster caching
# chatbot_cache = {}

# # Token estimation: ~4 characters per token (rough average for English)
# CHARS_PER_TOKEN = 4


# def estimate_tokens(text: str) -> int:
#     """Estimate token count from text length."""
#     return max(1, len(text) // CHARS_PER_TOKEN)


# def get_or_create_chatbot(session_id: str) -> ChatBot:
#     """
#     Get existing ChatBot instance from cache or create a new one.
#     Memory is automatically loaded from DB if available (via SessionMemoryManager).
#     """
#     if session_id not in chatbot_cache:
#         print(f"[{session_id}] Creating new ChatBot instance")
#         chatbot_cache[session_id] = ChatBot()
#     else:
#         print(f"[{session_id}] Using existing ChatBot instance")
#     return chatbot_cache[session_id]


# async def generate_response_with_persistence(
#     chatbot: ChatBot, 
#     session_id: str, 
#     message: str,
#     user=None
# ):
#     """
#     Generate streaming response from chatbot with message persistence.
#     Saves user message before processing and assistant message after completion.
#     """
#     print(f"[{session_id}] Processing message for session_id: {session_id}")
#     buffer = ['"', '-', '*', '—']
#     flush = False
#     max_retries = 3
#     retry_delay = 10
#     response_content = []  # Accumulate full response
    
#     # Save user message to database (wrapped in sync_to_async)
#     if user:
#         await ChatPersistenceService.save_message_async(session_id, 'user', message)
#         # Update title from first message if it's still "New Chat"
#         try:
#             session = await sync_to_async(ChatSession.objects.get)(id=session_id)
#             if session.title == 'New Chat' and session.message_count <= 1:
#                 await ChatPersistenceService.update_session_title_async(session_id, message[:50])
#         except:
#             pass

#     for attempt in range(max_retries):
#         try:
#             async for token in chatbot.ask_stream(message, session_id=session_id, k=8):
#                 if token in buffer:
#                     if flush:
#                         flush = False
#                         continue
#                     else:
#                         flush = True
#                 response_content.append(token)
#                 yield token
            
#             print(f"[{session_id}] Response streaming completed successfully")
            
#             # Save assistant message and memory to database (wrapped in sync_to_async)
#             if user:
#                 full_response = ''.join(response_content)
#                 await ChatPersistenceService.save_message_async(session_id, 'assistant', full_response)
#                 # Persist memory state
#                 await SessionMemoryManager.save_session_async(session_id)
                
#                 # Track token usage
#                 try:
#                     session = await sync_to_async(ChatSession.objects.get)(id=session_id)
#                     input_tokens = estimate_tokens(message)
#                     output_tokens = estimate_tokens(full_response)
                    
#                     await TokenTrackingService.record_usage_async(
#                         user=user,
#                         session=session,
#                         model_name="llama-3.1-8b-instant",  # Current default model
#                         provider="groq",
#                         input_tokens=input_tokens,
#                         output_tokens=output_tokens,
#                         request_type="chat"
#                     )
#                 except Exception as track_error:
#                     print(f"[{session_id}] Token tracking error (non-fatal): {track_error}")
            
#             return
#         except Exception as e:
#             error_str = str(e)
#             if "ResourceExhausted" in error_str or "429" in error_str or "quota" in error_str.lower():
#                 if attempt < max_retries - 1:
#                     wait_time = retry_delay * (2 ** attempt)
#                     print(f"[{session_id}] Rate limit hit. Waiting {wait_time}s before retry {attempt + 2}/{max_retries}")
#                     yield f"\n\n⏳ Rate limit reached. Retrying in {wait_time} seconds...\n\n"
#                     await asyncio.sleep(wait_time)
#                 else:
#                     print(f"[{session_id}] Rate limit: max retries exceeded")
#                     yield "\n\n Rate limit exceeded. Please wait a minute and try again.\n"
#                     return
#             else:
#                 print(f"[{session_id}] Error: {e}")
#                 yield f"\n\nError: {str(e)}\n"
#                 return


# async def generate_response(chatbot: ChatBot, chat_id: str, message: str):
#     """
#     Generate streaming response (legacy, no persistence).
#     For backward compatibility with unauthenticated requests.
#     """
#     print(f"[{chat_id}] Processing message for chat_id: {chat_id}")
#     buffer = ['"', '-', '*', '—']
#     flush = False
#     max_retries = 3
#     retry_delay = 10

#     for attempt in range(max_retries):
#         try:
#             async for token in chatbot.ask_stream(message, session_id=chat_id, k=8):
#                 if token in buffer:
#                     if flush:
#                         flush = False
#                         continue
#                     else:
#                         flush = True
#                 yield token
#             print(f"[{chat_id}] Response streaming completed successfully")
#             return
#         except Exception as e:
#             error_str = str(e)
#             if "ResourceExhausted" in error_str or "429" in error_str or "quota" in error_str.lower():
#                 if attempt < max_retries - 1:
#                     wait_time = retry_delay * (2 ** attempt)
#                     print(f"[{chat_id}] Rate limit hit. Waiting {wait_time}s before retry {attempt + 2}/{max_retries}")
#                     yield f"\n\n⏳ Rate limit reached. Retrying in {wait_time} seconds...\n\n"
#                     await asyncio.sleep(wait_time)
#                 else:
#                     print(f"[{chat_id}] Rate limit: max retries exceeded")
#                     yield "\n\n Rate limit exceeded. Please wait a minute and try again.\n"
#                     return
#             else:
#                 print(f"[{chat_id}] Error: {e}")
#                 yield f"\n\nError: {str(e)}\n"
#                 return


# def file_processing(files, chatbot: ChatBot, chat_id: str):
#     """
#     Process uploaded files and add them to the chatbot context.
#     """
#     for file in files:
#         if file.name:
#             print(f"[{chat_id}] Processing file: {file.name}")
#             try:
#                 chatbot.read(file, filename=file.name)
#             except Exception as file_error:
#                 print(f"[{chat_id}] Error reading file {file.name}: {file_error}")
