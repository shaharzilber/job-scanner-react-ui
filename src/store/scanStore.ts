import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ScanProgress, ScanStatus } from '@/types/scan.types';

interface ScanState {
  isScanning: boolean;
  progress: ScanProgress | null;
  error: string | null;

  // Actions
  setScanning: (scanning: boolean) => void;
  setProgress: (progress: ScanProgress | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  isScanning: false,
  progress: null,
  error: null,
};

export const useScanStore = create<ScanState>()(
  devtools(
    (set) => ({
      ...initialState,

      setScanning: (scanning) => set({ isScanning: scanning }),

      setProgress: (progress) => set({ progress }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'ScanStore' }
  )
);
