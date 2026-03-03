from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
import inspect  


class AgentTools():
    @staticmethod
    @tool
    def decide_task(task:str):
        """ this tool should be only called when user requests one of the following 
        generated flash cards , generate mock test , generate mock mcq test 
        the input should be one of following only with strict casing rules
        flashcards,mock_test,mcq_mock_test"""
        return task

    @staticmethod
    def return_tools():
        return [AgentTools.decide_task]

    @staticmethod
    def return_tool_node():
        return ToolNode(AgentTools.return_tools())




