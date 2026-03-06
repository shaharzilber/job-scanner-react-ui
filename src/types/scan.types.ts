export enum ScanStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  SCRAPING = 'scraping',
  FILTERING = 'filtering',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  STOPPED = 'stopped',
}

export interface ScanProgress {
  scan_status: ScanStatus;
  phase: string;
  counts: {
    scraped: number;
    filtered_in: number;
    analyzed: number;
    cached: number;
  };
  sources: Array<{
    name: string;
    status: string;
    jobs_found: number;
  }>;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  current_job?: {
    position: string;
    company: string;
    source: string;
    status: string;
  };
}

export interface ScanResult {
  scan_id: string;
  scan_status: ScanStatus;
  started_at: string;
  completed_at?: string;
  total_jobs: number;
  errors?: string[];
}
