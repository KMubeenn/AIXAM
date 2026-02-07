import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export const AuthService = {
  async signup(name: string, email: string, password: string, role: string) {
    try {
      const response = await axios.post(`${API_URL}/signup/`, {
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
      const response = await axios.post(`${API_URL}/login/`, {
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

  getToken() {
    return localStorage.getItem('token');
  }
};
