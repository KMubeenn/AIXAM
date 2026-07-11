import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

class TestTopicEvaluator:
    def __init__(self):
        # We use a fast model with low temperature for consistent extraction
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.1
        )
        
    async def evaluate_topic(self, test_data: dict, existing_topics: list) -> str:
        # Simplify the test data to prevent exceeding token limits
        simplified_data = []
        grades = test_data.get('grades', [])
        for g in grades:
            simplified_data.append({
                "question": g.get("question", ""),
                "correct_answer": g.get("correct_answer", "")
            })
            
        prompt = f"""You are an AI tasked with categorizing an academic test into a subject topic.
Here is a summary of the test questions the student just took:
{json.dumps(simplified_data)}

Here is a list of the student's existing topics:
{json.dumps(existing_topics)}

Your job:
1. Determine the core academic subject of this test in 1 to 4 words (e.g., 'Machine Learning', 'Biology', 'Python Programming').
2. CRITICAL: If the test heavily overlaps with or belongs to one of the 'existing topics', you MUST return that EXACT existing topic string. This ensures tests on the same subject group together properly.
3. If the test represents a totally new subject not in the existing topics, return the new topic string.
4. Output ONLY the topic string and nothing else. Do not include quotes, markdown, or punctuation.
"""
        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            topic = response.content.strip().strip("'").strip('"')
            
            if not topic:
                return "Mixed Topics"
            
            # Formatting: capital case it, unless it's exactly an existing topic (to prevent case mismatches)
            if topic in existing_topics:
                return topic
                
            # Check case-insensitive match just in case
            for existing in existing_topics:
                if existing.lower() == topic.lower():
                    return existing
                    
            # It's a brand new topic, title case it
            return topic.title()
        except Exception as e:
            print(f"[TestTopicEvaluator] Error: {e}")
            return "Mixed Topics"
