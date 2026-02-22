from langchain.messages import HumanMessage,AIMessage
from langgraph.graph import add_messages

from typing import TypedDict , Annotated , Union
import operator

class AgentState(TypedDict , total=False):
    system_prompt : str
    rag_context : str
    files_input : str
    messages : Annotated[list[Union[HumanMessage,AIMessage]],add_messages]
    llm_calls : int 
    flashcards : dict
    assignment : dict
    grades : dict
    classroom : dict
    final_result : bool


