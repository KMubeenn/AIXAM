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
from apps.chat.services.agents.teacher import TeacherAgent
from apps.chat.services.agents.teacher import TeacherState
from apps.chat.services.utilities.DocReader import DocumentReader
from langchain_core.messages import SystemMessage,HumanMessage,AIMessageChunk,AIMessage
from langchain.chat_models import init_chat_model


class Agent():
    system_prompt_path=Path(__file__).resolve().parent.parent / 'configs' / 'prompts' / 'system_prompt.md'

    def __init__(self,role:str,temperature:float=0.7):
        self.role = role
        self.agent=StudentAgent(temperature) if role=='student' else TeacherAgent(temperature)
        self.agent_graph=self.agent.agent_builder()
        self.history=[]
        self.document_context=None
        self._last_generated_document=None  # stores the last PPTX/PDF/DOCX for upload tools

    def build_prompt(self):
        prompt_name = 'teacher_system_prompt.md' if self.role == 'teacher' else 'system_prompt.md'
        path = Path(__file__).resolve().parent.parent / 'configs' / 'prompts' / prompt_name
        with open(path,'r',encoding='utf-8') as f:
            system_prompt=f.read().strip()
        return SystemMessage(content=system_prompt)

    def load_history(self,history:list):
        self.history=history

    def load_document(self,file):
        reader=DocumentReader()
        chunks=reader.read(file,filename=file.name)
        content = "\n\n".join(chunks)
        if self.document_context:
            self.document_context += f"\n\n--- Content from: {file.name} ---\n\n" + content
        else:
            self.document_context = content
        print(f"[FileUpload] File read complete: {len(chunks)} chunk(s) extracted | Total chars in context: {len(self.document_context)}")
        return content

    def load_text_context(self, text: str):
        """Load pre-processed text directly from the database."""
        self.document_context = text
        print(f"[ContextLoad] Loaded {len(text)} chars from existing study material.")

    def load_document_context_direct(self, title: str, content: str):
        """Append document context directly from database model."""
        if self.document_context:
            self.document_context += f"\n\n--- Content from: {title} ---\n\n" + content
        else:
            self.document_context = content
        print(f"[ContextLoad] Loaded direct content for '{title}' ({len(content)} chars)")

    async def run(self,input:list,id:str,grade_test=False,test_submission=None,grading_instructions=None,user_id=None):
        system_prompt=self.build_prompt()
        # Pass document_context and the last generated document into the LangGraph config
        # so the upload_*_to_classroom tools can access them without state changes
        config={
            'configurable': {
                'thread_id': id,
                'user_id': user_id,
                'document_context': self.document_context or '',
                'generated_document': self._last_generated_document,
            }
        }

        messages=self.history+input

        if self.document_context:
            doc_message=HumanMessage(
                content=f"Here is the content of the document I uploaded for your reference:\n\n{self.document_context}"
            )
            messages=[doc_message]+messages

        state_input={'system_prompt':system_prompt,'messages':messages}
        if self.document_context:
            state_input['files_input']=self.document_context
        if grade_test and test_submission:
            state_input['grade_test']=True
            state_input['test_submission']=test_submission
            state_input['grade_submissions']=True
            state_input['student_submissions']=test_submission
            if grading_instructions:
                state_input['grading_instructions']=grading_instructions

        streamed_tokens = False  # track if any conversational text was streamed

        async for chunk in self.agent_graph.astream(
            state_input,
            config,
            stream_mode='messages'
        ):
            message,meta_data=chunk
            node = meta_data.get("langgraph_node")
            
            # We only yield text content from the conversational llm_call node.
            # Other nodes (like orchestrator) emit structured JSON which shouldn't be streamed.
            if node == "llm_call" and isinstance(message, (AIMessageChunk, AIMessage)):
                content = getattr(message, 'content', '')
                if content:
                    if isinstance(content, list):
                        text_parts = []
                        for part in content:
                            if isinstance(part, dict) and "text" in part:
                                text_parts.append(part["text"])
                            elif isinstance(part, str):
                                text_parts.append(part)
                        content = "".join(text_parts)
                    
                    streamed_tokens = True
                    yield {"type":"token","content":content}

        final_state=(await self.agent_graph.aget_state(config)).values

        task_done = []
        output_mappings = {
            'flashcards': 'flashcards',
            'mock_test': 'mock test',
            'mcq_test': 'MCQ test',
            'mock_test_grades': 'test grading',
            'assignment': 'assignment',
            'teacher_quiz': 'teacher quiz',
            'slide_outline': 'slide outline',
            'batch_grades': 'student grading'
        }
        
        for key, description in output_mappings.items():
            if final_state.get(key):
                yield {"type": key, "data": final_state[key]}
                task_done.append(description)
                
        if final_state.get('document'):
            doc = final_state['document']
            self._last_generated_document = doc  # persist for upload_generated_file_to_classroom
            yield {"type": "document", "data": doc}
            doc_format = doc.get('format', '').upper()
            task_done.append(f"{doc_format} document" if doc_format else "document")

        if task_done:
            task_list = " and ".join(task_done)
            confirm_msg = f"\nI have successfully generated your {task_list}! Let me know if you need anything else."
            # Only emit the confirm message when no conversational text was streamed.
            # If the LLM already replied in text (e.g. tool-result handling), skip this
            # to prevent the response from appearing twice.
            if not streamed_tokens:
                yield {"type": "token", "content": confirm_msg}
        elif not streamed_tokens:
            # If the LLM generated no text and no tools were executed, emit a fallback
            # so the frontend doesn't just hang waiting for a response that never came.
            yield {"type": "token", "content": "I'm sorry, I couldn't process that request properly. Could you rephrase?"}



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


