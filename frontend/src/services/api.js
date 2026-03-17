import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/login', formData);
  },
  register: (username, password, role) => 
    api.post('/auth/register', { username, password, role }),
  getCurrentUser: () => api.get('/auth/me'),
};

export const folderService = {
  getFolders: () => api.get('/folders/'),
  createFolder: (name, parent_id) => api.post('/folders/', { name, parent_id }),
  getDescendants: (folderId) => api.get(`/folders/${folderId}/descendants`),
};

export const fileService = {
  getFiles: (folderId) => api.get(`/files/?folder_id=${folderId}`),
  uploadFile: (file, folderId, tags) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_id', folderId);
    formData.append('tags', tags);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  undoLastAction: () => api.post('/files/undo'),
  searchFiles: (query) => api.get(`/files/search?query=${query}`),
};

export const adminService = {
  // Departments
  getDepartments: () => api.get('/admin/departments/'),
  createDepartment: (name) => api.post('/admin/departments/', { name }),
  
  // User Approvals
  getPendingUsers: () => api.get('/admin/users/pending'),
  approveUser: (userId, departmentId) => 
    api.post(`/admin/users/${userId}/approve${departmentId ? `?department_id=${departmentId}` : ''}`),
  
  // Anomaly Alerts
  getAlerts: () => api.get('/admin/alerts/'),
  resolveAlert: (alertId) => api.post(`/admin/alerts/${alertId}/resolve`),

  // Global Analytics
  getAnalytics: () => api.get('/analytics/'),
};

export default api;
