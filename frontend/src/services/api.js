import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/update/', data),
};

// Menu API
export const menuAPI = {
  getCategories: () => api.get('/menu/categories/'),
  getMenuItems: (params = {}) => api.get('/menu/items/', { params }),
  getMenuItem: (id) => api.get(`/menu/items/${id}/`),
  getFeaturedItems: () => api.get('/menu/items/featured/'),
  getItemsByCategory: (categoryId) => api.get(`/menu/items/by_category/?category_id=${categoryId}`),
  addReview: (itemId, reviewData) => api.post(`/menu/items/${itemId}/add_review/`, reviewData),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders/', orderData),
  getOrders: (params = {}) => api.get('/orders/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/update_status/`, { status }),
  getOrderTracking: (id) => api.get(`/orders/${id}/tracking/`),
  getMyOrders: () => api.get('/orders/my_orders/'),
};

export default api;
