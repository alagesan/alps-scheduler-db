import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskService = {
  // Get tasks for today
  getTasksForToday: () => api.get('/tasks/today'),

  // Get tasks for a specific date
  getTasksByDate: (date) => api.get(`/tasks/date/${date}`),

  // Get tasks for current week
  getTasksForCurrentWeek: () => api.get('/tasks/week'),

  // Get tasks for a specific week
  getTasksForWeek: (date) => api.get(`/tasks/week/${date}`),

  // Get tasks for a month
  getTasksForMonth: (year, month) => api.get(`/tasks/month/${year}/${month}`),

  // Get tasks for a quarter
  getTasksForQuarter: (year, quarter) => api.get(`/tasks/quarter/${year}/${quarter}`),

  // Get tasks for a half-year
  getTasksForHalfYear: (year, half) => api.get(`/tasks/half-year/${year}/${half}`),

  // Get tasks for a year
  getTasksForYear: (year) => api.get(`/tasks/year/${year}`),

  // Get tasks for date range
  getTasksForDateRange: (start, end) => api.get(`/tasks/range?start=${start}&end=${end}`),

  // Get tasks by department
  getTasksByDepartment: (department) => api.get(`/tasks/department/${department}`),

  // Get all departments
  getAllDepartments: () => api.get('/tasks/departments'),
};

export default api;
