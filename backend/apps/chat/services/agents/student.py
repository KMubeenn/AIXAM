import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.messages import SystemMessage
from apps.chat.services.agents.agent_state import BaseState,Document
from typing import TypedDict
from pathlib import Path

from apps.chat.services.services.History import History
from apps.chat.services.services.StudentTools import StudentTools
from apps.chat.services.utilities.DocWriter import DocumentWriter
from apps.chat.services.utilities.LLMRouter import invoke_with_fallback
from langchain.messages import HumanMessage, AIMessageChunk
from langgraph.graph import StateGraph,START,END
from langchain.chat_models import init_chat_model

class GenerateMockTest(TypedDict,total=False):
    id:int
    question:str
    points:int

class GradeMockTest(TypedDict,total=False):
    id:int
    question:str
    student_answer:str
    correct_answer:str
    marks:float
    max_marks:float
    feedback:str

class McqMockTest(TypedDict,total=False):
    id:int
    question:str
    options:dict[str,str]
    answer:str

class FlashCards(TypedDict,total=False):
    id:int
    question:str
    answer:str

class FlashCardSet(TypedDict):
    cards:list[FlashCards]

class MockTestSet(TypedDict):
    questions:list[GenerateMockTest]

class McqTestSet(TypedDict):
    questions:list[McqMockTest]

class GradingResult(TypedDict):
    grades:list[GradeMockTest]
    total_marks:float
    max_total_marks:float
    overall_feedback:str

class StudentState(BaseState,total=False):
    flashcards:list[FlashCards]
    document:Document
    mock_test:list[GenerateMockTest]
    mock_test_grades:GradingResult
    mcq_test:list[McqMockTest]
    grade_test:bool
    test_submission:list[dict]
    grading_instructions:str


