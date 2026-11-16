"""
AIXAM Backend – Offline API Tests
==================================
All LLM calls are fully mocked via unittest.mock.patch.
No live Gemini / Groq API calls are made in this suite.
"""

import pytest
from unittest.mock import patch, MagicMock
from django.test import Client
from apps.users.jwt_utils import generate_token
from django.contrib.auth import get_user_model

User = get_user_model()

MOCK_LLM_PATH = "apps.chat.services.utilities.LLMRouter.invoke_with_fallback"


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    return Client()


@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="TestPass123!",
    )


@pytest.fixture
def authenticated_client(api_client, test_user):
    token = generate_token(test_user)
    api_client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    return api_client


@pytest.fixture
def mock_llm_router():
    """Patches the LLMRouter so no live API calls are made."""
    mock_response = MagicMock()
    mock_response.content = "Mocked LLM response from fixture."
    mock_response.tool_calls = []
    with patch(MOCK_LLM_PATH, return_value=mock_response) as mock:
        yield mock


# ── Health / Routing Tests ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_root_404(api_client):
    """Root path should return a non-500 status (404 or 200 depending on URL config)."""
    response = api_client.get("/")
    assert response.status_code in (200, 404)


@pytest.mark.django_db
def test_api_prefix_exists(api_client):
    """The /api/ prefix should not raise a 500 error."""
    response = api_client.get("/api/")
    assert response.status_code != 500


# ── Authentication Tests ──────────────────────────────────────────────────────

@pytest.mark.django_db
def test_login_success(api_client, test_user):
    """Valid credentials must return HTTP 200 and a token."""
    response = api_client.post(
        "/api/auth/login/",
        data={"email": "test@example.com", "password": "TestPass123!"},
        content_type="application/json",
    )
    assert response.status_code == 200
    body = response.json()
    assert "token" in body or "access" in body


@pytest.mark.django_db
def test_login_invalid_credentials(api_client):
    """Wrong credentials must return HTTP 401."""
    response = api_client.post(
        "/api/auth/login/",
        data={"email": "ghost@example.com", "password": "wrongpass"},
        content_type="application/json",
    )
    assert response.status_code == 401


# ── Chat / LLM Endpoint Tests (Mocked) ───────────────────────────────────────

@pytest.mark.django_db
def test_chat_endpoint_requires_auth(api_client):
    """Unauthenticated requests to the chat endpoint must be rejected."""
    response = api_client.post(
        "/api/chat/",
        data={"message": "Hello"},
        content_type="application/json",
    )
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_chat_endpoint_mocked_response(authenticated_client, mock_llm_router):
    """Authenticated request with mocked LLM must return HTTP 200."""
    response = authenticated_client.post(
        "/api/chat/",
        data={"message": "Explain photosynthesis", "create_session": True},
        content_type="application/json",
    )
    assert response.status_code == 200
    # Consume the streaming response so the agent node is actually invoked
    _ = list(response.streaming_content)
    mock_llm_router.assert_called()
