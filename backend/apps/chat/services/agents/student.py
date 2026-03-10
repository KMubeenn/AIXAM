from langchain.messages import SystemMessage
from apps.chat.services.agents.agent_state import BaseState,Document
from typing import TypedDict

from apps.chat.services.services.History import History
from apps.chat.services.services.Tools import AgentTools
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

class StudentState(BaseState,total=False):
    taskPrompt:SystemMessage
    flashcards:list[FlashCards]
    document:Document
    mock_test:list[GenerateMockTest]
    mock_test_grades:list[GradeMockTest]
    mcq_test:list[McqMockTest]


class StudentAgent():
    def __init__(self,temperature:float = 0.7):
        self.temperature=temperature
        self.llm=init_chat_model("groq:llama-3.3-70b-versatile",temperature=self.temperature).bind_tools(AgentTools.return_tools())
        self.memory=History()

    @staticmethod
    def task_prompt(input:list):
        pass
        # with open(Agent.system_prompt_path,'r',encoding='utf-8') as f:
        #     system_prompt=f.read().strip()

        # return SystemMessage(content=system_prompt)

    def conversation(self ,state : StudentState) ->StudentState:
        messages=[state['system_prompt']]+list(state['messages'])
        response=self.llm.invoke(messages)
        has_tool_calls =bool(getattr(response, "tool_calls", None))
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
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )

    def generate_mock_test(self,state:StudentState):
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )

    def generate_mcq_mock_test(self,state:StudentState):
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )

    

    def agent_builder(self)-> StateGraph:
        agent_builder=StateGraph(StudentState)
        agent_builder.add_node("llm_call",self.conversation)
        agent_builder.add_node('flashcards_node',self.generate_flashcards)
        agent_builder.add_node("mock_test_node",self.generate_mock_test)
        agent_builder.add_node('mcq_mock_test_node',self.generate_mcq_mock_test)
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
            'mcq_mock_test':'mcq_mock_test_node'
        }
        )
        agent_builder.add_edge("flashcards_node", END)
        agent_builder.add_edge("mock_test_node", END)
        agent_builder.add_edge("mcq_mock_test_node", END)

        agent=agent_builder.compile(checkpointer=self.memory)
        
        return agent
