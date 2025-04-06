import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await AuthService.login(credentials);

      if (response.error) {
        setError(response.error);
        return false;
      }

      setCurrentUser(response.data.access_token);

      // Navigate to dashboard after successful login
      navigate('/dashboard');

      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await AuthService.register(userData);

      if (response.error) {
        setError(response.error);
        return false;
      }

      return true;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return AuthService.isAuthenticated() && !!currentUser;
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await AuthService.requestPasswordReset(email);

      if (response.error) {
        setError(response.error);
        return false;
      }

      return true;
    } catch (err) {
      setError(err.message || 'Password reset request failed');
      return false;
    }
  };

  // Reset password
  const resetPassword = async (resetData) => {
    try {
      setError(null);
      const response = await AuthService.resetPassword(resetData);

      if (response.error) {
        setError(response.error);
        return false;
      }

      return true;
    } catch (err) {
      setError(err.message || 'Password reset failed');
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await AuthService.updateProfile(userData);

      if (response.error) {
        setError(response.error);
        return false;
      }

      setCurrentUser(response.data);
      return true;
    } catch (err) {
      setError(err.message || 'Profile update failed');
      return false;
    }
  };

  // Value object that will be passed to any consuming components
  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    error,
    loading
  };

  // Make login function available globally for class components
  if (typeof window !== 'undefined') {
    window.login = login;
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;