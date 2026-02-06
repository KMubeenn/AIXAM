"""
Voice views - Handles voice input endpoints with streaming responses.
Migrated from FastAPI main.py
"""
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from core.agents.VoiceAgent import VoiceAgent
from api.services.chat_service import get_or_create_chatbot, generate_response


@csrf_exempt
@require_http_methods(["POST"])
async def voice_endpoint(request):
    """
    HTTP endpoint for voice input functionality.
    Receives chat_id and audio file.
    Transcribes audio and returns streaming response like /chat endpoint.
    """
    chat_id = request.POST.get("chat_id")
    audio = request.FILES.get("audio")

    print(f"[{chat_id}] === VOICE ENDPOINT CALLED ===")
    print(f"[{chat_id}] chat_id: {chat_id}")
    print(f"[{chat_id}] audio filename: {audio.name if audio else None}")

    if not chat_id or not audio:
        return JsonResponse({"error": "chat_id and audio are required"}, status=400)

    try:
        chatbot = get_or_create_chatbot(chat_id)
        agent = VoiceAgent()

        # Read audio bytes from uploaded file
        audio_bytes = audio.read()
        print(f"[{chat_id}] Audio bytes received: {len(audio_bytes)} bytes")

        transcription = agent.transcribe_bytes(audio_bytes)
        print(f"[{chat_id}] Transcription: {transcription}")

        if not transcription:
            async def empty_response():
                yield "Sorry, I couldn't understand the audio. Please try again."

            return StreamingHttpResponse(
                empty_response(),
                content_type="text/plain"
            )

        async def stream_wrapper():
            async for token in generate_response(chatbot, chat_id, transcription):
                yield token

        response = StreamingHttpResponse(
            stream_wrapper(),
            content_type="text/plain"
        )
        response["Cache-Control"] = "no-cache"
        response["Connection"] = "keep-alive"
        response["X-Accel-Buffering"] = "no"
        return response

    except Exception as e:
        print(f"[{chat_id}] Error processing voice request: {e}")

        async def error_response():
            yield f"Error: {str(e)}"

        return StreamingHttpResponse(
            error_response(),
            content_type="text/plain"
        )
