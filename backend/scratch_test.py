import os
import django
import sys

# Setup Django manually to allow testing outside of manage.py / pytest-django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configs.settings')
django.setup()

import asyncio
from unittest.mock import patch, MagicMock
from langchain_core.messages import HumanMessage, AIMessage

from apps.chat.services.agents.teacher import TeacherAgent
from apps.chat.services.agents.ChatBot import Agent as ChatBot
from apps.chat.services.services.TeacherTools import TeacherTools

def run_tests():
    print("========================================")
    print("TEACHER AGENT TEST REPORT")
    print("========================================\n")
    
    passed = 0
    failed = 0
    
    teacher_agent = TeacherAgent(temperature=0)
    initial_state = {
        "messages": [HumanMessage(content="Hello")],
        "system_prompt": "You are a teacher bot.",
        "llm_calls": 0,
    }

    # 1. Test standard chat bypasses orchestrator
    print("Test 1: Orchestrator ignores standard chat (no tool calls)")
    try:
        test_state = dict(initial_state)
        test_state["messages"] = [HumanMessage(content="Hi"), AIMessage(content="How can I help you today?")]
        
        result = teacher_agent.orchestrator(test_state)
        
        assert result.get("llm_calls") == 0, f"Expected 0 LLM calls, got {result.get('llm_calls')}"
        assert "document" not in result, "Unexpected document generated"
        print("PASS\n")
        passed += 1
    except Exception as e:
        print(f"FAIL: {e}\n")
        failed += 1

    # 2. Test planning a simple quiz
    print("Test 2: Orchestrator handles 'teacher_quiz' task")
    try:
        with patch.object(TeacherAgent, '_generate_teacher_quiz') as mock_generate_quiz:
            mock_generate_quiz.return_value = {"teacher_quiz": [{"question": "Q1?"}]}
            
            test_state = dict(initial_state)
            tool_call = {
                "name": "plan_tasks",
                "args": {"steps": [{"step": 1, "task": "teacher_quiz", "depends_on": None}]},
                "id": "call_123"
            }
            test_state["messages"] = [HumanMessage(content="Make a quiz"), AIMessage(content="", tool_calls=[tool_call])]
            
            result = teacher_agent.orchestrator(test_state)
            
            assert mock_generate_quiz.called, "Quiz generator was not called"
            assert result["llm_calls"] == 1, "Expected 1 LLM call for quiz generation"
            assert "teacher_quiz" in result, "Quiz was not added to state"
            print("PASS\n")
            passed += 1
    except Exception as e:
        print(f"FAIL: {e}\n")
        failed += 1

    # 3. Test planning a quiz + export to PDF
    print("Test 3: Orchestrator handles sequential tasks with dependencies (Quiz -> PDF)")
    try:
        with patch.object(TeacherAgent, '_generate_teacher_quiz') as mock_generate_quiz, \
             patch.object(TeacherAgent, '_export_as_document') as mock_export:
             
            mock_generate_quiz.return_value = {"teacher_quiz": [{"question": "Q1?"}]}
            mock_export.return_value = {"document": {"format": "pdf", "file_base64": "dummy"}}
            
            test_state = dict(initial_state)
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
            test_state["messages"] = [HumanMessage(content="Quiz to PDF"), AIMessage(content="", tool_calls=[tool_call])]
            
            result = teacher_agent.orchestrator(test_state)
            
            assert mock_generate_quiz.called, "Quiz generator not called"
            assert mock_export.called, "Export function not called"
            assert result["llm_calls"] == 1, "Export should not trigger a second LLM call"
            assert "document" in result, "Document was not added to state"
            print("PASS\n")
            passed += 1
    except Exception as e:
        print(f"FAIL: {e}\n")
        failed += 1

    # 4. Test ChatBot mapping and state persistence
    print("Test 4: ChatBot streams document correctly and persists generated file state")
    try:
        async def test_chatbot():
            from unittest.mock import AsyncMock
            with patch('apps.chat.services.agents.teacher.TeacherAgent.agent_builder') as mock_builder:
                mock_graph = MagicMock()
                mock_graph.aget_state = AsyncMock(return_value=MagicMock(values={"document": {"format": "pdf", "file_base64": "dummy"}}))
                mock_builder.return_value = mock_graph
                
                bot = ChatBot(role='teacher')
                outputs = []
                async for output in bot.run(input=[HumanMessage(content="hi")], id="123"):
                    outputs.append(output)
                    
                doc_outputs = [o for o in outputs if o.get("type") == "document"]
                assert len(doc_outputs) == 1, "ChatBot did not yield document stream"
                assert bot._last_generated_document == {"format": "pdf", "file_base64": "dummy"}, "ChatBot failed to persist document internally"
                return True
                
        asyncio.run(test_chatbot())
        print("PASS\n")
        passed += 1
    except Exception as e:
        print(f"FAIL: {e}\n")
        failed += 1

    # 5. Test Classroom Tools correctly reading context
    print("Test 5: Classroom Upload Tools validate context properly")
    try:
        with patch('apps.chat.services.utilities.ClassroomService.ClassroomService.upload_file_to_drive') as mock_upload, \
             patch('apps.chat.services.utilities.ClassroomService.ClassroomService.create_assignment_with_drive_attachment') as mock_create, \
             patch('apps.users.models.User.objects.get'):
             
            mock_upload.return_value = {"drive_file_id": "file123", "drive_file_url": "url"}
            mock_create.return_value = {"id": "cw123", "alternateLink": "link"}
            
            # Subtest: Empty context
            res_fail = TeacherTools.upload_generated_file_to_classroom.invoke(
                {"course_id": "c1", "title": "T", "description": "D", "max_points": "10", "file_format": "pdf"},
                config={"configurable": {"user_id": "u123", "generated_document": None}}
            )
            assert "Error: No generated PDF found in this session" in res_fail, "Failed to catch missing document"
            
            # Subtest: Success path
            res_good = TeacherTools.upload_generated_file_to_classroom.invoke(
                {"course_id": "c1", "title": "T", "description": "D", "max_points": "10", "file_format": "pdf"},
                config={"configurable": {
                    "user_id": "u123", 
                    "generated_document": {"format": "pdf", "filename": "test.pdf", "file_base64": "ZHVtbXk=", "mime_type": "app/pdf"}
                }}
            )
            if "uploaded and posted" not in res_good:
                print(f"DEBUG FAIL: res_good output was: {res_good}")
            assert "uploaded and posted" in res_good, "Failed on valid payload"
            
            print("PASS\n")
            passed += 1
    except Exception as e:
        print(f"FAIL: {e}\n")
        failed += 1

    print("========================================")
    print(f"TESTS RUN: {passed + failed}")
    print(f"PASSED: {passed}")
    print(f"FAILED: {failed}")
    print("========================================")
    
if __name__ == "__main__":
    run_tests()
