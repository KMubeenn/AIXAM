import os
import sys
from dotenv import load_dotenv
from pathlib import Path
import asyncio



backend_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
load_dotenv(backend_dir / ".env")
sys.path.insert(0,str(backend_dir))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


from apps.chat.services.agents.student import StudentAgent
from apps.chat.services.agents.teacher import TeacherState
from apps.chat.services.utilities.DocReader import DocumentReader
from langchain.messages import SystemMessage,HumanMessage,AIMessageChunk
from langchain.chat_models import init_chat_model


class Agent():
    system_prompt_path=Path(__file__).resolve().parent.parent / 'configs' / 'prompts' / 'system_prompt.md'

    def __init__(self,role:str,temperature:float=0.7):
        self.agent=StudentAgent(temperature) if role=='student' else StudentAgent(temperature)
        self.agent_graph=self.agent.agent_builder()
        self.confirmation_llm=init_chat_model("groq:llama-3.3-70b-versatile",temperature=0.7)
        self.history=[]
        self.document_context=None

    @staticmethod
    def build_prompt():
        with open(Agent.system_prompt_path,'r',encoding='utf-8') as f:
            system_prompt=f.read().strip()
        return SystemMessage(content=system_prompt)

    def load_history(self,history:list):
        self.history=history

    def load_document(self,file):
        reader=DocumentReader()
        chunks=reader.read(file,filename=file.name)
        self.document_context="\n\n".join(chunks)

    async def run(self,input:list,id:int,grade_test=False,test_submission=None):
        system_prompt=Agent.build_prompt()
        config={'configurable':{'thread_id':id}}

        messages=self.history+input

        if self.document_context:
            doc_message=HumanMessage(
                content=f"The user has uploaded a document with the following content:\n\n{self.document_context}"
            )
            messages=[doc_message]+messages

        state_input={'system_prompt':system_prompt,'messages':messages}
        if self.document_context:
            state_input['files_input']=self.document_context
        if grade_test and test_submission:
            state_input['grade_test']=True
            state_input['test_submission']=test_submission

        async for chunk in self.agent_graph.astream(
            state_input,
            config,
            stream_mode='messages'
        ):
            message,meta_data=chunk
            if (meta_data.get("langgraph_node")=="llm_call"
                and isinstance(message,AIMessageChunk)
                and message.content):
                yield {"type":"token","content":message.content}

        final_state=(await self.agent_graph.aget_state(config)).values

        task_done=[]
        if final_state.get('flashcards'):
            yield {"type":"flashcards","data":final_state['flashcards']}
            task_done.append("flashcards")
        if final_state.get('mock_test'):
            yield {"type":"mock_test","data":final_state['mock_test']}
            task_done.append("mock test")
        if final_state.get('mcq_test'):
            yield {"type":"mcq_test","data":final_state['mcq_test']}
            task_done.append("MCQ test")
        if final_state.get('document'):
            yield {"type":"document","data":final_state['document']}
            task_done.append(f"{final_state['document'].get('format','').upper()} document")
        if final_state.get('mock_test_grades'):
            yield {"type":"mock_test_grades","data":final_state['mock_test_grades']}
            task_done.append("test grading")

        if task_done:
            task_list=" and ".join(task_done)
            user_msg=next(
                msg for msg in reversed(input)
                if isinstance(msg,HumanMessage)
            )
            prompt=SystemMessage(
                content=f"You just successfully generated {task_list} for the user. "
                        f"Write a brief, friendly confirmation message in 1-2 sentences."
            )
            async for chunk in self.confirmation_llm.astream([prompt,user_msg]):
                if chunk.content:
                    yield {"type":"token","content":chunk.content}



if __name__=="__main__":
    agent_class=Agent(role='student')

    async def test():
        async for output in agent_class.run([HumanMessage(content="generate me a mock mcq test on llm topic")],1):
            if output["type"]=="token":
                print(output["content"],end="",flush=True)
            else:
                print(f"\n\n[{output['type']}]:",output["data"])

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


