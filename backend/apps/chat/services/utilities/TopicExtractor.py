from langchain.chat_models import init_chat_model
from langchain.messages import SystemMessage, HumanMessage

class TopicExtractor:
    def __init__(self):
        # We use a fast, low-temperature model for extraction
        self.llm = init_chat_model("groq:llama-3.1-8b-instant", temperature=0.1)
        self.prompt = SystemMessage(content=(
            "You are a topic extraction utility. "
            "Given a user's prompt or text, extract the core academic or structural topic in 1 to 4 words. "
            "Ignore conversational filler like 'give me a mock test on'. Output ONLY the topic and nothing else. "
            "Examples: 'Machine Learning', 'Python Basics', 'Neural Networks', 'Photosynthesis', 'World War II'."
        ))

    async def extract_topic(self, text: str) -> str:
        if not text or len(text.strip()) == 0:
            return "General Study"
        try:
            response = await self.llm.ainvoke([self.prompt, HumanMessage(content=text)])
            topic = response.content.strip().strip("'").strip('"')
            return topic if topic else "General Study"
        except:
            return "General Study"
