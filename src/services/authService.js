import { getItem, setItem, removeItem } from '../utils/storage';

const TOKEN_KEY = 'tabnine_auth_token';
const API_URL = 'https://api.tabnine.com/v1'; // Replace with actual Tabnine API URL

export const authService = {
  login: async (token) => {
    try {
      // Verify token with Tabnine API
      const response = await fetch(`${API_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Invalid authentication token');
      }

      const data = await response.json();
      
      // Store the token
      setItem(TOKEN_KEY, token);
      
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    removeItem(TOKEN_KEY);
  },

  getToken: () => {
    return getItem(TOKEN_KEY);
  },

  isAuthenticated: () => {
    return !!getItem(TOKEN_KEY);
  }
};
