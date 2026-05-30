import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CoreService } from '../services/core.service';

// ── Assignments ───────────────────────────────────────────────────────────────

export const useAssignments = () => {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: () => CoreService.getAssignments(),
  });
};

export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => CoreService.getAssignment(id),
    enabled: !!id,
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CoreService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};

// ── Flashcards ────────────────────────────────────────────────────────────────

export const useFlashcardSets = () => {
  return useQuery({
    queryKey: ['flashcard-sets'],
    queryFn: () => CoreService.getFlashcardSets(),
  });
};

export const useFlashcardSet = (id: string | null) => {
  return useQuery({
    queryKey: ['flashcard-set', id],
    queryFn: () => CoreService.getFlashcardSet(id!),
    enabled: !!id,
  });
};

export const useDeleteFlashcardSet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CoreService.deleteFlashcardSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] });
    },
  });
};

// ── Quizzes ───────────────────────────────────────────────────────────────────

export const useQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: () => CoreService.getQuizzes(),
  });
};

export const useQuizDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['quiz-detail', id],
    queryFn: () => CoreService.getQuizDetail(id!),
    enabled: !!id,
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CoreService.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

// ── Materials ─────────────────────────────────────────────────────────────────

export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: () => CoreService.getMaterials(),
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CoreService.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

// ── Performance ───────────────────────────────────────────────────────────────

export const usePerformance = () => {
  return useQuery({
    queryKey: ['performance'],
    queryFn: () => CoreService.getPerformance(),
  });
};

// ── Submissions ───────────────────────────────────────────────────────────────

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: () => CoreService.getSubmissions(),
  });
};

export const useSubmissionDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['submission-detail', id],
    queryFn: () => CoreService.getSubmissionDetail(id!),
    enabled: !!id,
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId, score, feedback, gradingDetails,
    }: { quizId: string; score: number; feedback: string; gradingDetails?: any[] }) =>
      CoreService.submitQuiz(quizId, score, feedback, gradingDetails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};

export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CoreService.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};
