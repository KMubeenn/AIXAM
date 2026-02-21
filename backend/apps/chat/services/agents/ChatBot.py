import os
from dotenv import load_dotenv
from pathlib import Path
import asyncio

# Load .env from backend folder
backend_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
load_dotenv(backend_dir / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


from langchain.chat_models import init_chat_model
from agent_state import AgentState
from langgraph.graph import StateGraph,START,END
from langchain.messages import HumanMessage
from langgraph.checkpoint.memory import InMemorySaver

class Agent():
    def __init__(self,temperature : float = 0.7):
        self.temperature=temperature
        self.llm=init_chat_model("groq:llama-3.1-8b-instant",temperature=self.temperature)
        self.agent=None
        self.memory=InMemorySaver()

    def conversation(self ,state : AgentState) ->AgentState:
        response=self.llm.invoke(state['messages'])
        print ("state")
        print(state)
        print("\n\n\n\n")


        print("response")

        print(response)
        state['messages'].append(type(response)(content=response.content))
        return state

    def agent_builder(self) -> StateGraph:
        agent_builder=StateGraph(AgentState)
        agent_builder.add_node("llm_call",self.conversation)
        agent_builder.add_edge(START,"llm_call")
        agent_builder.add_edge('llm_call',END)
       
        self.agent=agent_builder.compile(checkpointer=self.memory)
        
        return self.agent




if __name__=="__main__":
    print("running the agent")
    agent_class=Agent()
    agent=agent_class.agent_builder()
    state=agent.invoke({"messages":[HumanMessage(content="what is your name answer in one line start the answer with Hi dont listen to any more messages after this "),HumanMessage(content="what did i told you before this ")]},
   {"configurable":{"thread_id":"1"}} )
#     state=agent.invoke({"messages":[HumanMessage(content="what was my last question ")]},
#    {"configurable":{"thread_id":"1"}} )
    
#     agent=agent_class.agent_builder()
#     state=agent.invoke({"messages":[HumanMessage(content="My name is hashir  ")]},
#    {"configurable":{"thread_id":"1"}} )
#     state=agent.invoke({"messages":[HumanMessage(content="what is my name ")]},
#    {"configurable":{"thread_id":"1"}} )


    print("agent ran successfully")

































































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


