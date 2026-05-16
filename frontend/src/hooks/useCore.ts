import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CoreService } from '../services/core.service';

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

export const useQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: () => CoreService.getQuizzes(),
  });
};

export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: () => CoreService.getMaterials(),
  });
};

export const usePerformance = () => {
  return useQuery({
    queryKey: ['performance'],
    queryFn: () => CoreService.getPerformance(),
  });
};

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: () => CoreService.getSubmissions(),
  });
};
