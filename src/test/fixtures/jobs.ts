import type { Job } from '@/types/job.types';

export const mockJob: Job = {
  company: 'Tech Corp',
  position: 'Senior Full Stack Developer',
  requirements: 'React, TypeScript, Node.js',
  location: 'Remote',
  link: 'https://example.com/job/1',
  source: 'LinkedIn',
  posted_date: '2024-01-15',
  stack_type: 'fullstack',
  has_java_csharp: false,
  job_key: 'Tech Corp|Senior Full Stack Developer',
  is_new: true,
};

export const mockJobs: Job[] = [
  mockJob,
  { ...mockJob, job_key: 'Company2|Position2', company: 'Company2' },
  { ...mockJob, job_key: 'Company3|Position3', company: 'Company3' },
];
