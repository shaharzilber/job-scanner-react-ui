export interface Job {
  company: string;
  position: string;
  requirements: string;
  location: string;
  link: string;
  source: string;
  posted_date?: string;
  stack_type?: string;
  position_type?: string;
  has_java_csharp?: boolean;
  salary?: string;
  company_description?: string;
  position_summary?: string;
  demand_analysis?: string;
  is_new?: boolean;
  job_key: string; // "company|position"
}

export enum JobTrackingStatus {
  ALL = 'all',
  FAVORITE = 'favorite',
  APPLIED = 'applied',
  ARCHIVE = 'archive',
}

export interface JobTracking {
  status: JobTrackingStatus;
  updatedAt: string;
  applicationDate?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  expectedSalary?: string;
  notes?: string;
  interviewDate?: string;
  responseDate?: string;
  rejectionDate?: string;
  offerDate?: string;
}

export interface JobFilters {
  category: 'all' | 'backend' | 'fullstack' | 'java-csharp';
  searchTerm: string;
  sortBy: 'recent' | 'oldest' | 'company' | 'position' | 'source' | 'location';
}

export interface JobStatusCounts {
  all: number;
  favorite: number;
  applied: number;
  archive: number;
}
