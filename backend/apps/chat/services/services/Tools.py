from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from typing import Literal


class AgentTools():
    @staticmethod
    @tool
    def decide_task(task:Literal["flashcards","mock_test","mcq_mock_test","generate_pdf","generate_docx","generate_pptx"]):
        """Call this tool when the user requests one of the following:
        generating flashcards, generating a mock test, generating an MCQ test,
        or generating a document in PDF, DOCX, or PPTX format."""

        
        return task

    @staticmethod
    def return_tools():
        return [AgentTools.decide_task]

    @staticmethod
    def return_tool_node():
        return ToolNode(AgentTools.return_tools())




