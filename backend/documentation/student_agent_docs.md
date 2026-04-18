# AIXAM Student Agent Documentation

## Overview
The Student Agent is an interactive, memory-aware tutoring AI designed to assist users in active studying, practice retention, and instantaneous feedback analysis. Modeled as a learning companion, the Student Agent operates via LangGraph state pipelines tailored specifically towards generating studying materials from the user's provided context.

## Architecture & Lifecycle

1. **Chat Session Retrieval (`chat_service.py`)**:
   When a user signs in, their persistent `session_id` restores their chat history spanning multiple sessions from PostgreSQL. 
2. **Targeted Agent Configuration (`student.py`)**:
   Built on LangGraph, the `StudentAgent` uses the `StudentState` mapping. The runtime initializes specific bounded Groq Llama-3 sub-models, each fine-tuned iteratively on specific structured output configurations (`FlashCardSet`, `MockTestSet`).
3. **Execution Pipeline**:
   Similar to the Teacher, it utilizes `StudentTools` calling `plan_tasks` to decompose large study requests ("generate me a test and a flashcard deck") into mapped structural operations.
4. **Grading & Scoring Nodes**:
   If a user submits an answer to a previously generated mock test, the graph automatically delegates to the `grade_mock_test` conditional edge, generating targeted feedback on the exact questions rather than re-triggering standard conversation.

## Core Capabilities

### 1. Flashcard Generation
Extracts contextual entities, defining definitions and core concepts from the active knowledge base. Returning as `{"type": "flashcards"}`, the front-end renders these as interactive UI flipping cards.

### 2. Practice Mock Tests
Generates theoretical mock tests containing an array of detailed scenario questions to test the student's mastery of the active document or subject.

### 3. MCQ Assessments
Similar to mock tests, but firmly bounds the AI into generating structured JSON Multi-Choice configurations. The student can select options natively on the UI, and the app visually validates right/wrong automatically.

### 4. Immediate Conversational Grading
If the user uploads text responses or attempts to natively type an answer inside the chat frame to a generated Mock Test, the Student Agent isolates the `test_submission` inside the payload and automatically delegates a grading function giving score ratios and strict, supportive feedback.

### 5. Context Persistence (Study Materials)
Any document uploaded by a student via the file interface is immediately abstracted, sent through the context loader, and pinned as the conversational knowledge variable `study_material_id`. The context acts as the active ground truth for all subsequent mock tests and flashcard prompts without needing the LLM to process thousands of tokens repeatedly.
