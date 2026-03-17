from langchain.messages import SystemMessage
from apps.chat.services.agents.agent_state import BaseState,Document
from typing import TypedDict
from pathlib import Path

from apps.chat.services.services.History import History
from apps.chat.services.services.Tools import AgentTools
from apps.chat.services.utilities.DocWriter import DocumentWriter
from langchain.messages import HumanMessage, AIMessageChunk
from langgraph.graph import StateGraph,START,END
from langchain.chat_models import init_chat_model

class GenerateMockTest(TypedDict,total=False):
    id:int
    question:str

class GradeMockTest(GenerateMockTest,total=False):
    answer:str
    rubrics:str
    grades:str

class McqMockTest(TypedDict,total=False):
    id:int
    question:str
    options:dict[str,str]
    answer:str

class FlashCards(TypedDict,total=False):
    id:int
    question:str
    answer:str

class FlashCardSet(TypedDict):
    cards:list[FlashCards]

class MockTestSet(TypedDict):
    questions:list[GenerateMockTest]

class McqTestSet(TypedDict):
    questions:list[McqMockTest]

class StudentState(BaseState,total=False):
    flashcards:list[FlashCards]
    document:Document
    mock_test:list[GenerateMockTest]
    mock_test_grades:list[GradeMockTest]
    mcq_test:list[McqMockTest]


class StudentAgent():
    PROMPT_DIR=Path(__file__).resolve().parent.parent / 'configs' / 'prompts'

    def __init__(self,temperature:float = 0.7):
        self.temperature=temperature
        base_llm=init_chat_model("groq:llama-3.3-70b-versatile",temperature=self.temperature)
        self.llm=base_llm.bind_tools(AgentTools.return_tools())
        self.flashcard_llm=base_llm.with_structured_output(FlashCardSet)
        self.mock_test_llm=base_llm.with_structured_output(MockTestSet)
        self.mcq_llm=base_llm.with_structured_output(McqTestSet)
        self.doc_llm=base_llm
        self.doc_writer=DocumentWriter()
        self.memory=History()

    @staticmethod
    def load_task_prompt(filename:str)->SystemMessage:
        prompt_path=StudentAgent.PROMPT_DIR / filename
        with open(prompt_path,'r',encoding='utf-8') as f:
            return SystemMessage(content=f.read().strip())

    def conversation(self ,state : StudentState) ->StudentState:
        messages=[state['system_prompt']]+list(state['messages'])
        response=self.llm.invoke(messages)
        return {"messages":response}

    def should_use_tool(self,state:StudentState):
        last_message=state['messages'][-1]
        if hasattr(last_message,'tool_calls') and last_message.tool_calls:
            return "call_tool"
        else:
            return "pass"

    def route_task(self,state:StudentState):
        last_message=state['messages'][-1]
        return last_message.content
    
    def generate_flashcards(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('flashcard_prompt.md')
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )
        result=self.flashcard_llm.invoke([state['system_prompt'],task_prompt,user_message])
        return {"flashcards":result['cards']}

    def generate_mock_test(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('mock_test_prompt.md')
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )
        result=self.mock_test_llm.invoke([state['system_prompt'],task_prompt,user_message])
        return {"mock_test":result['questions']}

    def generate_mcq_mock_test(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('mcq_test_prompt.md')
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )
        result=self.mcq_llm.invoke([state['system_prompt'],task_prompt,user_message])
        return {"mcq_test":result['questions']}

    

    def generate_document(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('document_prompt.md')
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )
        tool_message=state['messages'][-1]
        doc_format=tool_message.content.replace('generate_','')  # 'generate_pdf' → 'pdf'

        result=self.doc_llm.invoke([state['system_prompt'],task_prompt,user_message])
        content=result.content

        title=content.split('\n')[0].strip().lstrip('# ') if content else 'Document'
        file_path=self.doc_writer.write(title=title,content=content,format=doc_format)

        return {"document":{"title":title,"content":content,"format":doc_format,"file_path":file_path}}


    def agent_builder(self)-> StateGraph:
        agent_builder=StateGraph(StudentState)
        agent_builder.add_node("llm_call",self.conversation)
        agent_builder.add_node('flashcards_node',self.generate_flashcards)
        agent_builder.add_node("mock_test_node",self.generate_mock_test)
        agent_builder.add_node('mcq_mock_test_node',self.generate_mcq_mock_test)
        agent_builder.add_node('generate_document_node',self.generate_document)
        agent_builder.add_node("tool_node",AgentTools.return_tool_node())
        agent_builder.add_edge(START,"llm_call")
        agent_builder.add_conditional_edges("llm_call",
        self.should_use_tool,
        {
            "call_tool":"tool_node",
            "pass":END
        }
        )
        agent_builder.add_conditional_edges("tool_node",
        self.route_task,
        {
            'flashcards':'flashcards_node',
            'mock_test':'mock_test_node',
            'mcq_mock_test':'mcq_mock_test_node',
            'generate_pdf':'generate_document_node',
            'generate_docx':'generate_document_node',
            'generate_pptx':'generate_document_node'
        }
        )
        agent_builder.add_edge("flashcards_node", END)
        agent_builder.add_edge("mock_test_node", END)
        agent_builder.add_edge("mcq_mock_test_node", END)
        agent_builder.add_edge("generate_document_node", END)

        agent=agent_builder.compile(checkpointer=self.memory)
        
        return agent
