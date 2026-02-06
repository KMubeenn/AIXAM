from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key="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"
)

response = llm.invoke([
    HumanMessage(content="Explain LangChain in one sentence.")
])

print(response.content)
