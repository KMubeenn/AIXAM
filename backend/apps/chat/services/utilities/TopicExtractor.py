import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.messages import SystemMessage, HumanMessage

class TopicExtractor:
    def __init__(self):
        # We use a fast, low-temperature model for extraction
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.1
        )
        self.prompt = SystemMessage(content=(
            "You are a topic extraction utility. "
            "Given a user's prompt or text, extract the core academic or domain topic in 1 to 4 words. "
            "CRITICAL RULES: "
            "1. Ignore conversational filler like 'give me a mock test on' or 'generate flashcards'. "
            "2. NEVER include document types or tool names in the topic (e.g., NEVER return 'Flashcards', 'Quiz', 'Assignment', 'Test', 'PDF', 'Document'). "
            "3. If the prompt is only asking to generate a document type without a specific subject (e.g. 'generate flashcards from the file'), return 'Uploaded Material' or the general field if obvious. "
            "Examples: 'Machine Learning', 'Python Basics', 'Neural Networks', 'Photosynthesis', 'World War II'."
        ))

    async def extract_topic(self, text: str) -> str:
        if not text or len(text.strip()) == 0:
            return "Mixed Topics"
        try:
            response = await self.llm.ainvoke([self.prompt, HumanMessage(content=text)])
            topic = response.content.strip().strip("'").strip('"')
            # If the model failed and still returned a banned word, clean it up
            lower_topic = topic.lower()
            if any(banned in lower_topic for banned in ['flashcard', 'quiz', 'test', 'assignment', 'document', 'pdf', 'general study']):
                if 'uploaded' in lower_topic or 'material' in lower_topic:
                    return "Uploaded Material"
                return "Mixed Topics"
            return topic if topic else "Mixed Topics"
        except:
            return "Mixed Topics"
