import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJobs, useFilteredJobs } from '../useJobs';
import { jobsApi } from '@/api/jobs.api';
import { createWrapper } from '@/test/utils/create-wrapper';
import { mockJobs } from '@/test/fixtures';

// Mock the jobs API
vi.mock('@/api/jobs.api', () => ({
  jobsApi: {
    getAllJobs: vi.fn(),
    getStatusCounts: vi.fn(),
    updateJobStatus: vi.fn(),
    filterJobs: vi.fn(),
  },
}));

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch jobs successfully', async () => {
    vi.mocked(jobsApi.getAllJobs).mockResolvedValue(mockJobs);
    vi.mocked(jobsApi.getStatusCounts).mockResolvedValue({
      all: 10,
      favorite: 3,
      applied: 2,
      archive: 1,
    });

    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.jobs).toEqual([]);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.jobs).toEqual(mockJobs);
    expect(jobsApi.getAllJobs).toHaveBeenCalledTimes(1);
  });

  it('should fetch status counts', async () => {
    vi.mocked(jobsApi.getAllJobs).mockResolvedValue([]);
    vi.mocked(jobsApi.getStatusCounts).mockResolvedValue({
      all: 10,
      favorite: 3,
      applied: 2,
      archive: 1,
    });

    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.statusCounts).toEqual({
        all: 10,
        favorite: 3,
        applied: 2,
        archive: 1,
      });
    });

    expect(jobsApi.getStatusCounts).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch jobs');
    vi.mocked(jobsApi.getAllJobs).mockRejectedValue(mockError);
    vi.mocked(jobsApi.getStatusCounts).mockResolvedValue({
      all: 0,
      favorite: 0,
      applied: 0,
      archive: 0,
    });

    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // React Query will have the error
    expect(result.current.error).toBeDefined();
  });

  it('should update job status with mutation', async () => {
    vi.mocked(jobsApi.getAllJobs).mockResolvedValue(mockJobs);
    vi.mocked(jobsApi.getStatusCounts).mockResolvedValue({
      all: 10,
      favorite: 3,
      applied: 2,
      archive: 1,
    });
    vi.mocked(jobsApi.updateJobStatus).mockResolvedValue();

    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    // Wait for initial data
    await waitFor(() => {
      expect(result.current.jobs).toEqual(mockJobs);
    });

    // Update status
    result.current.updateStatus({
      jobKey: 'Tech Corp|Senior Full Stack Developer',
      status: 'favorite',
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    expect(jobsApi.updateJobStatus).toHaveBeenCalledWith(
      'Tech Corp|Senior Full Stack Developer',
      'favorite',
      undefined
    );
  });

  it('should invalidate queries after successful status update', async () => {
    vi.mocked(jobsApi.getAllJobs).mockResolvedValue(mockJobs);
    vi.mocked(jobsApi.getStatusCounts).mockResolvedValue({
      all: 10,
      favorite: 3,
      applied: 2,
      archive: 1,
    });
    vi.mocked(jobsApi.updateJobStatus).mockResolvedValue();

    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    // Wait for initial data
    await waitFor(() => {
      expect(result.current.jobs).toEqual(mockJobs);
    });

    // Clear previous calls
    vi.mocked(jobsApi.getAllJobs).mockClear();
    vi.mocked(jobsApi.getStatusCounts).mockClear();

    // Update status
    result.current.updateStatus({
      jobKey: 'Tech Corp|Senior Full Stack Developer',
      status: 'favorite',
    });

    // Wait for mutation to complete
    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    // Queries should be refetched
    await waitFor(() => {
      expect(jobsApi.getAllJobs).toHaveBeenCalled();
      expect(jobsApi.getStatusCounts).toHaveBeenCalled();
    });
  });

  it('should manually refetch jobs', async () => {
    vi.mocked(jobsApi.getAllJobs).mockResolvedValue(mockJobs);
    vi.mocked(jobsApi.getStatusCounts).mockResolvedValue({
      all: 10,
      favorite: 3,
      applied: 2,
      archive: 1,
    });

    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    // Wait for initial data
    await waitFor(() => {
      expect(result.current.jobs).toEqual(mockJobs);
    });

    // Clear call count
    vi.mocked(jobsApi.getAllJobs).mockClear();

    // Manual refetch
    await result.current.refetch();

    expect(jobsApi.getAllJobs).toHaveBeenCalledTimes(1);
  });

  it('should set isUpdating flag during mutation', async () => {
    vi.mocked(jobsApi.getAllJobs).mockResolvedValue(mockJobs);
    vi.mocked(jobsApi.getStatusCounts).mockResolvedValue({
      all: 10,
      favorite: 3,
      applied: 2,
      archive: 1,
    });

    // Delay the update to observe isUpdating flag
    vi.mocked(jobsApi.updateJobStatus).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    // Wait for initial data
    await waitFor(() => {
      expect(result.current.jobs).toEqual(mockJobs);
    });

    // Start mutation
    result.current.updateStatus({
      jobKey: 'Tech Corp|Senior Full Stack Developer',
      status: 'favorite',
    });

    // Should be updating
    await waitFor(() => {
      expect(result.current.isUpdating).toBe(true);
    });

    // Wait for completion
    await waitFor(
      () => {
        expect(result.current.isUpdating).toBe(false);
      },
      { timeout: 3000 }
    );
  });
});

describe('useFilteredJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch filtered jobs', async () => {
    vi.mocked(jobsApi.filterJobs).mockResolvedValue(mockJobs);

    const filters = {
      category: 'backend' as const,
      searchTerm: 'React',
      sortBy: 'recent' as const,
    };

    const { result } = renderHook(() => useFilteredJobs(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockJobs);
    });

    expect(jobsApi.filterJobs).toHaveBeenCalledWith(filters);
  });

  it('should handle filter changes', async () => {
    vi.mocked(jobsApi.filterJobs).mockResolvedValue(mockJobs);

    const initialFilters = {
      category: 'all' as const,
      searchTerm: '',
      sortBy: 'recent' as const,
    };

    const { result, rerender } = renderHook(
      ({ filters }) => useFilteredJobs(filters),
      {
        wrapper: createWrapper(),
        initialProps: { filters: initialFilters },
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockJobs);
    });

    // Clear call count
    vi.mocked(jobsApi.filterJobs).mockClear();

    // Change filters
    const newFilters = {
      category: 'backend' as const,
      searchTerm: 'TypeScript',
      sortBy: 'company' as const,
    };

    rerender({ filters: newFilters });

    await waitFor(() => {
      expect(jobsApi.filterJobs).toHaveBeenCalledWith(newFilters);
    });
  });
});
