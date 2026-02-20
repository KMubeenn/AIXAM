from langchain.messages import AnyMessage
from typing import TypedDict , Annotated
import operator

class AgentState(TypedDict , total=False):
    messages : Annotated[list[AnyMessage],operator.add]
    llm_calls : int 
    flashcards : dict
    assignment : dict
    grades : dict
    classroom : dict


