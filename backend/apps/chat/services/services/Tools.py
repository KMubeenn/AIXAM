import json
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from typing import Literal


VALID_TASKS=["flashcards","mock_test","mcq_mock_test","generate_pdf","generate_docx","generate_pptx"]


class AgentTools():
    @staticmethod
    @tool
    def plan_tasks(steps:list[dict]):
        """Plan the tasks needed to fulfill the user's request.
        Return a list of steps where each step is a dict with:
        - step: int (sequential step number starting from 1)
        - task: one of "flashcards", "mock_test", "mcq_mock_test", "generate_pdf", "generate_docx", "generate_pptx"
        - depends_on: int or null. If this task needs the output of a previous step (e.g. exporting generated MCQs as a PDF), set this to that step number. Otherwise null.

        Rules:
        - Steps execute in order.
        - If the user wants content exported as a document (e.g. "give me MCQs in PDF"), create the content step first, then a document step that depends on it.
        - If tasks are independent (e.g. "flashcards and a mock test"), set depends_on to null for both.
        - For a single simple task, return a list with one step.

        Examples:
        - "Generate flashcards on Python" -> [{"step": 1, "task": "flashcards", "depends_on": null}]
        - "MCQs on LLM in PDF and a mock test" -> [{"step": 1, "task": "mcq_mock_test", "depends_on": null}, {"step": 2, "task": "generate_pdf", "depends_on": 1}, {"step": 3, "task": "mock_test", "depends_on": null}]
        """
        return json.dumps(steps)

    @staticmethod
    def return_tools():
        return [AgentTools.plan_tasks]

    @staticmethod
    def return_tool_node():
        return ToolNode(AgentTools.return_tools())
