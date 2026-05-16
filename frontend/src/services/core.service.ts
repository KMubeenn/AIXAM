import { api } from './api';

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
  id: number;
  question: string;
  marks?: number;
  answer?: string;
  rubric?: string;
  options?: Record<string, string>;
}

export interface Quiz {
  id: string;
  title: string;
  created_at: string;
  questions?: Question[];
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

export const CoreService = {
  // Assignments
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

  // Quizzes
  async getQuizzes(): Promise<{ quizzes: Quiz[] }> {
    const response = await api.get('/core/quizzes/');
    return response.data;
  },

  async getQuiz(id: string): Promise<{ quiz: Quiz }> {
    const response = await api.get(`/core/quizzes/${id}/`);
    return response.data;
  },

  // Materials
  async getMaterials(): Promise<{ materials: Material[] }> {
    const response = await api.get('/core/materials/');
    return response.data;
  },

  // Performance
  async getPerformance(): Promise<{ performance: PerformanceStats }> {
    const response = await api.get('/core/performance/');
    return response.data;
  },

  // Student Submissions
  async getSubmissions() {
    const response = await api.get('/core/submissions/');
    return response.data;
  }
};
