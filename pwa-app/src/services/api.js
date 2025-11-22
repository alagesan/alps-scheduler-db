import axios from 'axios';

// Use relative URL - requests go through nginx reverse proxy
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const taskService = {
  // Schedule APIs - Get scheduled tasks for dates
  getTasksForToday: () => api.get('/schedule/today'),
  getTasksByDate: (date) => api.get(`/schedule/date/${date}`),
  getTasksForCurrentWeek: () => api.get('/schedule/week'),
  getTasksForWeek: (date) => api.get(`/schedule/week/${date}`),
  getTasksForMonth: (year, month) => api.get(`/schedule/month/${year}/${month}`),
  getTasksForQuarter: (year, quarter) => api.get(`/schedule/quarter/${year}/${quarter}`),
  getTasksForHalfYear: (year, half) => api.get(`/schedule/half-year/${year}/${half}`),
  getTasksForYear: (year) => api.get(`/schedule/year/${year}`),
  getTasksForDateRange: (start, end) => api.get(`/schedule/range?start=${start}&end=${end}`),
  getTasksByDepartment: (department) => api.get(`/schedule/today/department/${department}`),

  // Master APIs - Reference data
  getAllDepartments: () => api.get('/master/departments'),
  getAllFrequencies: () => api.get('/master/frequencies'),
};

export const masterService = {
  // Task Master CRUD
  getAllTasks: () => api.get('/master/tasks'),
  getTask: (rowNumber) => api.get(`/master/tasks/${rowNumber}`),
  createTask: (task) => api.post('/master/tasks', task),
  updateTask: (rowNumber, task) => api.put(`/master/tasks/${rowNumber}`, task),
  deleteTask: (rowNumber) => api.delete(`/master/tasks/${rowNumber}`),
  getTasksByDepartment: (department) => api.get(`/master/tasks/department/${department}`),
  getTasksByFrequency: (frequency) => api.get(`/master/tasks/frequency/${frequency}`),
  getDepartments: () => api.get('/master/departments'),
  getFrequencies: () => api.get('/master/frequencies'),
};

export const userService = {
  // User CRUD
  getAllUsers: () => api.get('/users'),
  getUser: (rowNumber) => api.get(`/users/${rowNumber}`),
  getUserByEmail: (email) => api.get(`/users/email/${email}`),
  getUsersByStatus: (status) => api.get(`/users/status/${status}`),
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  createUser: (user) => api.post('/users', user),
  updateUser: (rowNumber, user) => api.put(`/users/${rowNumber}`, user),
  deleteUser: (rowNumber) => api.delete(`/users/${rowNumber}`),
  getStatuses: () => api.get('/users/statuses'),
  getRoles: () => api.get('/users/roles'),
};

export const batchService = {
  // Batch control
  getStatus: () => api.get('/batch/status'),
  sendEmail: () => api.post('/batch/send-email'),
  sendEmailForDate: (date, scheduleTime = 'Manual Trigger') =>
    api.post(`/batch/send-email/date/${date}?scheduleTime=${encodeURIComponent(scheduleTime)}`),
};

export default api;
