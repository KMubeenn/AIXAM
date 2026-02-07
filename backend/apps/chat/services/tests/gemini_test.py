from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key="AIzaSyA5fTJJALdT94HlYjLWbGwDZoyr-Di1g1s"
)

response = llm.invoke([
    HumanMessage(content="Explain LangChain in one sentence.")
])

print(response.content)
