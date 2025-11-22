import axios from 'axios';

// Use relative URL - requests go through nginx reverse proxy
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskService = {
  // Schedule APIs - Get scheduled tasks for dates

  // Get tasks for today
  getTasksForToday: () => api.get('/schedule/today'),

  // Get tasks for a specific date
  getTasksByDate: (date) => api.get(`/schedule/date/${date}`),

  // Get tasks for current week
  getTasksForCurrentWeek: () => api.get('/schedule/week'),

  // Get tasks for a specific week
  getTasksForWeek: (date) => api.get(`/schedule/week/${date}`),

  // Get tasks for a month
  getTasksForMonth: (year, month) => api.get(`/schedule/month/${year}/${month}`),

  // Get tasks for a quarter
  getTasksForQuarter: (year, quarter) => api.get(`/schedule/quarter/${year}/${quarter}`),

  // Get tasks for a half-year
  getTasksForHalfYear: (year, half) => api.get(`/schedule/half-year/${year}/${half}`),

  // Get tasks for a year
  getTasksForYear: (year) => api.get(`/schedule/year/${year}`),

  // Get tasks for date range
  getTasksForDateRange: (start, end) => api.get(`/schedule/range?start=${start}&end=${end}`),

  // Get tasks for today by department
  getTasksByDepartment: (department) => api.get(`/schedule/today/department/${department}`),

  // Master APIs - Get reference data from Named Ranges

  // Get all departments from Named Range
  getAllDepartments: () => api.get('/master/departments'),

  // Get all frequencies from Named Range
  getAllFrequencies: () => api.get('/master/frequencies'),
};

export default api;
