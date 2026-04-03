import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/profile'),
  setupAdmin: (data) => API.post('/auth/setup-admin', data)
};

// Users API
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  toggleStatus: (id) => API.put(`/users/${id}/status`),
  getStats: () => API.get('/users/stats')
};

// Finances API
export const financesAPI = {
  getAll: (params) => API.get('/finances', { params }),
  getById: (id) => API.get(`/finances/${id}`),
  create: (data) => API.post('/finances', data),
  update: (id, data) => API.put(`/finances/${id}`, data),
  delete: (id) => API.delete(`/finances/${id}`),
  getCategories: () => API.get('/finances/categories')
};

// Dashboard API
export const dashboardAPI = {
  getSummary: (params) => API.get('/dashboard/summary', { params }),
  getCategorySummary: (params) => API.get('/dashboard/category-summary', { params }),
  getRecentActivity: (params) => API.get('/dashboard/recent-activity', { params }),
  getMonthlyTrends: (params) => API.get('/dashboard/trends/monthly', { params }),
  getAll: (params) => API.get('/dashboard', { params })
};

export default API;
