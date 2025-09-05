import axios from 'axios';

// Base URL for your FastAPI backend - use environment variable or fallback
const BASE_URL = process.env.REACT_APP_API_URL || 'https://notes-app-production-e710.up.railway.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});


// Add request interceptor to include auth token and handle initialization
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Initialize auth on load
initializeAuth();

// API service functions
const notesApi = {
  // Authentication methods
  auth: {
    signup: async (userData) => {
      try {
        const response = await api.post('/auth/signup', userData);
        if (response.data && response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        }
        return response.data;
      } catch (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    },

    login: async (credentials) => {
      try {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        
        const response = await api.post('/auth/login', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        });
        
        if (response.data && response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        } else {
          throw new Error('Invalid response from server');
        }
        return response.data;
      } catch (error) {
        console.error('Error logging in:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          throw new Error(error.response.data.detail || 'Authentication failed');
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('No response from server. Please try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error('Login failed. Please try again.');
        }
      }
    },

    guestLogin: async () => {
      try {
        const response = await api.post('/auth/guest');
        if (response.data && response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        }
        return response.data;
      } catch (error) {
        console.error('Error logging in as guest:', error);
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Note management methods
  getAllNotes: async () => {
    try {
      const response = await api.get('/notes/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  getNote: async (noteId) => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  },

  createNote: async (noteData) => {
    try {
      const response = await api.post('/notes/', noteData);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  updateNote: async (noteId, noteData) => {
    try {
      const response = await api.put(`/notes/${noteId}`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  deleteNote: async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  shareNote: async (noteId) => {
    try {
      const response = await api.post(`/notes/${noteId}/share`);
      return response.data;
    } catch (error) {
      console.error('Error sharing note:', error);
      throw error;
    }
  },

  getSharedNote: async (shareToken) => {
    try {
      const response = await api.get(`/shared/${shareToken}`);
      return response.data;
    } catch (error) {
      console.error('Error getting shared note:', error);
      throw error;
    }
  }
};

export default notesApi;
