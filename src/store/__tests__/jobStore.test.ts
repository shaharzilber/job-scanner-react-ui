import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useJobStore } from '../jobStore';
import { mockJobs } from '@/test/fixtures';
import type { JobTrackingStatus } from '@/types/job.types';

describe('jobStore', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useJobStore.setState({
        jobs: [],
        selectedJob: null,
        filters: { category: 'all', searchTerm: '', sortBy: 'recent' },
        activeTab: 'all' as JobTrackingStatus,
        isLoading: false,
      });
    });
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useJobStore());

    expect(result.current.jobs).toEqual([]);
    expect(result.current.selectedJob).toBeNull();
    expect(result.current.filters).toEqual({
      category: 'all',
      searchTerm: '',
      sortBy: 'recent',
    });
    expect(result.current.activeTab).toBe('all');
    expect(result.current.isLoading).toBe(false);
  });

  it('should update jobs with setJobs', () => {
    const { result } = renderHook(() => useJobStore());

    act(() => {
      result.current.setJobs(mockJobs);
    });

    expect(result.current.jobs).toEqual(mockJobs);
    expect(result.current.jobs).toHaveLength(3);
  });

  it('should update selectedJob with setSelectedJob', () => {
    const { result } = renderHook(() => useJobStore());

    act(() => {
      result.current.setSelectedJob(mockJobs[0]);
    });

    expect(result.current.selectedJob).toEqual(mockJobs[0]);
    expect(result.current.selectedJob?.company).toBe('Tech Corp');
  });

  it('should clear selectedJob when set to null', () => {
    const { result } = renderHook(() => useJobStore());

    // Set a job first
    act(() => {
      result.current.setSelectedJob(mockJobs[0]);
    });

    expect(result.current.selectedJob).toBeDefined();

    // Clear it
    act(() => {
      result.current.setSelectedJob(null);
    });

    expect(result.current.selectedJob).toBeNull();
  });

  it('should merge filters with setFilters', () => {
    const { result } = renderHook(() => useJobStore());

    // Update category only
    act(() => {
      result.current.setFilters({ category: 'backend' });
    });

    expect(result.current.filters).toEqual({
      category: 'backend',
      searchTerm: '',
      sortBy: 'recent',
    });

    // Update searchTerm only
    act(() => {
      result.current.setFilters({ searchTerm: 'React' });
    });

    expect(result.current.filters).toEqual({
      category: 'backend',
      searchTerm: 'React',
      sortBy: 'recent',
    });

    // Update sortBy only
    act(() => {
      result.current.setFilters({ sortBy: 'company' });
    });

    expect(result.current.filters).toEqual({
      category: 'backend',
      searchTerm: 'React',
      sortBy: 'company',
    });
  });

  it('should update activeTab with setActiveTab', () => {
    const { result } = renderHook(() => useJobStore());

    act(() => {
      result.current.setActiveTab('favorite' as JobTrackingStatus);
    });

    expect(result.current.activeTab).toBe('favorite');

    act(() => {
      result.current.setActiveTab('applied' as JobTrackingStatus);
    });

    expect(result.current.activeTab).toBe('applied');
  });

  it('should update isLoading with setLoading', () => {
    const { result } = renderHook(() => useJobStore());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should persist activeTab and filters to localStorage', () => {
    const { result } = renderHook(() => useJobStore());

    // Update activeTab and filters
    act(() => {
      result.current.setActiveTab('favorite' as JobTrackingStatus);
      result.current.setFilters({ category: 'backend', searchTerm: 'React' });
    });

    // Check localStorage
    const persistedData = localStorage.getItem('job-scanner-storage');
    expect(persistedData).toBeTruthy();

    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      expect(parsed.state.activeTab).toBe('favorite');
      expect(parsed.state.filters).toEqual({
        category: 'backend',
        searchTerm: 'React',
        sortBy: 'recent',
      });
      // jobs and selectedJob should not be persisted
      expect(parsed.state.jobs).toBeUndefined();
      expect(parsed.state.selectedJob).toBeUndefined();
    }
  });

  it('should not persist jobs and selectedJob', () => {
    const { result } = renderHook(() => useJobStore());

    act(() => {
      result.current.setJobs(mockJobs);
      result.current.setSelectedJob(mockJobs[0]);
    });

    const persistedData = localStorage.getItem('job-scanner-storage');
    expect(persistedData).toBeTruthy();

    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      // Only activeTab and filters should be persisted
      expect(parsed.state.jobs).toBeUndefined();
      expect(parsed.state.selectedJob).toBeUndefined();
    }
  });
});
