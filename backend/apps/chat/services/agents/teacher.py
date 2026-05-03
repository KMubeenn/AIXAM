import json
from pathlib import Path
from typing import TypedDict, Literal

from langchain.messages import SystemMessage, HumanMessage
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END

from apps.chat.services.agents.agent_state import BaseState, Document
from apps.chat.services.services.TeacherTools import TeacherTools, VALID_TEACHER_TASKS
from apps.chat.services.utilities.DocWriter import DocumentWriter
from apps.chat.services.services.History import History


class AssignmentQuestion(TypedDict, total=False):
    id: int
    question: str
    marks: float
    rubric: str

class GeneratedAssignment(TypedDict, total=False):
    title: str
    subject: str
    total_marks: float
    questions: list[AssignmentQuestion]

class TeacherQuizQuestion(TypedDict, total=False):
    id: int
    question: str
    options: dict[str, str]
    answer: str
    points: int
    explanation: str

class TeacherQuizSet(TypedDict, total=False):
    questions: list[TeacherQuizQuestion]

class SlideContent(TypedDict, total=False):
    slide_number: int
    title: str
    bullet_points: list[str]
    speaker_notes: str

class SlideOutline(TypedDict, total=False):
    presentation_title: str
    slides: list[SlideContent]

class StudentGrade(TypedDict, total=False):
    student_id: str
    student_name: str
    question_id: int
    marks: float
    max_marks: float
    feedback: str

class BatchGradingResult(TypedDict, total=False):
    grades: list[StudentGrade]
    total_marks: float
    max_total_marks: float
    overall_feedback: str
    class_average: float

class TeacherState(BaseState, total=False):
    assignment: GeneratedAssignment
    teacher_quiz: list[TeacherQuizQuestion]
    slide_outline: SlideOutline
    document: Document
    batch_grades: BatchGradingResult
    grade_submissions: bool
    student_submissions: list[dict]
    grading_instructions: str
    deadline: str


