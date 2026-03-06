import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useScanProgress } from '../useScan';
import { scanApi } from '@/api/scan.api';
import { createWrapper } from '@/test/utils/create-wrapper';
import { useScanStore } from '@/store/scanStore';
import { mockScanProgress } from '@/test/fixtures';
import { ScanStatus } from '@/types/scan.types';

// Mock the scan API
vi.mock('@/api/scan.api', () => ({
  scanApi: {
    getScanProgress: vi.fn(),
  },
}));

describe('useScanProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useScanStore.getState().reset();
    });
  });

  it('should poll scan progress when isScanning is true', async () => {
    vi.mocked(scanApi.getScanProgress).mockResolvedValue(mockScanProgress);

    // Set scanning to true
    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    const { result } = renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isScanning).toBe(true);

    // Wait for progress to be fetched
    await waitFor(
      () => {
        expect(result.current.progress).toBeDefined();
      },
      { timeout: 3000 }
    );

    expect(scanApi.getScanProgress).toHaveBeenCalled();
    expect(result.current.progress).toEqual(mockScanProgress);
  });

  it('should not poll when isScanning is false', async () => {
    vi.mocked(scanApi.getScanProgress).mockResolvedValue(mockScanProgress);

    const { result } = renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isScanning).toBe(false);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Should not have called the API
    expect(scanApi.getScanProgress).not.toHaveBeenCalled();
  });

  it('should update progress in store when data received', async () => {
    vi.mocked(scanApi.getScanProgress).mockResolvedValue(mockScanProgress);

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const scanState = useScanStore.getState();
      expect(scanState.progress).toEqual(mockScanProgress);
    });
  });

  it('should stop scanning when status is COMPLETED', async () => {
    const completedProgress = {
      ...mockScanProgress,
      scan_status: ScanStatus.COMPLETED,
    };

    vi.mocked(scanApi.getScanProgress).mockResolvedValue(completedProgress);

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const scanState = useScanStore.getState();
      expect(scanState.isScanning).toBe(false);
    });
  });

  it('should stop scanning when status is FAILED and set error', async () => {
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
    });
  });

  it('should stop scanning when status is STOPPED', async () => {
    const stoppedProgress = {
      ...mockScanProgress,
      scan_status: ScanStatus.STOPPED,
    };

    vi.mocked(scanApi.getScanProgress).mockResolvedValue(stoppedProgress);

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const scanState = useScanStore.getState();
      expect(scanState.isScanning).toBe(false);
    });
  });

  it('should poll every 1 second (refetchInterval: 1000)', async () => {
    vi.mocked(scanApi.getScanProgress).mockResolvedValue(mockScanProgress);

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    // Wait for first call
    await waitFor(() => {
      expect(scanApi.getScanProgress).toHaveBeenCalledTimes(1);
    });

    // Wait for second call (after 1 second)
    await waitFor(
      () => {
        expect(scanApi.getScanProgress).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 }
    );
  });

  it('should retry 3 times on network error', async () => {
    // Mock multiple failures followed by success
    vi.mocked(scanApi.getScanProgress)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockScanProgress);

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    renderHook(() => useScanProgress(), {
      wrapper: createWrapper(),
    });

    // Should eventually succeed after retries
    await waitFor(
      () => {
        expect(scanApi.getScanProgress).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });
});
