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
      queryClient.invalidateQueries({ queryKey: ['teacher-quizzes'] });
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

export const useMaterialDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['material-detail', id],
    queryFn: () => CoreService.getMaterialDetail(id!),
    enabled: !!id,
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

// ── Teacher: Assignment Submissions ──────────────────────────────────────────

export const useAssignmentSubmissions = (assignmentId: string | null) => {
  return useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: () => CoreService.getAssignmentSubmissions(assignmentId!),
    enabled: !!assignmentId,
  });
};

// ── Teacher: Quizzes ─────────────────────────────────────────────────────────

export const useTeacherQuizzes = () => {
  return useQuery({
    queryKey: ['teacher-quizzes'],
    queryFn: () => CoreService.getTeacherQuizzes(),
  });
};

// ── Teacher: Batch Grades ─────────────────────────────────────────────────────

export const useBatchGrades = (assignmentId: string | null) => {
  return useQuery({
    queryKey: ['batch-grades', assignmentId],
    queryFn: () => CoreService.getBatchGrades(assignmentId!),
    enabled: !!assignmentId,
  });
};

// ── Teacher: Class Report PDF ─────────────────────────────────────────────────

export const useGenerateClassReport = () => {
  return useMutation({
    mutationFn: ({ assignmentId, gradesData }: { assignmentId: string; gradesData?: object }) =>
      CoreService.generateClassReport(assignmentId, gradesData),
  });
};

// ── Google Classroom ──────────────────────────────────────────────────────────

export const useClassroomCourses = () => {
  return useQuery({
    queryKey: ['classroom-courses'],
    queryFn: () => CoreService.getClassroomCourses(),
    retry: false,
  });
};

export const useClassroomSubmissions = (courseId: string | null, courseworkId: string | null) => {
  return useQuery({
    queryKey: ['classroom-submissions', courseId, courseworkId],
    queryFn: () => CoreService.getClassroomSubmissions(courseId!, courseworkId!),
    enabled: !!courseId && !!courseworkId,
    retry: false,
  });
};

export const useFetchSubmissionContent = () => {
  return useMutation({
    mutationFn: ({
      courseId, courseworkId, submissionId,
    }: { courseId: string; courseworkId: string; submissionId: string }) =>
      CoreService.fetchSubmissionContent(courseId, courseworkId, submissionId),
  });
};

export const useAIGradeSubmission = () => {
  return useMutation({
    mutationFn: ({
      content, rubric, maxPoints,
    }: { content: string; rubric: string; maxPoints: number }) =>
      CoreService.aiGradeSubmission(content, rubric, maxPoints),
  });
};

export const usePushGrade = () => {
  return useMutation({
    mutationFn: ({
      courseId, courseworkId, submissionId, assignedGrade, draftGrade,
    }: {
      courseId: string;
      courseworkId: string;
      submissionId: string;
      assignedGrade: number;
      draftGrade?: number;
    }) =>
      CoreService.pushGradeToClassroom(courseId, courseworkId, submissionId, assignedGrade, draftGrade),
  });
};

export const usePostClassroomAnnouncement = () => {
  return useMutation({
    mutationFn: ({ courseId, text }: { courseId: string; text: string }) =>
      CoreService.postClassroomAnnouncement(courseId, text),
  });
};

export const useClassroomCoursework = (courseId: string | null) => {
  return useQuery({
    queryKey: ['classroom-coursework', courseId],
    queryFn: () => CoreService.getClassroomCoursework(courseId!),
    enabled: !!courseId,
  });
};

// ── Teacher: Analytics ─────────────────────────────────────────────────────────

export const useGradeLocalSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) =>
      CoreService.gradeLocalSubmission(submissionId, score, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['batch-grades'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};

export const usePostClassroomReport = () => {
  return useMutation({
    mutationFn: (assignmentId: string) => CoreService.postClassroomReport(assignmentId),
  });
};

export const usePostAssignmentToClassroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId, courseIds, overrides
    }: {
      assignmentId: string;
      courseIds: string[];
      overrides?: { title?: string; description?: string; max_points?: number; due_date?: string; due_time?: string };
    }) =>
      CoreService.postAssignmentToClassroom(assignmentId, courseIds, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};

export const usePostQuizToClassroom = () => {
  return useMutation({
    mutationFn: ({
      quizId, courseIds, overrides
    }: {
      quizId: string;
      courseIds: string[];
      overrides?: { title?: string; description?: string; max_points?: number; due_date?: string; due_time?: string };
    }) =>
      CoreService.postQuizToClassroom(quizId, courseIds, overrides),
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: { text?: string; points?: number } }) =>
      CoreService.updateQuestion(questionId, data),
    onSuccess: () => {
      // Invalidate relevant queries (e.g. assignment detail, quiz detail)
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
  });
};

export const useTeacherAnalytics = () => {
  return useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => CoreService.getTeacherAnalytics(),
  });
};

// ── Student: Analytics ────────────────────────────────────────────────────────

export const useStudentAnalytics = () => {
  return useQuery({
    queryKey: ['student-analytics'],
    queryFn: () => CoreService.getStudentAnalytics(),
  });
};

export const useGenerateInsights = () => {
  return useMutation({
    mutationFn: () => CoreService.generateStudentInsights(),
  });
};
