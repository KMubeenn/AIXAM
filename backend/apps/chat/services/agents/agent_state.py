from langchain.messages import HumanMessage,AIMessage
from typing import TypedDict , Annotated , Union
import operator

class AgentState(TypedDict , total=False):
    system_prompt : str
    rag_context : str
    files_input : str
    messages : list[Union[HumanMessage,AIMessage]]
    llm_calls : int 
    flashcards : dict
    assignment : dict
    grades : dict
    classroom : dict


