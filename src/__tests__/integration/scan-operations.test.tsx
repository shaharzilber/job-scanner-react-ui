import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useScan, useScanProgress } from '@/hooks/useScan';
import { scanApi } from '@/api/scan.api';
import { createWrapper } from '@/test/utils/create-wrapper';
import { useScanStore } from '@/store/scanStore';
import { mockScanProgress } from '@/test/fixtures';
import { ScanStatus } from '@/types/scan.types';

// Mock the scan API
vi.mock('@/api/scan.api', () => ({
  scanApi: {
    startScan: vi.fn(),
    stopScan: vi.fn(),
    getScanProgress: vi.fn(),
  },
}));

describe('Scan Operations Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useScanStore.getState().reset();
    });
  });

  it('should start scan and poll progress updates', async () => {
    const mockScanResult = {
      scan_id: 'test-scan-id',
      scan_status: ScanStatus.INITIALIZING,
      started_at: '2024-01-15T10:00:00Z',
      total_jobs: 0,
    };

    vi.mocked(scanApi.startScan).mockResolvedValue(mockScanResult);
    vi.mocked(scanApi.getScanProgress).mockResolvedValue(mockScanProgress);

    // Render both hooks
    const { result: scanResult } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    const { result: progressResult } = renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    // Start scan
    act(() => {
      scanResult.current.startScan();
    });

    // Wait for scan to start
    await waitFor(() => {
      expect(scanResult.current.isScanning).toBe(true);
    });

    // Progress should start polling
    await waitFor(
      () => {
        expect(progressResult.current.progress).toBeDefined();
      },
      { timeout: 3000 }
    );

    expect(scanApi.getScanProgress).toHaveBeenCalled();
    expect(progressResult.current.progress).toEqual(mockScanProgress);
  });

  it('should update progress data every second', async () => {
    const mockScanResult = {
      scan_id: 'test-scan-id',
      scan_status: ScanStatus.SCRAPING,
      started_at: '2024-01-15T10:00:00Z',
      total_jobs: 0,
    };

    vi.mocked(scanApi.startScan).mockResolvedValue(mockScanResult);

    let callCount = 0;
    vi.mocked(scanApi.getScanProgress).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ...mockScanProgress,
        counts: {
          scraped: 10 + callCount * 5,
          filtered_in: 5 + callCount * 2,
          analyzed: callCount,
          cached: 0,
        },
      });
    });

    // Set scanning to true
    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    const { result } = renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    // Wait for first call
    await waitFor(() => {
      expect(result.current.progress?.counts.scraped).toBe(15);
    });

    // Wait for second call (after 1 second)
    await waitFor(
      () => {
        expect(result.current.progress?.counts.scraped).toBeGreaterThan(15);
      },
      { timeout: 2000 }
    );

    expect(scanApi.getScanProgress).toHaveBeenCalledTimes(2);
  });

  it('should stop scan mid-operation', async () => {
    const mockScanResult = {
      scan_id: 'test-scan-id',
      scan_status: ScanStatus.SCRAPING,
      started_at: '2024-01-15T10:00:00Z',
      total_jobs: 0,
    };

    vi.mocked(scanApi.startScan).mockResolvedValue(mockScanResult);
    vi.mocked(scanApi.getScanProgress).mockResolvedValue(mockScanProgress);
    vi.mocked(scanApi.stopScan).mockResolvedValue();

    const { result } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    // Start scan
    act(() => {
      result.current.startScan();
    });

    await waitFor(() => {
      expect(result.current.isScanning).toBe(true);
    });

    // Stop scan
    act(() => {
      result.current.stopScan();
    });

    await waitFor(() => {
      expect(result.current.isScanning).toBe(false);
    });

    expect(scanApi.stopScan).toHaveBeenCalledTimes(1);

    // State should be reset
    const scanState = useScanStore.getState();
    expect(scanState.progress).toBeNull();
  });

  it('should complete scan and stop polling', async () => {
    const mockScanResult = {
      scan_id: 'test-scan-id',
      scan_status: ScanStatus.SCRAPING,
      started_at: '2024-01-15T10:00:00Z',
      total_jobs: 0,
    };

    vi.mocked(scanApi.startScan).mockResolvedValue(mockScanResult);

    // First return in-progress, then completed
    const completedProgress = {
      ...mockScanProgress,
      scan_status: ScanStatus.COMPLETED,
    };

    vi.mocked(scanApi.getScanProgress)
      .mockResolvedValueOnce(mockScanProgress)
      .mockResolvedValue(completedProgress);

    // Set scanning to true
    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    // Wait for first progress (in-progress)
    await waitFor(() => {
      const scanState = useScanStore.getState();
      expect(scanState.progress).toBeDefined();
    });

    // Wait for second progress (completed) and scanning to stop
    await waitFor(
      () => {
        const scanState = useScanStore.getState();
        expect(scanState.isScanning).toBe(false);
        expect(scanState.progress?.scan_status).toBe(ScanStatus.COMPLETED);
      },
      { timeout: 3000 }
    );
  });

  it('should handle scan failure and set error', async () => {
    const failedProgress = {
      ...mockScanProgress,
      scan_status: ScanStatus.FAILED,
    };

    vi.mocked(scanApi.getScanProgress).mockResolvedValue(failedProgress);

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const scanState = useScanStore.getState();
      expect(scanState.isScanning).toBe(false);
      expect(scanState.error).toBe('Scan failed');
      expect(scanState.progress?.scan_status).toBe(ScanStatus.FAILED);
    });
  });

  it('should show progress with current job, counts, and sources', async () => {
    vi.mocked(scanApi.getScanProgress).mockResolvedValue(mockScanProgress);

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const scanState = useScanStore.getState();
      expect(scanState.progress).toBeDefined();
      expect(scanState.progress?.counts).toBeDefined();
    });

    const scanState = useScanStore.getState();

    // Verify progress data
    expect(scanState.progress?.current_job).toBeDefined();
    if (scanState.progress?.current_job) {
      expect(scanState.progress.current_job.position).toBe('Software Engineer');
      expect(scanState.progress.current_job.company).toBe('Tech Corp');
      expect(scanState.progress.current_job.source).toBe('Indeed');
      expect(scanState.progress.current_job.status).toBe('analyzing');
    }

    expect(scanState.progress?.counts).toEqual({
      scraped: 45,
      filtered_in: 23,
      analyzed: 10,
      cached: 5,
    });

    expect(scanState.progress?.sources).toHaveLength(2);
    expect(scanState.progress?.sources[0]).toEqual({
      name: 'LinkedIn',
      status: 'completed',
      jobs_found: 20,
    });
  });

  it('should handle start scan error', async () => {
    const mockError = {
      errorMessage: 'Server error',
    };

    vi.mocked(scanApi.startScan).mockRejectedValue(mockError);

    const { result } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startScan();
    });

    await waitFor(() => {
      const scanState = useScanStore.getState();
      expect(scanState.error).toBe('Server error');
      expect(scanState.isScanning).toBe(false);
    });
  });
});
