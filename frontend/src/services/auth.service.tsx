import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthService = {
  async signup(name: string, email: string, password: string, role: string) {
    try {
      const response = await api.post('/signup/', {
        name,
        email,
        password,
        role
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await api.post('/login/', {
        email,
        password
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getProfile() {
    try {
      const response = await api.get('/me/');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  }
};
