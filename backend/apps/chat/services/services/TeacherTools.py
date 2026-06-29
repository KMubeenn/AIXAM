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
        - If the user wants to generate a document from arbitrary text, chat history, or an uploaded document (e.g. "generate my resume as a PDF"), schedule ONLY the `generate_pdf` (or `generate_docx`) task with `depends_on: null`.
        - If tasks are independent, set depends_on to null for both.
        - For a single simple task, return a list with one step.

        Examples:
        - "Create an assignment on databases" -> [{"step": 1, "task": "assignment", "depends_on": null}]
        - "Quiz on ML and export as PDF" -> [{"step": 1, "task": "teacher_quiz", "depends_on": null}, {"step": 2, "task": "generate_pdf", "depends_on": 1}]
        - "Turn my resume into a PDF" -> [{"step": 1, "task": "generate_pdf", "depends_on": null}]
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
            TeacherTools.get_google_submissions,
            TeacherTools.upload_document_to_classroom,
            TeacherTools.upload_generated_file_to_classroom,
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
        Returns a JSON list. IMPORTANT: Each item has a `course_id` field.
        You MUST use the `course_id` value (a numeric string like "123456789") when calling
        post_google_assignment. Do NOT use the course name as the course_id.
        """
        try:
            from apps.users.models import User
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            user_id = config.get("configurable", {}).get("user_id")
            if not user_id: return "Error: User ID not found in context."
            user = User.objects.get(id=user_id)
            
            courses = ClassroomService.list_courses(user)
            # Remap `id` -> `course_id` so the LLM always uses the correct field name
            labeled = [
                {
                    "course_id": c["id"],
                    "name": c["name"],
                    "description": c.get("description", "")
                }
                for c in courses
            ]
            return json.dumps(labeled)
        except Exception as e:
            return f"Failed to list Google courses: {e}"

    @staticmethod
    @tool
    def post_google_assignment(course_id: str, title: str, description: str, max_points: str, config: RunnableConfig) -> str:
        """
        Create and publish a new assignment directly into a specific Google Classroom course.
        CRITICAL: `course_id` must be the numeric ID string returned by list_google_courses
        in the `course_id` field (e.g. "123456789"). NEVER pass the course name as course_id.
        Always call list_google_courses first if you do not already have the course_id.
        Args:
            course_id: The numeric course_id (from list_google_courses `course_id` field).
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

    @staticmethod
    @tool
    def upload_document_to_classroom(
        course_id: str,
        title: str,
        description: str,
        max_points: str,
        config: RunnableConfig,
    ) -> str:
        """
        Upload the teacher's currently uploaded document to Google Classroom as an assignment attachment.
        Use this when the teacher has uploaded a file and wants to post it to a classroom course.
        CRITICAL: `course_id` must be the numeric ID from list_google_courses `course_id` field.
        Always call list_google_courses first if you don't have the course_id.
        Args:
            course_id: Numeric course_id from list_google_courses.
            title: Assignment title in Classroom.
            description: Assignment instructions.
            max_points: Maximum points as a string e.g. "100".
        """
        try:
            from apps.users.models import User
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            from apps.chat.services.utilities.DocWriter import DocumentWriter
            import base64

            user_id = config.get("configurable", {}).get("user_id")
            if not user_id:
                return "Error: User ID not found in context."
            user = User.objects.get(id=user_id)

            # Retrieve the document context stored in the configurable extras
            document_text = config.get("configurable", {}).get("document_context", "")
            if not document_text:
                return "Error: No document has been uploaded in this session. Please upload a file first."

            # Convert the text content to a DOCX in memory
            doc_writer = DocumentWriter()
            doc_result = doc_writer.write(title=title, content=document_text, format="docx")
            file_bytes = base64.b64decode(doc_result["file_base64"])
            filename = doc_result["filename"]
            mime_type = doc_result["mime_type"]

            # Upload to Drive
            drive_result = ClassroomService.upload_file_to_drive(user, filename, file_bytes, mime_type)

            # Create Classroom assignment with Drive attachment
            cw_result = ClassroomService.create_assignment_with_drive_attachment(
                user=user,
                course_id=course_id,
                title=title,
                description=description,
                max_points=float(max_points),
                drive_file_id=drive_result["drive_file_id"],
                drive_file_title=filename,
            )

            return json.dumps({
                "status": "success",
                "message": f"Document uploaded and posted as assignment '{title}' in Classroom.",
                "classroom_link": cw_result.get("alternateLink"),
                "coursework_id": cw_result.get("id"),
                "drive_file_url": drive_result["drive_file_url"],
            })
        except Exception as e:
            return f"Failed to upload document to Classroom: {e}"

    @staticmethod
    @tool
    def upload_generated_file_to_classroom(
        course_id: str,
        title: str,
        description: str,
        max_points: str,
        file_format: str,
        config: RunnableConfig,
    ) -> str:
        """
        Upload a file that was just generated (PPTX, PDF, or DOCX) to Google Classroom as an assignment.
        MUST be called AFTER plan_tasks has already generated the file (slide_outline + generate_pptx, etc.).
        The generated file is stored in the agent's state and this tool reads it from there.
        CRITICAL: `course_id` must be the numeric ID from list_google_courses `course_id` field.
        Args:
            course_id: Numeric course_id from list_google_courses.
            title: Assignment title in Classroom.
            description: Description / instructions for students.
            max_points: Maximum points as a string e.g. "100".
            file_format: One of "pptx", "pdf", "docx" — must match what was just generated.
        """
        try:
            from apps.users.models import User
            from apps.chat.services.utilities.ClassroomService import ClassroomService
            import base64

            user_id = config.get("configurable", {}).get("user_id")
            if not user_id:
                return "Error: User ID not found in context."
            user = User.objects.get(id=user_id)

            # The generated document is stored in configurable extras by the orchestrator
            document_info = config.get("configurable", {}).get("generated_document")
            if not document_info:
                return (
                    f"Error: No generated {file_format.upper()} found in this session. "
                    "Please generate the file first using plan_tasks, then call this tool."
                )

            file_bytes = base64.b64decode(document_info["file_base64"])
            filename = document_info["filename"]
            mime_type = document_info["mime_type"]

            # Upload to Drive
            drive_result = ClassroomService.upload_file_to_drive(user, filename, file_bytes, mime_type)

            # Create Classroom assignment with Drive attachment
            cw_result = ClassroomService.create_assignment_with_drive_attachment(
                user=user,
                course_id=course_id,
                title=title,
                description=description,
                max_points=float(max_points),
                drive_file_id=drive_result["drive_file_id"],
                drive_file_title=filename,
            )

            return json.dumps({
                "status": "success",
                "message": f"{file_format.upper()} uploaded and posted as assignment '{title}' in Classroom.",
                "classroom_link": cw_result.get("alternateLink"),
                "coursework_id": cw_result.get("id"),
                "drive_file_url": drive_result["drive_file_url"],
            })
        except Exception as e:
            return f"Failed to upload generated file to Classroom: {e}"
