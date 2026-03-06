import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { scanApi } from '@/api/scan.api';
import { useScanStore } from '@/store/scanStore';
import { ScanStatus } from '@/types/scan.types';

export const useScan = () => {
  const { isScanning, progress, setScanning, setProgress, setError, reset } = useScanStore();

  // Start scan mutation
  const startScanMutation = useMutation({
    mutationFn: scanApi.startScan,
    onSuccess: () => {
      setScanning(true);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.errorMessage || 'Failed to start scan');
      setScanning(false);
    },
  });

  // Stop scan mutation
  const stopScanMutation = useMutation({
    mutationFn: scanApi.stopScan,
    onSuccess: () => {
      setScanning(false);
      reset();
    },
  });

  return {
    isScanning,
    progress,
    startScan: startScanMutation.mutate,
    stopScan: stopScanMutation.mutate,
    isStarting: startScanMutation.isPending,
    isStopping: stopScanMutation.isPending,
  };
};

// Hook for polling scan progress
export const useScanProgress = () => {
  const { isScanning, setProgress, setScanning, setError } = useScanStore();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  const { data: progress } = useQuery({
    queryKey: ['scan-progress'],
    queryFn: scanApi.getScanProgress,
    enabled: isScanning,
    refetchInterval: isScanning ? 1000 : false, // Poll every 1 second when scanning
    retry: 3,
  });

  useEffect(() => {
    if (progress) {
      setProgress(progress);

      // Check if scan is complete or failed
      if (
        progress.scan_status === ScanStatus.COMPLETED ||
        progress.scan_status === ScanStatus.FAILED ||
        progress.scan_status === ScanStatus.STOPPED
      ) {
        setScanning(false);

        if (progress.scan_status === ScanStatus.FAILED) {
          setError('Scan failed');
        }
      }
    }
  }, [progress, setProgress, setScanning, setError]);

  return {
    progress,
    isScanning,
  };
};
