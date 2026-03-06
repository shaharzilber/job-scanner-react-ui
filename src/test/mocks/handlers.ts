import { http, HttpResponse } from 'msw';
import { mockUsers, mockJobs, mockScanProgress } from '../fixtures';

// Base URL for API - match what the client uses in tests
const API_URL = 'http://localhost:5000/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;
    console.log('MSW: Login request received', { username, password });
    if (username === 'admin' && password === 'Admin@123456') {
      return HttpResponse.json({
        success: true,
        data: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: mockUsers.admin,
        },
      });
    }
    return HttpResponse.json(
      { success: false, errorMessage: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      success: true,
      data: { access_token: 'new-mock-access-token' },
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers.admin,
    });
  }),

  // Jobs endpoints
  http.get(`${API_URL}/jobs/all`, () => {
    return HttpResponse.json({ success: true, data: mockJobs });
  }),

  http.get(`${API_URL}/jobs/latest`, () => {
    return HttpResponse.json({ success: true, data: mockJobs });
  }),

  http.post(`${API_URL}/jobs/filter`, () => {
    return HttpResponse.json({ success: true, data: mockJobs });
  }),

  http.get(`${API_URL}/jobs/status/counts`, () => {
    return HttpResponse.json({
      success: true,
      data: { all: 10, favorite: 3, applied: 2, archive: 1 },
    });
  }),

  http.put(`${API_URL}/jobs/:jobKey/status`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Scan endpoints
  http.post(`${API_URL}/scan`, () => {
    return HttpResponse.json({
      success: true,
      data: { scan_id: 'test-scan-id', scan_status: 'initializing' },
    });
  }),

  http.post(`${API_URL}/scan/stop`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_URL}/scan/status`, () => {
    return HttpResponse.json({
      success: true,
      data: { scan_status: 'running' },
    });
  }),

  http.get(`${API_URL}/scan/progress`, () => {
    return HttpResponse.json({ success: true, data: mockScanProgress });
  }),
];
