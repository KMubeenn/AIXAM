from langchain.messages import SystemMessage
from agent_state import BaseState

class Document(TypedDict,total=False):
    title:str
    content:str
    format:str

class GenerateMockTest(TypedDict,total=False):
    id:int
    question:str

class GradeMockTest(GenerateMockTest,total=False):
    answer:str
    rag_context:str
    rubrics:str
    grades:str

class McqMockTest(TypedDict,total=False):
    id:int
    question:str
    options:dict
    answer:str

class FlashCards(TypedDict,total=False):
    id:int
    question:str
    answer:str

class StudentState(BaseState,total=False):
    taskPrompt:SystemMessage
    flashcards:list[FlashCards]
    document:Document
    mock_test:list[GenerateMockTest]
    mock_test_grades:list[GradeMockTest]
    mcq_test:list[McqMockTest]