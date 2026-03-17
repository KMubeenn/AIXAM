from typing import TypedDict,Literal
from langchain.messages import SystemMessage
from apps.chat.services.agents.agent_state import BaseState,Document


class AssignmentQuestion(TypedDict,total=False):
    id:int
    question:str
    marks:float
    rubric:str

class GeneratedAssignment(TypedDict,total=False):
    title:str
    subject:str
    questions:list[AssignmentQuestion]
    format:Literal["pdf","docx"]
    file_path:str

class StudentSubmission(TypedDict,total=False):
    id:int
    student_name:str
    student_email:str
    submission_text:str
    submitted_at:str

class StudentGrade(TypedDict,total=False):
    id:int
    student_name:str
    question_id:int
    marks:float
    max_marks:float
    feedback:str

class ClassroomInfo(TypedDict,total=False):
    course_id:str
    course_name:str
    coursework_id:str
    posted:bool

class TeacherState(BaseState,total=False):
    assignment:GeneratedAssignment
    classroom:ClassroomInfo
    submissions:list[StudentSubmission]
    grades:list[StudentGrade]
