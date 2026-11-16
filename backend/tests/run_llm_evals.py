import os
import sys
import asyncio
from langsmith import Client, evaluate
from dotenv import load_dotenv

# Setup Django environment so we can import our AI functions
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "configs.settings")
import django
django.setup()

from apps.chat.services.utilities.LLMRouter import invoke_with_fallback

client = Client()

# ==========================================
# 1. INSIGHTS EVALUATION
# ==========================================
insights_dataset = [
    {
        "inputs": {
            "student_performance_data": {
                "overall_accuracy": 45.5,
                "total_questions_attempted": 50,
                "subjects": [
                    {"name": "Machine Learning", "avg_score": 40.0, "topics": ["Neural Networks", "SVMs"]},
                    {"name": "Data Structures", "avg_score": 50.0, "topics": ["Arrays", "Trees"]}
                ]
            }
        },
        "outputs": {"expected_quality": "High"}
    }
]

insights_dataset_name = "AIXAM_FYP_Insights_Dataset"

def generate_insights_target(inputs: dict) -> dict:
    import json
    data = inputs["student_performance_data"]
    stats_str = f"Accuracy: {data['overall_accuracy']}%, Subjects: {[s['name'] for s in data['subjects']]}"
    
    prompt = f"""
    You are an AI academic advisor. Generate a highly structured JSON containing study insights based on these stats:
    {stats_str}
    
    Return ONLY a JSON object matching exactly this schema:
    {{
      "overall_summary": {{"accuracy": number, "questions_attempted": number}},
      "exam_readiness": {{"score": number, "status": string, "explanation": string}},
      "study_plan": [{{"timeframe": string, "task": string}}]
    }}
    """
    
    result = invoke_with_fallback(
        build_llm_fn=lambda llm: llm,
        messages=prompt
    )
    
    try:
        raw_text = result.content.strip()
        # Bulletproof JSON extraction: find first '{' and last '}'
        start_idx = raw_text.find('{')
        end_idx = raw_text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            raw_text = raw_text[start_idx:end_idx+1]
            
        parsed = json.loads(raw_text)
        return {"parsed_json": parsed, "raw_content": result.content}
    except Exception as e:
        return {"error": str(e), "raw_content": result.content}

def insights_evaluator(run, example) -> dict:
    output = run.outputs
    if "error" in output: return {"key": "valid_insights_json", "score": 0.0}
    json_data = output["parsed_json"]
    required_keys = ["overall_summary", "exam_readiness", "study_plan"]
    all_present = all(k in json_data for k in required_keys)
    return {"key": "valid_insights_json", "score": 1.0 if all_present else 0.0}

# ==========================================
# 2. FLASHCARD EVALUATION
# ==========================================
flashcard_dataset = [
    {
        "inputs": {"topic": "Photosynthesis process in biology"},
        "outputs": {"expected_quality": "High"}
    }
]

flashcard_dataset_name = "AIXAM_FYP_Flashcard_Dataset"

def generate_flashcard_target(inputs: dict) -> dict:
    from typing import TypedDict
    class FlashCards(TypedDict):
        question: str
        answer: str
    class FlashCardSet(TypedDict):
        cards: list[FlashCards]
        
    prompt = f"Generate 3 educational flashcards on the topic: {inputs['topic']}."
    
    try:
        result = invoke_with_fallback(
            build_llm_fn=lambda base: base.with_structured_output(FlashCardSet),
            messages=prompt
        )
        return {"parsed_json": result}
    except Exception as e:
        return {"error": str(e)}

def flashcard_evaluator(run, example) -> dict:
    output = run.outputs
    if "error" in output: return {"key": "valid_flashcards", "score": 0.0}
    cards = output.get("parsed_json", {}).get("cards", [])
    # Evaluate if it generated a list of cards with question and answer
    score = 1.0 if len(cards) > 0 and "question" in cards[0] and "answer" in cards[0] else 0.0
    return {"key": "valid_flashcards", "score": score}

# ==========================================
# 3. MOCK TEST EVALUATION
# ==========================================
mocktest_dataset = [
    {
        "inputs": {"topic": "Basic Python Programming"},
        "outputs": {"expected_quality": "High"}
    }
]

mocktest_dataset_name = "AIXAM_FYP_MockTest_Dataset"

def generate_mocktest_target(inputs: dict) -> dict:
    from typing import TypedDict
    class MCQ(TypedDict):
        question: str
        options: list[str]
        answer: str
    class MockTest(TypedDict):
        questions: list[MCQ]
        
    prompt = f"Generate a 3-question Multiple Choice mock test on: {inputs['topic']}."
    
    try:
        result = invoke_with_fallback(
            build_llm_fn=lambda base: base.with_structured_output(MockTest),
            messages=prompt
        )
        return {"parsed_json": result}
    except Exception as e:
        return {"error": str(e)}

def mocktest_evaluator(run, example) -> dict:
    output = run.outputs
    if "error" in output: return {"key": "valid_mocktest", "score": 0.0}
    qs = output.get("parsed_json", {}).get("questions", [])
    # Evaluate if it generated a list of MCQs with options
    score = 1.0 if len(qs) > 0 and "options" in qs[0] and len(qs[0]["options"]) > 1 else 0.0
    return {"key": "valid_mocktest", "score": score}

