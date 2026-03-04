import os
import sys
from dotenv import load_dotenv
from pathlib import Path
import asyncio
import asyncio


# Load .env from backend folder
backend_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
load_dotenv(backend_dir / ".env")
sys.path.insert(0,str(backend_dir))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


from langchain.chat_models import init_chat_model
from apps.chat.services.agents.agent_state import AgentState
from langgraph.graph import StateGraph,START,END
from langchain.messages import HumanMessage, AIMessageChunk,SystemMessage
from langgraph.checkpoint.memory import InMemorySaver
from apps.chat.services.services.History import History
from apps.chat.services.services.Tools import AgentTools


class Agent():
    system_prompt_path='apps/chat/services/configs/prompts/system_prompt.md'
    def __init__(self,temperature : float = 0.7):
        self.temperature=temperature
        self.llm=init_chat_model("groq:llama-3.3-70b-versatile",temperature=self.temperature).bind_tools(AgentTools.return_tools())
        self.memory=History()
        self.agent=self.agent_builder()

    @staticmethod
    def build_prompt(input:list):
        with open(Agent.system_prompt_path,'r',encoding='utf-8') as f:
            system_prompt=f.read().strip()
        
        final_prompt=[SystemMessage(content=system_prompt)]+input

        return final_prompt

    def conversation(self ,state : AgentState) ->AgentState:
        response=self.llm.invoke(state['messages'])
        has_tool_calls =bool(getattr(response, "tool_calls", None))
        return {"messages":response,"final_result": not has_tool_calls}

    def should_use_tool(self,state:AgentState):
        last_message=state['messages'][-1]
        if hasattr(last_message,'tool_calls') and last_message.tool_calls:
            return "call_tool"
        else:
            return "pass"

    def route_task(self,state:AgentState):
        last_message=state['messages'][-1]
        return last_message.content
    
    def generate_flashcards(self,state:AgentState):
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )

    def generate_mock_test(self,state:AgentState):
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )

    def generate_mcq_mock_test(self,state:AgentState):
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )

    def agent_builder(self) -> StateGraph:
        agent_builder=StateGraph(AgentState)
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

    async def astream(self,input:list,id:int):
        final_prompt=Agent.build_prompt(input)
        async for chunk in self.agent.astream({'messages':final_prompt},
            {'configurable':{'thread_id':id}},
            stream_mode='messages'):
            message,meta_data=chunk
            if meta_data.get("langgraph_node") == "llm_call" and isinstance(message,AIMessageChunk) and message.content:
                yield message.content            

if __name__=="__main__":
    agent_class=Agent()
    async def test():
        async for token in agent_class.astream([HumanMessage(content="generate me flashcards 2 on topic llm")],1):
            print(token,end="",flush=True)
            
    print("running the agent")


  
    asyncio.run(test())

    print("")

































































# from langchain_groq import ChatGroq
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.runnables import ConfigurableFieldSpec, RunnableLambda, RunnablePassthrough
# from langchain_core.runnables.history import RunnableWithMessageHistory
# from langgraph.prebuilt import create_react_agent

# from apps.chat.services.services.SessionManager import SessionMemoryManager
# from apps.chat.services.services.Tools import MathTools
# from apps.chat.services.utilities.Prompts import ChatBotPrompts
# from apps.chat.services.agents.Rag import RAGPipeline
# from apps.chat.services.utilities.Streaming import QueueCallbackHandler
# from apps.chat.services.utilities.DocReader import DocumentReader


# from typing import List, Optional, Union, BinaryIO, TextIO
# from pathlib import Path



# class ChatBot():
#     def __init__(self, temperature: float = 0.7):
#         self.callback_handler = QueueCallbackHandler()
#         self.document_reader = DocumentReader()
#         self.tools = MathTools.get_tools()
#         self.llm = ChatGroq(
#             model="llama-3.1-8b-instant",
#             api_key=GROQ_API_KEY,
#             temperature=temperature,
#             streaming=True,
#             callbacks=[self.callback_handler],
#         )
#         self.session = SessionMemoryManager
#         self.chat_prompt = ChatBotPrompts.build_prompt()
#         self.rag_pipeline = RAGPipeline()
        
#         # Use the LLM directly with the prompt instead of deprecated agent
#         self.executor = self.chat_prompt | self.llm
#         self.pipeline = self.pipeline_config()
    
#     def read(self, file_input: Union[str, BinaryIO, TextIO], 
#             filename: Optional[str] = None) -> None:
#         """Ingest document into RAG pipeline."""
#         file_path = os.path.abspath(file_input) if isinstance(file_input, str) else file_input
#         if isinstance(file_input,str):
#             if not os.path.exists(file_path):
#                 raise FileNotFoundError(f"File not found: {file_path}") 
#         if filename:
#             self.rag_pipeline.set_docs_data(self.document_reader.read(file_input, filename))
#         else:
#             self.rag_pipeline.set_docs_data(self.document_reader.read(file_path))


    
#     def pipeline_config(self):
#         pipeline = RunnableWithMessageHistory(
#         runnable=RunnableLambda(self.rag_pipeline._retrieve_context) | self.executor,            
#         get_session_history=self.session.get_session,  
#         input_messages_key="question",           
#         history_messages_key="chat_history",  
#         history_factory_config=[
#             ConfigurableFieldSpec(
#                 id="session_id",
#                 annotation=str,
#                 name="Session ID",
#                 description="The session ID to use for chat history",
#                 default="id_default",
#             ),
#             ConfigurableFieldSpec(
#                 id="k",
#                 annotation=int,
#                 name="k",
#                 description="Number of messages to keep in memory",
#                 default=3,
#             )
#         ]
#     )
#         return pipeline

#     async def ask(self, query: str, session_id: str = "default", k: int = 4) -> str:
#         """Send a query and return the final output."""
#         result = await self.pipeline.ainvoke(
#             {"question": query},
#             config={"configurable": {"session_id": session_id, "k": k}}
#         )
#         # Handle both dict output (from AgentExecutor) and AIMessage output
#         if hasattr(result, 'content'):
#             return result.content
#         elif isinstance(result, dict) and "output" in result:
#             return result["output"]
#         else:
#             return str(result)
    
#     async def ask_stream(self, query: str, session_id: str = "default", k: int = 4):
#         self.callback_handler.clear()
#         async for event in self.pipeline.astream_events(
#             {"question": query},
#             config={"configurable": {"session_id": session_id, "k": k}},
#             version="v1"
#         ):
#             if event["event"] == "on_chat_model_stream":
#                 chunk = event["data"]["chunk"]
#                 if chunk and chunk.content:

#                     if isinstance(chunk.content, list):
#                         yield "".join(chunk.content)
#                     else:
#                         yield chunk.content





# if __name__ == "__main__":
#     import asyncio

    
#     async def test_streaming():
#         bot = ChatBot()
#         print("Streaming result:")
#         async for token in bot.ask_stream("hello", session_id="test_session", k=3):
#             print(token, end="", flush=True)
#         print() 
    
#     asyncio.run(test_streaming())


