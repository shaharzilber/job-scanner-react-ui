import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { Job, JobFilters, JobStatusCounts } from '@/types/job.types';

export const jobsApi = {
  // Get all jobs
  getAllJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get<ApiResponse<Job[]>>('/jobs/all') as any;
    return response.data || [];
  },

  // Get latest scan jobs
  getLatestJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get<ApiResponse<Job[]>>('/jobs/latest') as any;
    return response.data || [];
  },

  // Filter jobs (server-side)
  filterJobs: async (filters: JobFilters): Promise<Job[]> => {
    const response = await apiClient.post<ApiResponse<{ jobs: Job[] }>>('/jobs/filter', {
      category: filters.category,
      search: filters.searchTerm,
      sort_by: filters.sortBy,
    }) as any;
    return response.data?.jobs || [];
  },

  // Get status counts
  getStatusCounts: async (): Promise<JobStatusCounts> => {
    const response = await apiClient.get<ApiResponse<JobStatusCounts>>('/jobs/status/counts') as any;
    return response.data || { all: 0, favorite: 0, applied: 0, archive: 0 };
  },

  // Update job status
  updateJobStatus: async (jobKey: string, status: string, details?: Record<string, any>): Promise<void> => {
    await apiClient.put(`/jobs/${encodeURIComponent(jobKey)}/status`, {
      status,
      details,
    });
  },

  // Export to CSV
  exportCSV: (): void => {
    window.location.href = `${apiClient.defaults.baseURL}/export/csv`;
  },
};
