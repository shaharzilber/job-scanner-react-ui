import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useScanStore } from '../scanStore';
import { mockScanProgress } from '@/test/fixtures';

describe('scanStore', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useScanStore.getState().reset();
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useScanStore());

    expect(result.current.isScanning).toBe(false);
    expect(result.current.progress).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should update isScanning with setScanning', () => {
    const { result } = renderHook(() => useScanStore());

    act(() => {
      result.current.setScanning(true);
    });

    expect(result.current.isScanning).toBe(true);

    act(() => {
      result.current.setScanning(false);
    });

    expect(result.current.isScanning).toBe(false);
  });

  it('should update progress with setProgress', () => {
    const { result } = renderHook(() => useScanStore());

    act(() => {
      result.current.setProgress(mockScanProgress);
    });

    expect(result.current.progress).toEqual(mockScanProgress);
    expect(result.current.progress?.scan_status).toBe('scraping');
    expect(result.current.progress?.counts.scraped).toBe(45);
  });

  it('should clear progress when set to null', () => {
    const { result } = renderHook(() => useScanStore());

    // Set progress first
    act(() => {
      result.current.setProgress(mockScanProgress);
    });

    expect(result.current.progress).toBeDefined();

    // Clear progress
    act(() => {
      result.current.setProgress(null);
    });

    expect(result.current.progress).toBeNull();
  });

  it('should update error with setError', () => {
    const { result } = renderHook(() => useScanStore());

    act(() => {
      result.current.setError('Scan failed');
    });

    expect(result.current.error).toBe('Scan failed');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset all state with reset', () => {
    const { result } = renderHook(() => useScanStore());

    // Set some state
    act(() => {
      result.current.setScanning(true);
      result.current.setProgress(mockScanProgress);
      result.current.setError('Some error');
    });

    expect(result.current.isScanning).toBe(true);
    expect(result.current.progress).toBeDefined();
    expect(result.current.error).toBe('Some error');

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.isScanning).toBe(false);
    expect(result.current.progress).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should not persist state to localStorage', () => {
    const { result } = renderHook(() => useScanStore());

    // Set some state
    act(() => {
      result.current.setScanning(true);
      result.current.setProgress(mockScanProgress);
    });

    // Check that nothing is persisted (no scan-storage key)
    const persistedData = localStorage.getItem('scan-storage');
    expect(persistedData).toBeNull();
  });
});
