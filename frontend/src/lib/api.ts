import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create public API instance (without authentication)
const publicAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't add authorization header if no token (for guest access)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error has response before accessing status
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try refreshing the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          if (res.data.access) {
            localStorage.setItem('accessToken', res.data.access);
            api.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
            
            // Retry the original request with the new token
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: async (email: string, password: string) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    const response = await api.post('/auth/login/', { 
      email: email,
      password: password 
    });
    
    // The backend returns both 'access' and 'access_token' - handle both
    if (response.data && (response.data.access || response.data.access_token)) {
      return response;
    } else {
      throw new Error('Invalid response from server');
    }
  },
  refreshToken: (refresh: string) => api.post('/auth/token/refresh/', { refresh }),
};

// User APIs
export const userAPI = {
  getCurrentUser: () => api.get('/users/me/'),
  getUserProfile: (id: number) => api.get(`/users/${id}/`),
  updateProfile: (data: any) => api.patch('/users/me/', data),
  togglePublic: () => api.post('/users/me/toggle_public/'),
  getUsers: (params: any = {}) => api.get('/users/', { params }),
  getPublicUsers: (params: any = {}) => publicAPI.get('/users/', { params }),
};

// Skills APIs
export const skillAPI = {
  getAllSkills: () => api.get('/skills/'),
  getPopularSkills: () => api.get('/skills/popular/'),
  getUserSkills: (userId: number) => api.get(`/users/${userId}/skills/`),
  addUserSkill: (data: any) => api.post('/user-skills/', data),
  updateUserSkill: (id: number, data: any) => api.patch(`/user-skills/${id}/`, data),
  deleteUserSkill: (id: number) => api.delete(`/user-skills/${id}/`),
  getOfferedSkills: () => api.get('/user-skills/offered/'),
  getWantedSkills: () => api.get('/user-skills/wanted/'),
};

// Swap APIs
export const swapAPI = {
  getSwapRequests: () => api.get('/swaps/'),
  getSentRequests: () => api.get('/swaps/sent/'),
  getReceivedRequests: () => api.get('/swaps/received/'),
  getSwapRequest: (id: number) => api.get(`/swaps/${id}/`),
  createSwapRequest: (data: any) => api.post('/swaps/', data),
  updateSwapRequest: (id: number, data: any) => api.patch(`/swaps/${id}/`, data),
};

// Rating APIs
export const ratingAPI = {
  getUserRatings: (userId: number) => api.get('/ratings/', { params: { user_id: userId } }),
  createRating: (data: any) => api.post('/ratings/', data),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications/'),
  getUnreadNotifications: () => api.get('/notifications/unread/'),
  markAsRead: (id: number) => api.patch(`/notifications/${id}/`, { is_read: true }),
  markAllAsRead: () => api.post('/notifications/mark_all_read/'),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/users/admin_list/'),
  getDashboardData: () => api.get('/users/admin_dashboard/'),
  getDetailedUsers: () => api.get('/users/admin_users_detailed/'),
  updateUser: (id: number, data: any) => api.patch(`/users/${id}/admin_update/`, data),
  toggleUserActive: (id: number) => api.post(`/users/${id}/toggle_active/`),
  rejectSkill: (skillId: number) => api.post(`/skills/${skillId}/reject/`),
  banUser: (userId: number) => api.post(`/users/${userId}/ban/`),
  unbanUser: (userId: number) => api.post(`/users/${userId}/unban/`),
  monitorSwaps: (status: string = '') => api.get('/swaps/monitor/', { params: { status } }),
  sendPlatformMessage: (data: any) => api.post('/notifications/broadcast/', data),
  downloadReport: (reportType: string) => api.get(`/admin/reports/${reportType}/`, { 
    responseType: 'blob',
  }),
};

export default api;
