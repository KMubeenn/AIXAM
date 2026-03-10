from typing import TypedDict
from apps.chat.services.agents.agent_state import BaseState,Document



class StudentGrades(TypedDict,total=False):
    id:int
    student_name:str
    class_name:str
    assignment_name:str
    marks:float



class TeacherState(BaseState,total=False):
    assignment:str
    generate_doc:Document
    grade_assignment:list[StudentGrades]



    
