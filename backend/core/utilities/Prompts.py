from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
    FewShotChatMessagePromptTemplate,
    MessagesPlaceholder
)
import os
from pathlib import Path


class ChatBotPrompts:
    """
    Centralized prompt management for the ChatBot.
    Loads prompts from markdown files in the prompts/ directory.
    """
    
    # Base directory for prompts
    PROMPTS_DIR = Path(__file__).parent.parent / "configs" / "prompts"
    
    @staticmethod
    def _load_prompt_file(filename: str) -> str:
        """
        Load a prompt from a markdown file.
        
        Args:
            filename: Name of the file in the prompts directory
            
        Returns:
            Content of the prompt file as a string
        """
        file_path = ChatBotPrompts.PROMPTS_DIR / filename
        if not file_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    
    @staticmethod
    def system_prompt() -> SystemMessagePromptTemplate:
        """Load the system prompt from system_prompt.md"""
        content = ChatBotPrompts._load_prompt_file("system_prompt.md")
        return SystemMessagePromptTemplate.from_template(content)

    @staticmethod
    def few_shot_prompt() -> FewShotChatMessagePromptTemplate:
        """
        Load few-shot examples from few_shot_examples.json.
        The JSON file contains structured examples with input/output pairs.
        """
        # Load examples from JSON file
        examples_file = ChatBotPrompts.PROMPTS_DIR / "few_shot_examples.json"
        if not examples_file.exists():
            raise FileNotFoundError(f"Few-shot examples file not found: {examples_file}")
        
        import json
        with open(examples_file, 'r', encoding='utf-8') as f:
            examples = json.load(f)

        example_prompt = ChatPromptTemplate.from_messages([
            HumanMessagePromptTemplate.from_template("{input}"),
            AIMessagePromptTemplate.from_template("{output}")
        ])

        return FewShotChatMessagePromptTemplate(
            example_prompt=example_prompt,
            examples=examples
        )

    @staticmethod
    def user_prompt() -> HumanMessagePromptTemplate:
        """Load the user query prompt from user_query.md"""
        content = ChatBotPrompts._load_prompt_file("user_query.md")
        return HumanMessagePromptTemplate.from_template(content)

    @staticmethod
    def uploaded_docs_context() -> SystemMessagePromptTemplate:
        """Load the uploaded docs context prompt from uploaded_docs_context.md"""
        content = ChatBotPrompts._load_prompt_file("uploaded_docs_context.md")
        return SystemMessagePromptTemplate.from_template(content)

    @staticmethod
    def history_intro() -> SystemMessagePromptTemplate:
        """Load the history introduction prompt from history_intro.md"""
        content = ChatBotPrompts._load_prompt_file("history_intro.md")
        return SystemMessagePromptTemplate.from_template(content)

    @staticmethod
    def build_prompt() -> ChatPromptTemplate:
        """
        Build the complete chat prompt template with all components.
        
        Order of messages:
        1. System prompt (role and instructions)
        2. Few-shot examples (demonstration of expected behavior)
        3. History introduction (context about chat history)
        4. Chat history (actual previous messages)
        5. Agent scratchpad (tool outputs and intermediate steps)
        6. User query (current question with context)
        
        Returns:
            Complete ChatPromptTemplate ready for use
        """
        return ChatPromptTemplate.from_messages([
            ChatBotPrompts.system_prompt(),
            ChatBotPrompts.few_shot_prompt(),
            ChatBotPrompts.history_intro(),
            MessagesPlaceholder(variable_name="chat_history"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
            ChatBotPrompts.uploaded_docs_context(),
            ChatBotPrompts.user_prompt(),
        ])


# For testing and verification
if __name__ == "__main__":
    print("Testing prompt loading...")
    
    try:
        prompt = ChatBotPrompts.build_prompt()
        print("✓ Successfully built complete prompt template")
        print(f"\n✓ System prompt loaded from: {ChatBotPrompts.PROMPTS_DIR / 'system_prompt.md'}")
        print(f"✓ User prompt loaded from: {ChatBotPrompts.PROMPTS_DIR / 'user_query.md'}")
        print(f"✓ History intro loaded from: {ChatBotPrompts.PROMPTS_DIR / 'history_intro.md'}")
        print(f"✓ Few-shot examples configured")
        print("\nAll prompts loaded successfully!")
    except Exception as e:
        print(f"✗ Error loading prompts: {e}")
