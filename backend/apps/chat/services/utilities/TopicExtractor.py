import os
import re
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
            
            # 1. Define the banned words
            banned_words = ['flashcard', 'flashcards', 'quiz', 'quizzes', 'test', 'tests', 'assignment', 'document', 'pdf', 'general study']
            
            # 2. Create a case-insensitive regex pattern to strip only the banned words out
            pattern = re.compile(r'\b(?:' + '|'.join(banned_words) + r')\b', re.IGNORECASE)
            
            # 3. Remove banned words and any extra whitespace
            cleaned_topic = pattern.sub('', topic).strip()
            
            # 4. Remove any stray punctuation (like a trailing dash or colon) that might be left behind
            cleaned_topic = re.sub(r'^[^\w]+|[^\w]+$', '', cleaned_topic).strip()
            
            if cleaned_topic:
                # If we still have words left, return them nicely capitalized
                return cleaned_topic.title()
                
            # 5. If the topic is completely empty after cleaning
            lower_topic = topic.lower()
            if 'uploaded' in lower_topic or 'material' in lower_topic:
                return "Uploaded Material"
                
            return "Mixed Topics"
        except:
            return "Mixed Topics"
