from langchain.messages import HumanMessage,AIMessage,SystemMessage
from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages

from typing import TypedDict , Annotated , Sequence
import operator

class AgentState(TypedDict , total=False):
    system_prompt : str
    rag_context : str
    files_input : str
    messages : Annotated[Sequence[BaseMessage],add_messages]
    llm_calls : int 
    flashcards : dict
    assignment : dict
    grades : dict
    classroom : dict
    final_result : bool


