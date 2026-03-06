import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Job, JobFilters, JobTrackingStatus } from '@/types/job.types';

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  filters: JobFilters;
  activeTab: JobTrackingStatus;
  isLoading: boolean;

  // Actions
  setJobs: (jobs: Job[]) => void;
  setSelectedJob: (job: Job | null) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  setActiveTab: (tab: JobTrackingStatus) => void;
  setLoading: (loading: boolean) => void;
}

export const useJobStore = create<JobState>()(
  devtools(
    persist(
      (set) => ({
        jobs: [],
        selectedJob: null,
        filters: {
          category: 'all',
          searchTerm: '',
          sortBy: 'recent',
        },
        activeTab: 'all' as JobTrackingStatus,
        isLoading: false,

        setJobs: (jobs) => set({ jobs }),

        setSelectedJob: (job) => set({ selectedJob: job }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        setActiveTab: (tab) => set({ activeTab: tab }),

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'job-scanner-storage',
        partialize: (state) => ({
          activeTab: state.activeTab,
          filters: state.filters,
        }),
      }
    ),
    { name: 'JobStore' }
  )
);
