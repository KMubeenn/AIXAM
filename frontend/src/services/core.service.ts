import { api } from './api';

// ──────────────────────────────────────────────
// INTERFACES
// ──────────────────────────────────────────────

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  total_marks: number;
  course_id?: string;
  deadline: string;
  created_at: string;
  has_submissions?: boolean;
  is_graded?: boolean;
}

export interface Question {
  id: string;
  question: string;
  marks?: number;
  answer?: string;
  rubric?: string;
  options?: Record<string, string>;
}

export interface Quiz {
  id: string;
  title: string;
  quiz_type: string;
  question_count?: number;
  time_limit_minutes?: number;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizChoice {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  question_type: 'mcq' | 'descriptive';
  points: number;
  choices?: QuizChoice[];
}

export interface QuizDetail {
  id: string;
  title: string;
  quiz_type: string;
  time_limit_minutes: number;
  created_at: string;
  questions: QuizQuestion[];
}

export interface FlashcardCard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  source_type: string;
  topic: string;
  card_count: number;
  created_at: string;
}

export interface FlashcardSetDetail {
  id: string;
  title: string;
  source_type: string;
  topic: string;
  created_at: string;
  cards: FlashcardCard[];
}

export interface Material {
  id: string;
  title: string;
  file_type: string;
  origin_session_id?: string | null;
  origin_session_title?: string | null;
  content?: string;
  created_at: string;
}

export interface PerformanceStats {
  average_score: number;
  total_submissions: number;
  improvement_trend: string;
}

export interface Submission {
  id: string;
  quiz_title: string;
  quiz_id: string | null;
  score: number | null;
  question_count: number;
  submitted_at: string;
}

// ── Teacher-specific interfaces ──────────────────────────────
export interface TeacherQuiz {
  id: string;
  title: string;
  question_count: number;
  total_marks: number;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  student_id: string;
  student_name: string;
  score: number | null;
  feedback: string;
  is_late: boolean;
  submitted_at: string;
}

export interface BatchGradeDetail {
  student_name: string;
  question_id: number;
  marks: number;
  max_marks: number;
  feedback: string;
}

export interface BatchGrade {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  score: number | null;
  feedback: string;
  is_late: boolean;
  submitted_at: string;
  grading_details: BatchGradeDetail[];
}

export interface ClassReport {
  filename: string;
  mime_type: string;
  file_base64: string;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  description?: string;
  section?: string;
}

export interface ClassroomSubmission {
  id: string;
  userId: string;
  studentName: string;
  state: 'TURNED_IN' | 'RETURNED' | 'CREATED' | 'RECLAIMED_BY_STUDENT' | string;
  assignedGrade: number | null;
  hasAttachments: boolean;
}

export interface SubmissionContent {
  submission_id: string;
  content: string;
}

export interface PushGradeResult {
  message: string;
  result: {
    submission_id: string;
    assignedGrade: number;
    draftGrade: number | null;
    state: string;
  };
}

export interface GradingItem {
  question: string;
  student_answer: string;
  correct_answer?: string;
  marks: number;
  max_marks: number;
  feedback: string;
}

export interface SubmissionDetail {
  id: string;
  quiz_title: string;
  quiz_id: string | null;
  score: number | null;
  feedback: string;
  is_late: boolean;
  submitted_at: string;
  grading_details: GradingItem[];
}

// ──────────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────────

