import os
from dotenv import load_dotenv
from pathlib import Path
import asyncio

# Load .env from backend folder
backend_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(backend_dir / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import ConfigurableFieldSpec, RunnableLambda, RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory

from core.services.SessionManager import SessionMemoryManager
from core.services.Tools import MathTools
from core.utilities.Prompts import ChatBotPrompts
from core.agents.Rag import RAGPipeline
from core.utilities.Streaming import QueueCallbackHandler
from core.utilities.DocReader import DocumentReader


from typing import List, Optional, Union, BinaryIO, TextIO
from pathlib import Path



class ChatBot():
    def __init__(self, temperature: float = 0.7):
        self.callback_handler = QueueCallbackHandler()
        self.document_reader = DocumentReader()
        self.tools = MathTools.get_tools()
        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=GROQ_API_KEY,
            temperature=temperature,
            streaming=True,
            callbacks=[self.callback_handler],
        )
        self.session = SessionMemoryManager
        self.chat_prompt = ChatBotPrompts.build_prompt()
        self.rag_pipeline = RAGPipeline()
        
        # Use the LLM directly with the prompt instead of deprecated agent
        self.executor = self.chat_prompt | self.llm
        self.pipeline = self.pipeline_config()
    
    def read(self, file_input: Union[str, BinaryIO, TextIO], 
            filename: Optional[str] = None) -> None:
        """Ingest document into RAG pipeline."""
        file_path = os.path.abspath(file_input) if isinstance(file_input, str) else file_input
        if isinstance(file_input,str):
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}") 
        if filename:
            self.rag_pipeline.set_docs_data(self.document_reader.read(file_input, filename))
        else:
            self.rag_pipeline.set_docs_data(self.document_reader.read(file_path))


    
    def pipeline_config(self):
        pipeline = RunnableWithMessageHistory(
        runnable=RunnableLambda(self.rag_pipeline._retrieve_context) | self.executor,            
        get_session_history=self.session.get_session,  
        input_messages_key="question",           
        history_messages_key="chat_history",  
        history_factory_config=[
            ConfigurableFieldSpec(
                id="session_id",
                annotation=str,
                name="Session ID",
                description="The session ID to use for chat history",
                default="id_default",
            ),
            ConfigurableFieldSpec(
                id="k",
                annotation=int,
                name="k",
                description="Number of messages to keep in memory",
                default=3,
            )
        ]
    )
        return pipeline

    async def ask(self, query: str, session_id: str = "default", k: int = 4) -> str:
        """Send a query and return the final output."""
        result = await self.pipeline.ainvoke(
            {"question": query},
            config={"configurable": {"session_id": session_id, "k": k}}
        )
        # Handle both dict output (from AgentExecutor) and AIMessage output
        if hasattr(result, 'content'):
            return result.content
        elif isinstance(result, dict) and "output" in result:
            return result["output"]
        else:
            return str(result)
    
    async def ask_stream(self, query: str, session_id: str = "default", k: int = 4):
        self.callback_handler.clear()
        async for event in self.pipeline.astream_events(
            {"question": query},
            config={"configurable": {"session_id": session_id, "k": k}},
            version="v1"
        ):
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk and chunk.content:

                    if isinstance(chunk.content, list):
                        yield "".join(chunk.content)
                    else:
                        yield chunk.content





if __name__ == "__main__":
    import asyncio

    
    async def test_streaming():
        bot = ChatBot()
        print("Streaming result:")
        async for token in bot.ask_stream("hello", session_id="test_session", k=3):
            print(token, end="", flush=True)
        print() 
    
    asyncio.run(test_streaming())


