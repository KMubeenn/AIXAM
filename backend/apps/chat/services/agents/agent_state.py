from langchain.messages import HumanMessage,AIMessage,SystemMessage
from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages

from typing import TypedDict , Annotated , Sequence
import operator

class BaseState(TypedDict , total=False):
    system_prompt : SystemMessage
    files_input : str
    messages : Annotated[Sequence[BaseMessage],add_messages]
    llm_calls : int 
    direct_task : str 
    # flashcards : dict
    # assignment : dict
    # grades : dict
    # classroom : dict
    # final_result : bool

    # ── Self-Correction Fields ───────────────────────────────────────────────
    retry_count : int       # Tracks validation attempts (max 3)
    error_feedback : str    # Detailed schema error message fed back to the LLM
    is_schema_valid : bool  # Flag indicating whether output conformed to schema


class Document(TypedDict,total=False):
    title:str
    content:str
    format:str
    filename:str
    file_base64:str
    mime_type:str



    



    

    



