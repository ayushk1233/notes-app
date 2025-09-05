import React, { useState } from 'react';
import { motion } from 'framer-motion';
import notesApi from '../../services/api';
import ThemeToggler from '../ThemeToggler';
import './Auth.css';

const Login = ({ onLogin, onSwitchToSignup, onGuestLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.username || !formData.password) {
        throw new Error('Please enter both username and password');
      }
      
      await notesApi.auth.login(formData);
      onLogin();
    } catch (error) {
      setError(error.message || 'Invalid username or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await notesApi.auth.guestLogin();
      onLogin();
    } catch (error) {
      setError('Failed to login as guest');
      console.error('Guest login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="theme-toggle-container">
        <ThemeToggler />
      </div>
      <motion.div 
        className="auth-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2>Login to Notes App</h2>
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </motion.div>
          <motion.button
            type="submit"
            className="auth-button"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
        <motion.div 
          className="auth-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <button
            onClick={handleGuestLogin}
            className="guest-button"
            disabled={loading}
          >
            Continue as Guest
          </button>
          <motion.p
            className="switch-text mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="switch-button"
              disabled={loading}
            >
              Sign up
            </button>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
