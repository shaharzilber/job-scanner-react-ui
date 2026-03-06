import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { ScanProgress, ScanResult } from '@/types/scan.types';

export const scanApi = {
  // Start a new scan
  startScan: async (): Promise<ScanResult> => {
    const response = await apiClient.post<ApiResponse<ScanResult>>('/scan');
    if (!response.data) {
      throw new Error('Failed to start scan');
    }
    return response.data;
  },

  // Stop current scan
  stopScan: async (): Promise<void> => {
    await apiClient.post('/scan/stop');
  },

  // Get scan status
  getScanStatus: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/scan/status');
    return response.data;
  },

  // Get real-time progress (polled)
  getScanProgress: async (): Promise<ScanProgress> => {
    const response = await apiClient.get<ApiResponse<ScanProgress>>('/scan/progress');
    if (!response.data) {
      throw new Error('No progress data');
    }
    return response.data;
  },
};
