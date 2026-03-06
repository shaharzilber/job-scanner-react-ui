import { ScanProgress, ScanStatus } from '@/types/scan.types';

export const mockScanProgress: ScanProgress = {
  scan_status: ScanStatus.SCRAPING,
  phase: 'Scraping jobs',
  counts: { scraped: 45, filtered_in: 23, analyzed: 10, cached: 5 },
  sources: [
    { name: 'LinkedIn', status: 'completed', jobs_found: 20 },
    { name: 'Indeed', status: 'in_progress', jobs_found: 15 },
  ],
  progress: { current: 45, total: 100, percentage: 45 },
  current_job: {
    position: 'Software Engineer',
    company: 'Tech Corp',
    source: 'Indeed',
    status: 'analyzing',
  },
};
