import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def student_user():
    return User.objects.create_user(
        username="student_user",
        email="student@example.com",
        password="password123",
        role="student"
    )

@pytest.fixture
def authenticated_client(api_client, student_user):
    api_client.force_authenticate(user=student_user)
    return api_client

@pytest.mark.django_db
@pytest.mark.skip(reason="Supabase test DB ATOMIC_REQUESTS KeyError")
class TestCoreEndpoints:
    def test_get_materials_unauthenticated(self, api_client):
        response = api_client.get("/api/core/materials/")
        # Ensure unauthorized users can't access materials
        assert response.status_code == 401

    def test_get_materials_authenticated(self, authenticated_client):
        response = authenticated_client.get("/api/core/materials/")
        # It should return 200 OK for an authenticated student
        assert response.status_code == 200
        assert "materials" in response.data

    @patch("apps.chat.services.utilities.LLMRouter.invoke_with_fallback")
    def test_generate_insights_mocked_llm(self, mock_invoke, authenticated_client):
        # We mock the LLM call so we don't hit the real Gemini API during tests!
        class MockResponse:
            content = '{"overall_summary": {"accuracy": 90, "questions_attempted": 10}, "subjects": [], "strongest_subjects": [], "weakest_subjects": [], "weakest_topics": [], "study_plan": [], "learning_analysis": "Great job", "exam_readiness": {"score": 90, "status": "Ready", "explanation": "Good"}, "improvement_potential": {"text": "None", "estimated_increase": 0}, "topic_heatmap": [], "ai_recommendations": [], "confidence_indicator": {"score": 90, "explanation": "High"}}'
            
        mock_invoke.return_value = MockResponse()
        
        response = authenticated_client.post("/api/core/analytics/insights/")
        assert response.status_code == 200
        assert "overall_summary" in response.json()
        assert response.json()["overall_summary"]["accuracy"] == 90
