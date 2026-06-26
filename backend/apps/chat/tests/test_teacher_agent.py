import pytest
from unittest.mock import patch, MagicMock
from langchain_core.messages import HumanMessage, AIMessage

from apps.chat.services.agents.teacher import TeacherAgent
from apps.chat.services.agents.ChatBot import ChatBot
from apps.chat.services.services.TeacherTools import TeacherTools

@pytest.fixture
def teacher_agent():
    return TeacherAgent(temperature=0)

@pytest.fixture
def initial_state():
    return {
        "messages": [HumanMessage(content="Hello")],
        "system_prompt": "You are a teacher bot.",
        "llm_calls": 0,
    }

class TestTeacherAgent:
    
    # 1. Test standard chat bypasses orchestrator
    def test_orchestrator_ignores_normal_chat(self, teacher_agent, initial_state):
        # Setup state with normal AIMessage (no tool calls)
        initial_state["messages"].append(AIMessage(content="How can I help you today?"))
        
        result = teacher_agent.orchestrator(initial_state)
        
        # Should return same llm_calls, no tasks executed
        assert result.get("llm_calls") == 0
        assert "document" not in result
        assert "teacher_quiz" not in result

    # 2. Test planning a simple quiz
    @patch.object(TeacherAgent, '_generate_teacher_quiz')
    def test_orchestrator_handles_teacher_quiz(self, mock_generate_quiz, teacher_agent, initial_state):
        # Mock the quiz generator to return dummy data
        mock_generate_quiz.return_value = {"teacher_quiz": [{"question": "Q1?"}]}
        
        # Setup AI message with plan_tasks tool call
        tool_call = {
            "name": "plan_tasks",
            "args": {
                "steps": [{"step": 1, "task": "teacher_quiz", "depends_on": None}]
            },
            "id": "call_123"
        }
        initial_state["messages"].append(AIMessage(content="", tool_calls=[tool_call]))
        
        result = teacher_agent.orchestrator(initial_state)
        
        assert mock_generate_quiz.called
        assert result["llm_calls"] == 1
        assert "teacher_quiz" in result

    # 3. Test planning a quiz + export to PDF
    @patch.object(TeacherAgent, '_generate_teacher_quiz')
    @patch.object(TeacherAgent, '_export_as_document')
    def test_orchestrator_handles_dependent_tasks(self, mock_export, mock_generate_quiz, teacher_agent, initial_state):
        mock_generate_quiz.return_value = {"teacher_quiz": [{"question": "Q1?"}]}
        mock_export.return_value = {"document": {"format": "pdf", "file_base64": "dummy"}}
        
        tool_call = {
            "name": "plan_tasks",
            "args": {
                "steps": [
                    {"step": 1, "task": "teacher_quiz", "depends_on": None},
                    {"step": 2, "task": "generate_pdf", "depends_on": 1}
                ]
            },
            "id": "call_123"
        }
        initial_state["messages"].append(AIMessage(content="", tool_calls=[tool_call]))
        
        result = teacher_agent.orchestrator(initial_state)
        
        assert mock_generate_quiz.called
        assert mock_export.called
        
        # Verify export was called with the output of step 1
        mock_export.assert_called_with(
            {"title": "Teacher Quiz", "questions": [{"question": "Q1?"}]}, 
            "pdf", 
            initial_state
        )
        assert result["llm_calls"] == 1  # export doesn't call LLM
        assert "document" in result

    # 4. Test ChatBot routing logic for document mapping
    @pytest.mark.asyncio
    @patch('apps.chat.services.agents.teacher.TeacherAgent.agent_builder')
    async def test_chatbot_yields_document(self, mock_builder):
        # Mock the LangGraph state to return a document
        mock_graph = MagicMock()
        mock_graph.aget_state.return_value = MagicMock(values={"document": {"format": "pdf", "file_base64": "dummy"}})
        mock_builder.return_value = mock_graph
        
        bot = ChatBot(role='teacher')
        
        # Run chatbot iterator
        outputs = []
        async for output in bot.run(input=[HumanMessage(content="hi")], id="123"):
            outputs.append(output)
            
        # Verify it yielded the document type and updated last_generated_document
        doc_outputs = [o for o in outputs if o.get("type") == "document"]
        assert len(doc_outputs) == 1
        assert bot._last_generated_document == {"format": "pdf", "file_base64": "dummy"}

    # 5. Test upload_generated_file_to_classroom tool requires prior document
    @patch('apps.chat.services.utilities.ClassroomService.ClassroomService.upload_file_to_drive')
    @patch('apps.chat.services.utilities.ClassroomService.ClassroomService.create_assignment_with_drive_attachment')
    @patch('apps.users.models.User.objects.get')
    def test_upload_generated_file_tool(self, mock_get_user, mock_create_assignment, mock_upload_drive):
        mock_get_user.return_value = MagicMock()
        mock_upload_drive.return_value = {"drive_file_id": "file123", "drive_file_url": "url"}
        mock_create_assignment.return_value = {"id": "cw123", "alternateLink": "link"}
        
        # Test 1: Config without generated_document should fail
        config_no_doc = {"configurable": {"user_id": "u123", "generated_document": None}}
        res_fail = TeacherTools.upload_generated_file_to_classroom.invoke({
            "course_id": "c1", "title": "T", "description": "D", "max_points": "10", "file_format": "pdf"
        }, config=config_no_doc)
        assert "Error: No generated document found" in res_fail
        
        # Test 2: Config with generated_document but mismatched format
        config_wrong_doc = {"configurable": {"user_id": "u123", "generated_document": {"format": "docx"}}}
        res_wrong = TeacherTools.upload_generated_file_to_classroom.invoke({
            "course_id": "c1", "title": "T", "description": "D", "max_points": "10", "file_format": "pdf"
        }, config=config_wrong_doc)
        assert "Error: You requested to upload a pdf, but the last generated document was docx" in res_wrong
        
        # Test 3: Success path
        config_good = {"configurable": {
            "user_id": "u123", 
            "generated_document": {"format": "pdf", "filename": "test.pdf", "file_base64": "ZHVtbXk=", "mime_type": "app/pdf"}
        }}
        res_good = TeacherTools.upload_generated_file_to_classroom.invoke({
            "course_id": "c1", "title": "T", "description": "D", "max_points": "10", "file_format": "pdf"
        }, config=config_good)
        
        assert "Successfully uploaded" in res_good
        assert mock_upload_drive.called
        assert mock_create_assignment.called