class StudentAgent():
    PROMPT_DIR=Path(__file__).resolve().parent.parent / 'configs' / 'prompts'

    def __init__(self,temperature:float = 0.7):
        self.temperature=temperature
        base_llm=ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=self.temperature
        )
        self.llm=base_llm.bind_tools(StudentTools.return_tools())
        self.doc_writer=DocumentWriter()
        self.memory=History()

    # ── LLM builder lambdas (used by LLMRouter) ───────────────────────────────
    def _tools_builder(self):      return lambda base: base.bind_tools(StudentTools.return_tools())
    def _flashcard_builder(self):  return lambda base: base.with_structured_output(FlashCardSet)
    def _mocktest_builder(self):   return lambda base: base.with_structured_output(MockTestSet)
    def _mcq_builder(self):        return lambda base: base.with_structured_output(McqTestSet)
    def _grading_builder(self):    return lambda base: base.with_structured_output(GradingResult)

    @staticmethod
    def load_task_prompt(filename:str)->SystemMessage:
        prompt_path=StudentAgent.PROMPT_DIR / filename
        with open(prompt_path,'r',encoding='utf-8') as f:
            return SystemMessage(content=f.read().strip())

    # ──────────────────────────────────────────────
    # GRAPH NODES
    # ──────────────────────────────────────────────

    def conversation(self,state:StudentState)->StudentState:
        messages=[state['system_prompt']]+list(state['messages'])
        if state.get('files_input'):
            file_context=SystemMessage(content=f"You have direct access to the contents of the user's uploaded document. You MUST read, reference, and summarize this text as requested. Do NOT state that you cannot open or read files, as the text has already been parsed and is provided to you below:\n\n{state['files_input']}")
            messages.insert(1,file_context)

        response = invoke_with_fallback(
            build_llm_fn=self._tools_builder(),
            messages=messages,
            temperature=self.temperature,
        )
        current_calls=state.get('llm_calls',0)
        return {"messages":response,"llm_calls":current_calls+1}

    def orchestrator(self,state:StudentState):
        tool_message=state['messages'][-1]
        plan=json.loads(tool_message.content)

        step_outputs={}
        results={}
        total_llm_calls=0

        try:
            for step in plan:
                task=step['task']
                dep=step.get('depends_on')
                source_data=step_outputs.get(dep)

                if task=='flashcards':
                    output=self._generate_flashcards(state)
                    step_outputs[step['step']]=output['flashcards']
                    results.update(output)
                    total_llm_calls+=1

                elif task=='mock_test':
                    output=self._generate_mock_test(state)
                    step_outputs[step['step']]=output['mock_test']
                    results.update(output)
                    total_llm_calls+=1

                elif task=='mcq_mock_test':
                    output=self._generate_mcq_mock_test(state)
                    step_outputs[step['step']]=output['mcq_test']
                    results.update(output)
                    total_llm_calls+=1

                elif task in ('generate_pdf','generate_docx','generate_pptx'):
                    doc_format=task.replace('generate_','')
                    if source_data:
                        output=self._export_as_document(source_data,doc_format,state)
                    else:
                        output=self._generate_document(state,doc_format)
                        total_llm_calls+=1
                    step_outputs[step['step']]=output['document']
                    results.update(output)

        except Exception as e:
            print(f"[StudentAgent] ❌ Orchestrator error: {e}")

        current_calls=state.get('llm_calls',0)
        results['llm_calls']=current_calls+total_llm_calls
        return results

    def grade_mock_test(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('grading_prompt.md')
        submission=state['test_submission']
        submission_text=HumanMessage(content=json.dumps(submission))
        messages=[state['system_prompt'],task_prompt]
        grading_instructions=state.get('grading_instructions')
        if grading_instructions:
            messages.append(SystemMessage(content=f"Additional grading instructions from the student:\n{grading_instructions}"))
        messages.append(submission_text)
        result = invoke_with_fallback(
            build_llm_fn=self._grading_builder(),
            messages=messages,
            temperature=self.temperature,
        )
        current_calls=state.get('llm_calls',0)
        return {"mock_test_grades":result,"llm_calls":current_calls+1}

    # ──────────────────────────────────────────────
    # ROUTING
    # ──────────────────────────────────────────────

    def entry_router(self,state:StudentState):
        if state.get('direct_task'):
            return "direct_task"
        if state.get('grade_test'):
            return "grade"
        return "conversation"

    def should_use_tool(self,state:StudentState):
        last_message=state['messages'][-1]
        if hasattr(last_message,'tool_calls') and last_message.tool_calls:
            return "call_tool"
        else:
            return "pass"

    def direct_task_node(self, state:StudentState):
        task = state.get('direct_task')
        current_calls = state.get('llm_calls', 0)
        results = {}
        
        try:
            if task == 'flashcards':
                results = self._generate_flashcards(state)
            elif task == 'mock_test':
                results = self._generate_mock_test(state)
            elif task == 'mcq_mock_test':
                results = self._generate_mcq_mock_test(state)
            results['llm_calls'] = current_calls + 1
        except Exception as e:
            print(f"[StudentAgent] ❌ Direct Task error: {e}")
            
        return results

    # ──────────────────────────────────────────────
    # TASK FUNCTIONS (called by orchestrator)
    # ──────────────────────────────────────────────

    def _build_task_messages(self,state:StudentState,task_prompt:SystemMessage):
        user_message=next(
            msg for msg in reversed(state['messages'])
            if isinstance(msg,HumanMessage)
        )
        messages=[state['system_prompt'],task_prompt]
        if state.get('files_input'):
            file_context=SystemMessage(content=f"The user has uploaded a document. Use its content as the source material:\n\n{state['files_input']}")
            messages.append(file_context)
        messages.append(user_message)
        return messages

    def _generate_flashcards(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('flashcard_prompt.md')
        messages=self._build_task_messages(state,task_prompt)
        result = invoke_with_fallback(self._flashcard_builder(), messages, self.temperature)
        return {"flashcards":result['cards']}

    def _generate_mock_test(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('mock_test_prompt.md')
        messages=self._build_task_messages(state,task_prompt)
        result = invoke_with_fallback(self._mocktest_builder(), messages, self.temperature)
        return {"mock_test":result['questions']}

    def _generate_mcq_mock_test(self,state:StudentState):
        task_prompt=StudentAgent.load_task_prompt('mcq_test_prompt.md')
        messages=self._build_task_messages(state,task_prompt)
        result = invoke_with_fallback(self._mcq_builder(), messages, self.temperature)
        return {"mcq_test":result['questions']}

    def _generate_document(self,state:StudentState,doc_format:str):
        task_prompt=StudentAgent.load_task_prompt('document_prompt.md')
        messages=self._build_task_messages(state,task_prompt)
        result = invoke_with_fallback(lambda base: base, messages, self.temperature)
        content=result.content
        title=content.split('\n')[0].strip().lstrip('# ') if content else 'Document'
        doc_result=self.doc_writer.write(title=title,content=content,format=doc_format)
        return {"document":{"title":title,"content":content,"format":doc_format,**doc_result}}

    def _export_as_document(self,source_data,doc_format:str,state:StudentState):
        if isinstance(source_data,list):
            lines=[]
            for item in source_data:
                if 'question' in item and 'options' in item:
                    lines.append(f"## Q{item.get('id','')}. {item['question']}")
                    for key,val in item['options'].items():
                        lines.append(f"- {key}) {val}")
                    lines.append(f"**Answer: {item.get('answer','')}**")
                    lines.append("")
                elif 'question' in item and 'answer' in item:
                    lines.append(f"## Q{item.get('id','')}. {item['question']}")
                    lines.append(f"**Answer:** {item['answer']}")
                    lines.append("")
                elif 'question' in item:
                    lines.append(f"## Q{item.get('id','')}. {item['question']}")
                    lines.append("")
            content='\n'.join(lines)
            title="Generated Content"
        else:
            content=str(source_data)
            title="Document"

        doc_result=self.doc_writer.write(title=title,content=content,format=doc_format)
        return {"document":{"title":title,"content":content,"format":doc_format,**doc_result}}

    # ──────────────────────────────────────────────
    # GRAPH BUILDER
    # ──────────────────────────────────────────────

    def agent_builder(self)-> StateGraph:
        agent_builder=StateGraph(StudentState)

        agent_builder.add_node("llm_call",self.conversation)
        agent_builder.add_node("tool_node",StudentTools.return_tool_node())
        agent_builder.add_node("orchestrator",self.orchestrator)
        agent_builder.add_node("grade_mock_test_node",self.grade_mock_test)
        agent_builder.add_node("direct_task_node",self.direct_task_node)

        agent_builder.add_conditional_edges(START,self.entry_router,{
            "conversation":"llm_call",
            "grade":"grade_mock_test_node",
            "direct_task":"direct_task_node"
        })

        agent_builder.add_conditional_edges("llm_call",self.should_use_tool,{
            "call_tool":"tool_node",
            "pass":END
        })

        agent_builder.add_edge("tool_node","orchestrator")
        agent_builder.add_edge("orchestrator",END)
        agent_builder.add_edge("grade_mock_test_node",END)
        agent_builder.add_edge("direct_task_node",END)

        agent=agent_builder.compile(checkpointer=self.memory)

        return agent
