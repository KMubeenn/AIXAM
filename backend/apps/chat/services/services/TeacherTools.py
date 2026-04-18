import json
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

VALID_TEACHER_TASKS = [
    "assignment",
    "teacher_quiz",
    "slide_outline",
    "generate_pdf",
    "generate_docx",
    "generate_pptx"
]

class TeacherTools():
    @staticmethod
    @tool
    def plan_tasks(steps: list[dict]):
        """Plan the tasks needed to fulfill the teacher's request.
        Return a list of steps where each step is a dict with:
        - step: int (sequential step number starting from 1)
        - task: one of "assignment", "teacher_quiz", "slide_outline", "generate_pdf", "generate_docx", "generate_pptx"
        - depends_on: int or null. If this task needs the output of a previous step (e.g. exporting generated assignments as a PDF), set this to that step number. Otherwise null.

        Rules:
        - Steps execute in order.
        - If the user wants content exported as a document (e.g. "give me the assignment in PDF"), create the content step first, then a document step that depends on it.
        - If tasks are independent, set depends_on to null for both.
        - For a single simple task, return a list with one step.

        Examples:
        - "Create an assignment on databases" -> [{"step": 1, "task": "assignment", "depends_on": null}]
        - "Quiz on ML and export as PDF" -> [{"step": 1, "task": "teacher_quiz", "depends_on": null}, {"step": 2, "task": "generate_pdf", "depends_on": 1}]
        - "Create slides on neural networks as PPTX" -> [{"step": 1, "task": "slide_outline", "depends_on": null}, {"step": 2, "task": "generate_pptx", "depends_on": 1}]
        """
        return json.dumps(steps)

    @staticmethod
    def return_tools():
        return [TeacherTools.plan_tasks]

    @staticmethod
    def return_tool_node():
        return ToolNode(TeacherTools.return_tools())