class TeacherAgent:
    PROMPT_DIR = Path(__file__).resolve().parent.parent / 'configs' / 'prompts'

    def __init__(self, temperature: float = 0.7):
        self.temperature = temperature
        base_llm = init_chat_model("groq:llama-3.3-70b-versatile", temperature=self.temperature)
        self.llm = base_llm.bind_tools(TeacherTools.return_tools())
        
        self.assignment_llm = base_llm.with_structured_output(GeneratedAssignment)
        self.teacher_quiz_llm = base_llm.with_structured_output(TeacherQuizSet)
        self.slide_outline_llm = base_llm.with_structured_output(SlideOutline)
        self.grading_llm = base_llm.with_structured_output(BatchGradingResult)
        self.doc_llm = base_llm
        self.memory = History()

    @staticmethod
    def load_task_prompt(filename: str):
        prompt_path = TeacherAgent.PROMPT_DIR / filename
        if prompt_path.exists():
            return SystemMessage(content=prompt_path.read_text(encoding='utf-8'))
        return SystemMessage(content="You are a helpful teaching assistant.")

    def _build_task_messages(self, state: TeacherState, task_prompt: SystemMessage):
        messages = [state['system_prompt'], task_prompt]
        if state.get('files_input'):
            messages.append(SystemMessage(content=f"Context from uploaded materials:\n{state['files_input']}"))
        # Add user messages history
        messages.extend(state['messages'])
        return messages

    def entry_router(self, state: TeacherState):
        if state.get('grade_submissions'):
            return "grade"
        return "conversation"

    def llm_call(self, state: TeacherState):
        messages = [state['system_prompt']]
        if state.get('files_input'):
             messages.append(SystemMessage(content=f"Available Reference Material:\n{state.get('files_input')}"))
        messages.extend(state['messages'])
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.llm.invoke(messages)
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"[TeacherAgent] LLM call failed (attempt {attempt+1}/{max_retries}): {e}. Retrying...")
                    continue
                else:
                    print(f"[TeacherAgent] LLM call failed after {max_retries} attempts: {e}")
                    raise
        
        return {"messages": [response]}

    def should_use_tool(self, state: TeacherState):
        last_message = state['messages'][-1]
        if last_message.tool_calls:
            return "call_tool"
        return "pass"

    def grade_submissions_node(self, state: TeacherState):
        task_prompt = TeacherAgent.load_task_prompt('teacher_grading_prompt.md')
        submissions = state.get('student_submissions', [])
        grading_instructions = state.get('grading_instructions')

        messages = [state['system_prompt'], task_prompt]
        if grading_instructions:
            messages.append(SystemMessage(content=f"Additional grading rubrics/instructions:\n{grading_instructions}"))
        
        user_message = next(
            (msg for msg in reversed(state['messages']) if isinstance(msg, HumanMessage)),
            None
        )
        if user_message:
            messages.append(user_message)
            
        messages.append(HumanMessage(content=f"Assignment & Submissions Details to grade:\n{json.dumps(submissions)}"))
        
        result = self.grading_llm.invoke(messages)
        current_calls = state.get('llm_calls', 0)
        return {"batch_grades": result, "llm_calls": current_calls + 1}

    # Task generators
    def _generate_assignment(self, state: TeacherState):
        task_prompt = TeacherAgent.load_task_prompt('assignment_prompt.md')
        messages = self._build_task_messages(state, task_prompt)
        result = self.assignment_llm.invoke(messages)
        return {"assignment": result}

    def _generate_teacher_quiz(self, state: TeacherState):
        task_prompt = TeacherAgent.load_task_prompt('teacher_quiz_prompt.md')
        messages = self._build_task_messages(state, task_prompt)
        result = self.teacher_quiz_llm.invoke(messages)
        return {"teacher_quiz": result['questions']}

    def _generate_slide_outline(self, state: TeacherState):
        task_prompt = TeacherAgent.load_task_prompt('slide_outline_prompt.md')
        messages = self._build_task_messages(state, task_prompt)
        result = self.slide_outline_llm.invoke(messages)
        return {"slide_outline": result}

    def _generate_document(self, state: TeacherState, format_type: str):
        task_prompt = TeacherAgent.load_task_prompt('teacher_document_prompt.md')
        messages = self._build_task_messages(state, task_prompt)
        result = self.doc_llm.invoke(messages)
        content = result.content
        title = "Teacher_Document"
        doc_writer = DocumentWriter()
        return {"document": doc_writer.write(content, title, format_type)}

    def _export_as_document(self, source_data, format_type: str, state: TeacherState):
        if not source_data:
            return None
        title = "Export"
        if isinstance(source_data, dict):
            title = source_data.get('title', source_data.get('presentation_title', 'Teacher_Export'))
        
        # Need to format JSON data gracefully into string since DocWriter expects string content
        content = "## " + title + "\n\n"
        
        if 'questions' in source_data: # Assignment or Quiz
            for i, q in enumerate(source_data['questions']):
                content += f"**Q{i+1}.** {q.get('question')}\n"
                if 'marks' in q:
                    content += f"*[Marks: {q.get('marks')}]*\n"
                if 'points' in q:
                    content += f"*[Points: {q.get('points')}]*\n"
                if 'options' in q:
                    for opt_key, opt_val in q['options'].items():
                        content += f" - **{opt_key})** {opt_val}\n"
                    content += f"**Answer:** {q.get('answer')}\n"
                if 'rubric' in q:
                    content += f"**Rubric:** {q.get('rubric')}\n"
                if 'explanation' in q:
                    content += f"**Explanation:** {q.get('explanation')}\n"
                content += "\n"
        elif 'slides' in source_data: # Slides
            for slide in source_data['slides']:
                content += f"### Slide {slide.get('slide_number')}: {slide.get('title')}\n"
                for bp in slide.get('bullet_points', []):
                    content += f"- {bp}\n"
                content += f"**Speaker Notes:** {slide.get('speaker_notes')}\n\n"
                
        doc_writer = DocumentWriter()
        return {"document": doc_writer.write(content, title, format_type)}

    def orchestrator(self, state: TeacherState):
        llm_calls = state.get('llm_calls', 0)

        # Walk back through messages to find the last AIMessage with tool_calls
        from langchain.messages import AIMessage
        last_ai_message = None
        for msg in reversed(state['messages']):
            if isinstance(msg, AIMessage) and getattr(msg, 'tool_calls', None):
                last_ai_message = msg
                break

        if not last_ai_message:
            return {"llm_calls": llm_calls}

        tool_call = last_ai_message.tool_calls[0]
        if tool_call['name'] != "plan_tasks":
            return {"llm_calls": llm_calls}
            
        steps = tool_call['args'].get('steps', [])
        step_outputs = {}
        final_state = {}
        
        for step in steps:
            task = step['task']
            depends_on = step.get('depends_on')
            
            # Document generation/export
            if task in ['generate_pdf', 'generate_docx', 'generate_pptx']:
                doc_format = task.replace('generate_', '')
                if depends_on and depends_on in step_outputs:
                    # Exporting previously structured data
                    output = self._export_as_document(step_outputs[depends_on], doc_format, state)
                    if output:
                        final_state.update(output)
                        step_outputs[step['step']] = output['document']
                else:
                    # Generating freestanding document
                    output = self._generate_document(state, doc_format)
                    final_state.update(output)
                    step_outputs[step['step']] = output['document']
                    llm_calls += 1
            
            # Assignment
            elif task == 'assignment':
                output = self._generate_assignment(state)
                final_state.update(output)
                step_outputs[step['step']] = {"title": output['assignment'].get('title'), "questions": output['assignment'].get('questions', [])}
                llm_calls += 1
                
            # Teacher Quiz
            elif task == 'teacher_quiz':
                output = self._generate_teacher_quiz(state)
                final_state.update(output)
                step_outputs[step['step']] = {"title": "Teacher Quiz", "questions": output['teacher_quiz']}
                llm_calls += 1
                
            # Slide Outline
            elif task == 'slide_outline':
                output = self._generate_slide_outline(state)
                final_state.update(output)
                step_outputs[step['step']] = {"title": output['slide_outline'].get('presentation_title'), "slides": output['slide_outline'].get('slides', [])}
                llm_calls += 1
                
        final_state['llm_calls'] = llm_calls
        # Cleanup any unneeded conversational artifacts if tasks were planned
        if 'messages' in final_state:
            del final_state['messages']
            
        return final_state

    def after_tool_router(self, state: TeacherState):
        """After a tool runs, route plan_tasks to orchestrator and everything else back to llm_call."""
        from langchain.messages import AIMessage
        for msg in reversed(state['messages']):
            if isinstance(msg, AIMessage) and getattr(msg, 'tool_calls', None):
                tool_name = msg.tool_calls[0]['name']
                if tool_name == 'plan_tasks':
                    return "orchestrator"
                else:
                    return "llm_call"  # Let LLM read the tool result and respond
        return "orchestrator"

    def agent_builder(self):
        builder = StateGraph(TeacherState)

        # Nodes
        builder.add_node("llm_call", self.llm_call)
        builder.add_node("tool_node", TeacherTools.return_tool_node())
        builder.add_node("orchestrator", self.orchestrator)
        builder.add_node("grade_submissions_node", self.grade_submissions_node)

        # Routers & Edges
        builder.add_conditional_edges(START, self.entry_router, {
            "conversation": "llm_call",
            "grade": "grade_submissions_node"
        })
        
        builder.add_edge("grade_submissions_node", END)

        builder.add_conditional_edges("llm_call", self.should_use_tool, {
            "call_tool": "tool_node",
            "pass": END
        })

        builder.add_conditional_edges("tool_node", self.after_tool_router, {
            "orchestrator": "orchestrator",
            "llm_call": "llm_call"
        })
        builder.add_edge("orchestrator", END)

        return builder.compile(checkpointer=self.memory)
