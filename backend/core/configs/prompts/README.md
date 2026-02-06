# Prompts Directory

This directory contains all prompt templates used by the LawBot chatbot system.

## Files

### `system_prompt.md`
The main system prompt that defines the AI assistant's role, behavior, and guidelines. This prompt:
- Establishes the AI as a legal assistant
- Defines tool usage rules
- Sets response guidelines
- Provides important disclaimers about legal advice

### `few_shot_examples.json`
Structured training examples showing the AI expected behavior:
- How to use mathematical tools silently
- Provide direct answers without narrating tool usage
- Handle general knowledge questions
- Respond to legal queries appropriately

These examples are in JSON format for easy editing while remaining machine-readable.

### `user_query.md`
Template for structuring user input with:
- The user's question
- Retrieved context from the RAG pipeline

### `history_intro.md`
Introduction text that precedes the chat history, helping the model distinguish between:
- Historical conversation context
- Few-shot training examples

## Usage

These markdown files are automatically loaded by `Prompts.py` using the `ChatBotPrompts` class. To modify prompts:

1. Edit the relevant `.md` file
2. The changes will be reflected when the backend reloads
3. Test the chatbot to ensure prompts work as expected

## Benefits of This Structure

✅ **Maintainability**: Prompts are separate from code logic  
✅ **Readability**: Markdown formatting makes prompts easy to read and edit  
✅ **Version Control**: Changes to prompts are tracked separately from code changes  
✅ **Collaboration**: Non-technical team members can edit prompts without touching Python code  
✅ **Documentation**: Prompts serve as self-documenting examples of AI behavior
