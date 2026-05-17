import json
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from typing import List, Optional
from pydantic import BaseModel, Field

VALID_TASKS=["flashcards","mock_test","mcq_mock_test","generate_pdf","generate_docx","generate_pptx"]


class StudentTaskStep(BaseModel):
    step: int = Field(..., description="Sequential step number starting from 1")
    task: str = Field(..., description='One of "flashcards", "mock_test", "mcq_mock_test", "generate_pdf", "generate_docx", "generate_pptx"')
    depends_on: Optional[int] = Field(default=None, description="Step number that this task depends on, or null/None if independent")


class StudentTools():
    @staticmethod
    @tool
    def plan_tasks(steps: List[StudentTaskStep]):
        """CRITICAL: ONLY use this tool if the user explicitly asks to generate study materials, mock tests, or flashcards. If the user asks a normal question, is greeting you, or having a conversation, DO NOT use this tool and reply directly to them.

        Plan the tasks needed to fulfill the user's request.
        Return a list of steps where each step is a dict with:
        - step: int (sequential step number starting from 1)
        - task: one of "flashcards", "mock_test", "mcq_mock_test", "generate_pdf", "generate_docx", "generate_pptx"
        - depends_on: int or null. If this task needs the output of a previous step (e.g. exporting generated MCQs as a PDF), set this to that step number. Otherwise null.

        IMPORTANT - Task disambiguation:
        - "mock_test" = open-ended descriptive questions ONLY.
        - "mcq_mock_test" = multiple-choice questions ONLY.
        - If the user says "mock mcq test", "mcq mock test", "multiple choice mock test", or "mcq test", they want ONLY ONE task: "mcq_mock_test". Do NOT create both "mock_test" and "mcq_mock_test".
        - Only create BOTH tasks if the user explicitly says they want both open-ended AND multiple-choice questions (e.g. "give me a descriptive mock test AND an MCQ test").
        - If the user asks to generate a PDF, Word, or PPT document (e.g. "generate pdf on Python", "make study notes in pdf", "create textbook chapter in docx", "generate slides on machine learning"), schedule the specific matching task: {"step": 1, "task": "generate_pdf", "depends_on": null} for PDF study notes/guides, {"step": 1, "task": "generate_docx", "depends_on": null} for Microsoft Word documents, and {"step": 1, "task": "generate_pptx", "depends_on": null} for PowerPoint slides. Do NOT schedule a mock_test or mcq_mock_test unless they explicitly asked for a test, quiz, practice questions, or assessment!

        Rules:
        - Steps execute in order.
        - If the user wants content exported as a document (e.g. "give me MCQs in PDF"), create the content step first, then a document step that depends on it.
        - If tasks are independent (e.g. "flashcards and a mock test"), set depends_on to null for both.
        - For a single simple task, return a list with one step.

        Examples:
        - "Generate study notes PDF on Python" -> [{"step": 1, "task": "generate_pdf", "depends_on": null}]
        - "Generate flashcards on Python" -> [{"step": 1, "task": "flashcards", "depends_on": null}]
        - "MCQs on LLM in PDF and a mock test" -> [{"step": 1, "task": "mcq_mock_test", "depends_on": null}, {"step": 2, "task": "generate_pdf", "depends_on": 1}, {"step": 3, "task": "mock_test", "depends_on": null}]
        - "mock mcq test on AI" -> [{"step": 1, "task": "mcq_mock_test", "depends_on": null}]
        - "mcq mock test with 10 questions" -> [{"step": 1, "task": "mcq_mock_test", "depends_on": null}]
        """
        serialized_steps = [step.dict() for step in steps]
        return json.dumps(serialized_steps)


    @staticmethod
    def return_tools():
        return [StudentTools.plan_tasks]

    @staticmethod
    def return_tool_node():
        return ToolNode(StudentTools.return_tools())
