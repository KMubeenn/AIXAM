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
  feedback: string;
  is_late: boolean;
  submitted_at: string;
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

  async getAssignmentSubmissions(id: string) {
    const response = await api.get(`/core/assignments/${id}/submissions/`);
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

  // ── Materials ────────────────────────────────
  async getMaterials(): Promise<{ materials: Material[] }> {
    const response = await api.get('/core/materials/');
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

  async submitQuiz(quizId: string, score: number, feedback: string): Promise<{ id: string; message: string }> {
    const response = await api.post('/core/submissions/', { quiz_id: quizId, score, feedback });
    return response.data;
  },
};
