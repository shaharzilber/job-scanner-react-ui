import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useScan } from '../useScan';
import { scanApi } from '@/api/scan.api';
import { createWrapper } from '@/test/utils/create-wrapper';
import { useScanStore } from '@/store/scanStore';
import { ScanStatus } from '@/types/scan.types';

// Mock the scan API
vi.mock('@/api/scan.api', () => ({
  scanApi: {
    startScan: vi.fn(),
    stopScan: vi.fn(),
    getScanProgress: vi.fn(),
  },
}));

describe('useScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useScanStore.getState().reset();
    });
  });

  it('should start scan successfully', async () => {
    const mockScanResult = {
      scan_id: 'test-scan-id',
      scan_status: ScanStatus.INITIALIZING,
      started_at: '2024-01-15T10:00:00Z',
      total_jobs: 0,
    };

    vi.mocked(scanApi.startScan).mockResolvedValue(mockScanResult);

    const { result } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isScanning).toBe(false);
    expect(result.current.isStarting).toBe(false);

    // Start scan
    act(() => {
      result.current.startScan();
    });

    // Wait for mutation to complete and isScanning to be true
    await waitFor(() => {
      expect(result.current.isScanning).toBe(true);
    });

    expect(scanApi.startScan).toHaveBeenCalledTimes(1);
  });

  it('should set error on start failure', async () => {
    const mockError = {
      errorMessage: 'Failed to start scan',
    };

    vi.mocked(scanApi.startScan).mockRejectedValue(mockError);

    const { result } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    // Start scan
    act(() => {
      result.current.startScan();
    });

    await waitFor(() => {
      expect(result.current.isStarting).toBe(false);
    });

    const scanState = useScanStore.getState();
    expect(scanState.error).toBe('Failed to start scan');
    expect(scanState.isScanning).toBe(false);
  });

  it('should stop scan successfully', async () => {
    vi.mocked(scanApi.stopScan).mockResolvedValue();

    // Set initial scanning state
    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    const { result } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isScanning).toBe(true);

    // Stop scan
    act(() => {
      result.current.stopScan();
    });

    // Wait for mutation to complete and scanning to stop
    await waitFor(() => {
      expect(result.current.isScanning).toBe(false);
    });

    expect(scanApi.stopScan).toHaveBeenCalledTimes(1);

    // State should be reset
    const scanState = useScanStore.getState();
    expect(scanState.progress).toBeNull();
  });

  it('should set isStarting flag during start mutation', async () => {
    vi.mocked(scanApi.startScan).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isStarting).toBe(false);

    // Start scan
    act(() => {
      result.current.startScan();
    });

    // Should be starting
    await waitFor(() => {
      expect(result.current.isStarting).toBe(true);
    });

    // Wait for completion
    await waitFor(
      () => {
        expect(result.current.isStarting).toBe(false);
      },
      { timeout: 3000 }
    );
  });

  it('should set isStopping flag during stop mutation', async () => {
    vi.mocked(scanApi.stopScan).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    act(() => {
      useScanStore.setState({ isScanning: true });
    });

    const { result } = renderHook(() => useScan(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isStopping).toBe(false);

    // Stop scan
    act(() => {
      result.current.stopScan();
    });

    // Should be stopping
    await waitFor(() => {
      expect(result.current.isStopping).toBe(true);
    });

    // Wait for completion
    await waitFor(
      () => {
        expect(result.current.isStopping).toBe(false);
      },
      { timeout: 3000 }
    );
  });
});