# ==========================================
# 4. DESCRIPTIVE MOCK TEST EVALUATION
# ==========================================
descriptive_mock_dataset = [
    {
        "inputs": {"topic": "The Causes of World War 1"},
        "outputs": {"expected_quality": "High"}
    }
]

descriptive_dataset_name = "AIXAM_FYP_Descriptive_Mock_Dataset"

def generate_descriptive_mock_target(inputs: dict) -> dict:
    from typing import TypedDict
    class GenerateMockTest(TypedDict):
        question: str
        points: int
    class MockTestSet(TypedDict):
        questions: list[GenerateMockTest]
        
    prompt = f"Generate a 3-question descriptive mock test on: {inputs['topic']}."
    
    try:
        result = invoke_with_fallback(
            build_llm_fn=lambda base: base.with_structured_output(MockTestSet),
            messages=prompt
        )
        return {"parsed_json": result}
    except Exception as e:
        return {"error": str(e)}

def descriptive_mock_evaluator(run, example) -> dict:
    output = run.outputs
    if "error" in output: return {"key": "valid_descriptive_test", "score": 0.0}
    qs = output.get("parsed_json", {}).get("questions", [])
    score = 1.0 if len(qs) > 0 and "question" in qs[0] and "points" in qs[0] else 0.0
    return {"key": "valid_descriptive_test", "score": score}

# ==========================================
# 5. ASSIGNMENT GENERATION EVALUATION
# ==========================================
assignment_dataset = [
    {
        "inputs": {"topic": "Object Oriented Programming Concepts"},
        "outputs": {"expected_quality": "High"}
    }
]

assignment_dataset_name = "AIXAM_FYP_Assignment_Dataset"

def generate_assignment_target(inputs: dict) -> dict:
    from typing import TypedDict
    class AssignmentQuestion(TypedDict):
        question: str
        marks: float
        rubric: str
    class GeneratedAssignment(TypedDict):
        title: str
        questions: list[AssignmentQuestion]
        
    prompt = f"Generate an assignment with 2 questions about: {inputs['topic']}."
    
    try:
        result = invoke_with_fallback(
            build_llm_fn=lambda base: base.with_structured_output(GeneratedAssignment),
            messages=prompt
        )
        return {"parsed_json": result}
    except Exception as e:
        return {"error": str(e)}

def assignment_evaluator(run, example) -> dict:
    output = run.outputs
    if "error" in output: return {"key": "valid_assignment", "score": 0.0}
    qs = output.get("parsed_json", {}).get("questions", [])
    score = 1.0 if len(qs) > 0 and "rubric" in qs[0] and "marks" in qs[0] else 0.0
    return {"key": "valid_assignment", "score": score}

# ==========================================
# UTILITY TO SETUP DATASETS
# ==========================================
def create_dataset_if_not_exists(name, data_list, desc):
    try:
        if not client.has_dataset(dataset_name=name):
            ds = client.create_dataset(dataset_name=name, description=desc)
            for data in data_list:
                client.create_example(inputs=data["inputs"], outputs=data["outputs"], dataset_id=ds.id)
    except Exception:
        pass

if __name__ == "__main__":
    print("Starting Comprehensive AIXAM LangSmith Evaluations...")
    
    create_dataset_if_not_exists(insights_dataset_name, insights_dataset, "Insights Dataset")
    create_dataset_if_not_exists(flashcard_dataset_name, flashcard_dataset, "Flashcard Dataset")
    create_dataset_if_not_exists(mocktest_dataset_name, mocktest_dataset, "Mock Test Dataset")
    create_dataset_if_not_exists(descriptive_dataset_name, descriptive_mock_dataset, "Descriptive Mock Test Dataset")
    create_dataset_if_not_exists(assignment_dataset_name, assignment_dataset, "Assignment Dataset")
    
    try:
        print("\n--- Evaluating Insights Generator ---")
        evaluate(
            generate_insights_target,
            data=insights_dataset_name,
            evaluators=[insights_evaluator],
            experiment_prefix="aixam-insights"
        )
        
        print("\n--- Evaluating Flashcard Generator ---")
        evaluate(
            generate_flashcard_target,
            data=flashcard_dataset_name,
            evaluators=[flashcard_evaluator],
            experiment_prefix="aixam-flashcards"
        )
        
        print("\n--- Evaluating MCQ Mock Test Generator ---")
        evaluate(
            generate_mocktest_target,
            data=mocktest_dataset_name,
            evaluators=[mocktest_evaluator],
            experiment_prefix="aixam-mcq-mocktest"
        )
        
        print("\n--- Evaluating Descriptive Mock Test Generator ---")
        evaluate(
            generate_descriptive_mock_target,
            data=descriptive_dataset_name,
            evaluators=[descriptive_mock_evaluator],
            experiment_prefix="aixam-descriptive-mocktest"
        )
        
        print("\n--- Evaluating Assignment Generator ---")
        evaluate(
            generate_assignment_target,
            data=assignment_dataset_name,
            evaluators=[assignment_evaluator],
            experiment_prefix="aixam-assignment"
        )
        
        print("\nAll Evaluations complete! Check your LangSmith dashboard.")
    except Exception as e:
        print(f"Evaluation failed: {e}")
