import json
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from langchain_core.runnables import RunnableConfig
from typing import List, Optional
from pydantic import BaseModel, Field

VALID_TEACHER_TASKS = [
    "assignment",
    "teacher_quiz",
    "slide_outline",
    "generate_pdf",
    "generate_docx",
    "generate_pptx"
]

class TeacherTaskStep(BaseModel):
    step: int = Field(..., description="Sequential step number starting from 1")
    task: str = Field(..., description='One of "assignment", "teacher_quiz", "slide_outline", "generate_pdf", "generate_docx", "generate_pptx"')
    depends_on: Optional[int] = Field(default=None, description="Step number that this task depends on, or null/None if independent")

class TeacherTools():
    @staticmethod
    @tool
    def plan_tasks(steps: List[TeacherTaskStep]):
        """CRITICAL: ONLY use this tool if the teacher explicitly asks to generate an assignment, a quiz, or slides. If the teacher asks a normal question, is greeting you, or having a general conversation, DO NOT use this tool and reply directly to them.

        Plan the tasks needed to fulfill the teacher's request.
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
        serialized_steps = [step.dict() for step in steps]
        return json.dumps(serialized_steps)


    @staticmethod
    def return_tools():
        return [
            TeacherTools.plan_tasks,
            TeacherTools.list_google_courses,
            TeacherTools.post_google_assignment,
            TeacherTools.post_google_announcement,
            TeacherTools.get_google_submissions
        ]

    @staticmethod
    def return_tool_node():
        return ToolNode(TeacherTools.return_tools())

    # ──────────────────────────────────────────────
    # GOOGLE CLASSROOM TOOLS
    # ──────────────────────────────────────────────
    
    @staticmethod
    @tool
    def list_google_courses(config: RunnableConfig) -> str:
        """
        List all Google Classroom courses the teacher is currently managing.
        Returns the course ID, name, and description.
        """
        try:
            from apps.users.models import User
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            user_id = config.get("configurable", {}).get("user_id")
            if not user_id: return "Error: User ID not found in context."
            user = User.objects.get(id=user_id)
            
            courses = ClassroomService.list_courses(user)
            return json.dumps(courses)
        except Exception as e:
            return f"Failed to list Google courses: {e}"

    @staticmethod
    @tool
    def post_google_assignment(course_id: str, title: str, description: str, max_points: str, config: RunnableConfig) -> str:
        """
        Create and publish a new assignment directly into a specific Google Classroom course.
        Args:
            course_id: The ID of the course (obtained via list_google_courses).
            title: Title of the assignment.
            description: Detailed instructions for the assignment.
            max_points: Max grade points as a string e.g. "100".
        """
        try:
            from apps.users.models import User
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            user_id = config.get("configurable", {}).get("user_id")
            if not user_id: return "Error: User ID not found in context."
            user = User.objects.get(id=user_id)
            
            result = ClassroomService.post_assignment(user, course_id, title, description, float(max_points))
            return f"Successfully created assignment! Details: {json.dumps(result)}"
        except Exception as e:
            return f"Failed to post assignment to Google Classroom: {e}"

    @staticmethod
    @tool
    def post_google_announcement(course_id: str, text: str, config: RunnableConfig) -> str:
        """
        Post a public announcement or message to the Google Classroom course stream.
        Args:
            course_id: The ID of the course.
            text: The announcement content.
        """
        try:
            from apps.users.models import User
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            user_id = config.get("configurable", {}).get("user_id")
            if not user_id: return "Error: User ID not found in context."
            user = User.objects.get(id=user_id)
            
            result = ClassroomService.post_announcement(user, course_id, text)
            return f"Announcement posted successfully. ID: {result.get('id')}"
        except Exception as e:
            return f"Failed to post announcement: {e}"

    @staticmethod
    @tool
    def get_google_submissions(course_id: str, coursework_id: str, config: RunnableConfig) -> str:
        """
        Fetch all student submissions for a specific assignment (coursework) in a Google Classroom.
        This provides the studentName, submission state, and assignedGrade. Useful BEFORE mass-grading.
        Args:
            course_id: The ID of the course.
            coursework_id: The ID of the assignment/coursework.
        """
        try:
            from apps.users.models import User
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            user_id = config.get("configurable", {}).get("user_id")
            if not user_id: return "Error: User ID not found in context."
            user = User.objects.get(id=user_id)
            
            submissions = ClassroomService.get_submissions(user, course_id, coursework_id)
            return json.dumps(submissions)
        except Exception as e:
            return f"Failed to fetch submissions: {e}"
