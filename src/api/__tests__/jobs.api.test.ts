import { describe, it, expect, beforeEach, vi } from 'vitest';
import { jobsApi } from '../jobs.api';
import apiClient from '../client';
import { mockJobs } from '@/test/fixtures';

// Mock the API client
vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    defaults: {
      baseURL: 'http://localhost:5000/api',
    },
  },
}));

describe('Jobs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllJobs', () => {
    it('should call GET /jobs/all', async () => {
      const mockResponse = {
        success: true,
        data: mockJobs,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await jobsApi.getAllJobs();

      expect(apiClient.get).toHaveBeenCalledWith('/jobs/all');
      expect(result).toEqual(mockJobs);
    });

    it('should return empty array when data is undefined', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await jobsApi.getAllJobs();

      expect(result).toEqual([]);
    });
  });

  describe('getLatestJobs', () => {
    it('should call GET /jobs/latest', async () => {
      const mockResponse = {
        success: true,
        data: mockJobs,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await jobsApi.getLatestJobs();

      expect(apiClient.get).toHaveBeenCalledWith('/jobs/latest');
      expect(result).toEqual(mockJobs);
    });

    it('should return empty array when data is undefined', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await jobsApi.getLatestJobs();

      expect(result).toEqual([]);
    });
  });

  describe('filterJobs', () => {
    it('should call POST /jobs/filter with filters', async () => {
      const mockResponse = {
        success: true,
        data: {
          jobs: mockJobs,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const filters = {
        category: 'backend' as const,
        searchTerm: 'React',
        sortBy: 'recent' as const,
      };

      const result = await jobsApi.filterJobs(filters);

      expect(apiClient.post).toHaveBeenCalledWith('/jobs/filter', {
        category: 'backend',
        search: 'React',
        sort_by: 'recent',
      });
      expect(result).toEqual(mockJobs);
    });

    it('should return empty array when data.jobs is undefined', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const filters = {
        category: 'all' as const,
        searchTerm: '',
        sortBy: 'recent' as const,
      };

      const result = await jobsApi.filterJobs(filters);

      expect(result).toEqual([]);
    });
  });

  describe('getStatusCounts', () => {
    it('should call GET /jobs/status/counts', async () => {
      const mockResponse = {
        success: true,
        data: {
          all: 10,
          favorite: 3,
          applied: 2,
          archive: 1,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await jobsApi.getStatusCounts();

      expect(apiClient.get).toHaveBeenCalledWith('/jobs/status/counts');
      expect(result).toEqual({
        all: 10,
        favorite: 3,
        applied: 2,
        archive: 1,
      });
    });

    it('should return default counts when data is undefined', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await jobsApi.getStatusCounts();

      expect(result).toEqual({
        all: 0,
        favorite: 0,
        applied: 0,
        archive: 0,
      });
    });
  });

  describe('updateJobStatus', () => {
    it('should call PUT /jobs/:jobKey/status', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ success: true });

      const jobKey = 'Tech Corp|Senior Developer';
      const status = 'favorite';

      await jobsApi.updateJobStatus(jobKey, status);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/jobs/Tech%20Corp%7CSenior%20Developer/status',
        {
          status: 'favorite',
          details: undefined,
        }
      );
    });

    it('should call PUT /jobs/:jobKey/status with details', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ success: true });

      const jobKey = 'Tech Corp|Senior Developer';
      const status = 'applied';
      const details = {
        applicationDate: '2024-01-15',
        recruiterName: 'John Doe',
      };

      await jobsApi.updateJobStatus(jobKey, status, details);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/jobs/Tech%20Corp%7CSenior%20Developer/status',
        {
          status: 'applied',
          details: {
            applicationDate: '2024-01-15',
            recruiterName: 'John Doe',
          },
        }
      );
    });
  });

  describe('exportCSV', () => {
    it('should set window.location.href to CSV endpoint', () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        href: '',
      };

      jobsApi.exportCSV();

      expect(window.location.href).toBe('http://localhost:5000/api/export/csv');

      // Restore
      window.location = originalLocation;
    });
  });
});
