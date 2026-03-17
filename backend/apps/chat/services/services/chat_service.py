
import asyncio
import json

from apps.chat.services.services.ChatPersistence import ChatPersistenceService


AVG_CHARS_PER_TOKEN=4

def estimate_tokens(input:str)->int:
    """ used to get an estimate of tokens in text"""
    return max(1,len(input)//AVG_CHARS_PER_TOKEN)



async def generate_response_with_persistence(chat_agent,session_id,message):
    chat_persistence=ChatPersistenceService()
    query=message[-1].content
    await chat_persistence.update_messages(session_id=session_id,role="user",content=query)
    full_response=[]
    if await chat_persistence.get_title(session_id=session_id)=='New Chat':
        await chat_persistence.set_title(session_id=session_id,message=query)

    async for output in chat_agent.run(input=message,id=session_id):
        if output["type"]=="token":
            full_response.append(output["content"])
            yield output["content"]
        else:
            yield json.dumps(output)

    response=''.join(full_response)
    if response:
        await chat_persistence.update_messages(session_id=session_id,role='assistant',content=response)
        await chat_persistence.update_session_memory(session_id=session_id,human_message=query,ai_message=response)




















































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
