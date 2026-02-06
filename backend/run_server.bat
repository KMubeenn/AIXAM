@echo off
echo Starting Django Backend with ASGI (Uvicorn)...
echo.
echo Endpoints:
echo   GET  http://127.0.0.1:8000/api/          - Health check
echo   GET  http://127.0.0.1:8000/api/health/   - Health status
echo   POST http://127.0.0.1:8000/api/chat/     - Chat with streaming
echo   POST http://127.0.0.1:8000/api/voice/    - Voice with streaming
echo.
cd /d "%~dp0"
uvicorn configs.asgi:application --reload --host 127.0.0.1 --port 8000
