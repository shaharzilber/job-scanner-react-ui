import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/api/jobs.api';
import type { JobFilters } from '@/types/job.types';

export const useJobs = () => {
  const queryClient = useQueryClient();

  // Fetch all jobs
  const {
    data: jobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.getAllJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch status counts
  const { data: statusCounts } = useQuery({
    queryKey: ['job-status-counts'],
    queryFn: jobsApi.getStatusCounts,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobKey, status, details }: { jobKey: string; status: string; details?: Record<string, any> }) =>
      jobsApi.updateJobStatus(jobKey, status, details),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-status-counts'] });
    },
  });

  return {
    jobs,
    isLoading,
    error,
    statusCounts,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};

// Hook for filtered jobs (server-side filtering)
export const useFilteredJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', 'filtered', filters],
    queryFn: () => jobsApi.filterJobs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!filters,
  });
};