export const CoreService = {
  // ── Assignments ──────────────────────────────
  async getAssignments(): Promise<{ assignments: Assignment[] }> {
    const response = await api.get('/core/assignments/');
    return response.data;
  },

  async getAssignment(id: string): Promise<{ assignment: Assignment & { questions: Question[] } }> {
    const response = await api.get(`/core/assignments/${id}/`);
    return response.data;
  },

  async deleteAssignment(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/core/assignments/${id}/delete/`);
    return response.data;
  },


  // ── Flashcards ───────────────────────────────
  async getFlashcardSets(): Promise<{ flashcard_sets: FlashcardSet[] }> {
    const response = await api.get('/core/flashcards/');
    return response.data;
  },

  async getFlashcardSet(id: string): Promise<FlashcardSetDetail> {
    const response = await api.get(`/core/flashcards/${id}/`);
    return response.data;
  },

  async deleteFlashcardSet(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/core/flashcards/${id}/delete/`);
    return response.data;
  },

  // ── Quizzes ──────────────────────────────────
  async getQuizzes(): Promise<{ quizzes: Quiz[] }> {
    const response = await api.get('/core/quizzes/');
    return response.data;
  },

  async getQuizDetail(id: string): Promise<QuizDetail> {
    const response = await api.get(`/core/quizzes/${id}/`);
    return response.data;
  },

  async deleteQuiz(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/core/quizzes/${id}/delete/`);
    return response.data;
  },

  // ── Materials ────────────────────────────────
  async getMaterials(): Promise<{ materials: Material[] }> {
    const response = await api.get('/core/materials/');
    return response.data;
  },

  async deleteMaterial(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/core/materials/${id}/delete/`);
    return response.data;
  },

  async getMaterialDetail(id: string): Promise<Material> {
    const response = await api.get(`/core/materials/${id}/`);
    return response.data;
  },

  // ── Performance ──────────────────────────────
  async getPerformance(): Promise<{ performance: PerformanceStats }> {
    const response = await api.get('/core/performance/');
    return response.data;
  },

  // ── Submissions ──────────────────────────────
  async getSubmissions(): Promise<{ submissions: Submission[] }> {
    const response = await api.get('/core/submissions/');
    return response.data;
  },

  async getSubmissionDetail(id: string): Promise<SubmissionDetail> {
    const response = await api.get(`/core/submissions/${id}/`);
    return response.data;
  },

  async submitQuiz(quizId: string, score: number, feedback: string, gradingDetails?: any[]): Promise<{ id: string; message: string }> {
    const response = await api.post('/core/submissions/', {
      quiz_id: quizId,
      score,
      feedback,
      ...(gradingDetails ? { grading_details: gradingDetails } : {}),
    });
    return response.data;
  },

  async deleteSubmission(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/core/submissions/${id}/delete/`);
    return response.data;
  },

  // ── Teacher: Assignment Submissions ──────────
  async getAssignmentSubmissions(assignmentId: string): Promise<{ submissions: AssignmentSubmission[] }> {
    const response = await api.get(`/core/assignments/${assignmentId}/submissions/`);
    return response.data;
  },

  // ── Teacher: Quizzes ─────────────────────────
  async getTeacherQuizzes(): Promise<{ quizzes: TeacherQuiz[] }> {
    const response = await api.get('/core/teacher/quizzes/');
    return response.data;
  },

  // ── Teacher: Batch Grades ────────────────────
  async getBatchGrades(assignmentId: string): Promise<{ grades: BatchGrade[] }> {
    const response = await api.get(`/core/assignments/${assignmentId}/grades/`);
    return response.data;
  },

  // ── Teacher: Class Report PDF ────────────────
  async generateClassReport(assignmentId: string, gradesData?: object): Promise<ClassReport> {
    const response = await api.post(`/core/assignments/${assignmentId}/report/`, gradesData ? { grades_data: gradesData } : {});
    return response.data;
  },

  // ── Google Classroom ─────────────────────────
  async getClassroomCourses(): Promise<{ courses: ClassroomCourse[] }> {
    const response = await api.get('/core/classroom/courses/');
    return response.data;
  },

  async getClassroomCoursework(courseId: string): Promise<{ coursework: { id: string; title: string; maxPoints?: number }[] }> {
    const response = await api.get(`/core/classroom/courses/${courseId}/coursework/`);
    return response.data;
  },

  async getClassroomSubmissions(courseId: string, courseworkId: string): Promise<{ submissions: ClassroomSubmission[] }> {
    const response = await api.get(`/core/classroom/courses/${courseId}/coursework/${courseworkId}/submissions/`);
    return response.data;
  },

  async fetchSubmissionContent(courseId: string, courseworkId: string, submissionId: string): Promise<SubmissionContent> {
    const response = await api.get(`/core/classroom/courses/${courseId}/coursework/${courseworkId}/submissions/${submissionId}/content/`);
    return response.data;
  },

  async pushGradeToClassroom(courseId: string, courseworkId: string, submissionId: string, assignedGrade: number, draftGrade?: number): Promise<PushGradeResult> {
    const response = await api.post(
      `/core/classroom/courses/${courseId}/coursework/${courseworkId}/submissions/${submissionId}/grade/`,
      { assigned_grade: assignedGrade, ...(draftGrade !== undefined ? { draft_grade: draftGrade } : {}) }
    );
    return response.data;
  },

  async gradeLocalSubmission(submissionId: string, score: number, feedback: string): Promise<any> {
    const res = await api.post(`/core/submissions/${submissionId}/grade/`, { score, feedback });
    return res.data;
  },

  async postClassroomReport(assignmentId: string): Promise<any> {
    const res = await api.post(`/core/assignments/${assignmentId}/post-report/`);
    return res.data;
  },

  async postAssignmentToClassroom(
    assignmentId: string,
    courseIds: string[],
    overrides?: { title?: string; description?: string; max_points?: number }
  ): Promise<{ message: string; results: any[]; errors: any[] }> {
    const res = await api.post(`/core/assignments/${assignmentId}/post-to-classroom/`, {
      course_ids: courseIds,
      ...overrides,
    });
    return res.data;
  },

  async postQuizToClassroom(
    quizId: string,
    courseIds: string[],
    overrides?: { title?: string; description?: string; max_points?: number }
  ): Promise<{ message: string; results: any[]; errors: any[] }> {
    const res = await api.post(`/core/teacher/quizzes/${quizId}/post-to-classroom/`, {
      course_ids: courseIds,
      ...overrides,
    });
    return res.data;
  },

  // ── Teacher: Questions ───────────────────────
  async updateQuestion(
    questionId: string,
    data: { text?: string; points?: number }
  ): Promise<{ message: string }> {
    const res = await api.patch(`/core/questions/${questionId}/`, data);
    return res.data;
  },

  // ── Teacher: Analytics ───────────────────────
  async getTeacherAnalytics(): Promise<{
    assignment_count: number;
    quiz_count: number;
    total_submissions: number;
    class_average: number;
    strongest_topic: string;
    strongest_avg: number;
    weakest_topic: string;
    weakest_avg: number;
    topics: { topic: string; avg_score: number; student_count: number }[];
  }> {
    const response = await api.get('/core/teacher/analytics/');
    return response.data;
  },
};
