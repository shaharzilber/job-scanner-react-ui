import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scanApi } from '../scan.api';
import apiClient from '../client';
import { mockScanProgress } from '@/test/fixtures';
import { ScanStatus } from '@/types/scan.types';

// Mock the API client
vi.mock('../client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Scan API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startScan', () => {
    it('should call POST /scan', async () => {
      const mockResponse = {
        success: true,
        data: {
          scan_id: 'test-scan-id',
          scan_status: ScanStatus.INITIALIZING,
          started_at: '2024-01-15T10:00:00Z',
          total_jobs: 0,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await scanApi.startScan();

      expect(apiClient.post).toHaveBeenCalledWith('/scan');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when response data is missing', async () => {
      const mockResponse = {
        success: true,
        data: null,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(scanApi.startScan()).rejects.toThrow('Failed to start scan');
    });
  });

  describe('stopScan', () => {
    it('should call POST /scan/stop', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ success: true });

      await scanApi.stopScan();

      expect(apiClient.post).toHaveBeenCalledWith('/scan/stop');
    });
  });

  describe('getScanStatus', () => {
    it('should call GET /scan/status', async () => {
      const mockResponse = {
        success: true,
        data: {
          scan_status: ScanStatus.SCRAPING,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await scanApi.getScanStatus();

      expect(apiClient.get).toHaveBeenCalledWith('/scan/status');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return undefined when no status data', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await scanApi.getScanStatus();

      expect(result).toBeUndefined();
    });
  });

  describe('getScanProgress', () => {
    it('should call GET /scan/progress', async () => {
      const mockResponse = {
        success: true,
        data: mockScanProgress,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await scanApi.getScanProgress();

      expect(apiClient.get).toHaveBeenCalledWith('/scan/progress');
      expect(result).toEqual(mockScanProgress);
    });

    it('should throw error when response data is missing', async () => {
      const mockResponse = {
        success: true,
        data: null,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      await expect(scanApi.getScanProgress()).rejects.toThrow('No progress data');
    });
  });
});
