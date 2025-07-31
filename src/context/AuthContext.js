import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services';
import tokenService from '../services/token.service';

// Helper function to create minimal user object from token
const createMinimalUserFromToken = (token) => {
  let user_id = null;
  let email = null;
  let role = null;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // The backend stores email in 'sub' field, not user_id
      email = payload.sub;
      // Try to get user_id if it exists in payload, otherwise we'll need to fetch it
      user_id = payload.user_id || payload.id;
      // Try to get role from token payload
      role = payload.role;
      console.log('Token payload:', { email, user_id, role, exp: payload.exp });
    }
  } catch (e) {
    console.warn('Could not parse token payload:', e);
  }
  
  return { 
    token: token,
    user_id: user_id,
    email: email,
    fullName: 'User', // Fallback name
    role: role || 'customer' // Default to customer role
  };
};

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

  // Check if user is already logged in (from sessionStorage)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log('Checking authentication status...');
      
      // Initialize token service for automatic token refresh
      tokenService.init();
      
      // Check if we have an auth token
      if (AuthService.isAuthenticated()) {
        console.log('User is authenticated, loading user data...');
        
        try {
          // Try to get user data from sessionStorage first for immediate display
          const storedUser = sessionStorage.getItem('user');
          if (storedUser) {
            console.log('Found stored user data in sessionStorage');
            const userData = JSON.parse(storedUser);
            // Ensure user_id is available (handle both id and user_id from stored data)
            const userDataFormatted = {
              ...userData,
              user_id: userData.user_id || userData.id
            };
            setCurrentUser(userDataFormatted);
            console.log('User data set from sessionStorage:', userDataFormatted);
          } else {
            console.log('No stored user data found in sessionStorage');
          }
          
          // Then fetch fresh data from the API
          console.log('Fetching fresh user data from API...');
          try {
            const userResponse = await AuthService.getCurrentUserData();
            console.log('API user data response:', userResponse);
            
            if (userResponse && userResponse.data) {
              console.log('Setting user data from API:', userResponse.data);
              // Ensure user_id is available (handle both id and user_id from API)
              const userData = {
                ...userResponse.data,
                user_id: userResponse.data.user_id || userResponse.data.id,
                role: userResponse.data.role || 'customer' // Ensure role is set
              };
              console.log('Final user data with role:', userData);
              setCurrentUser(userData);
              // Update sessionStorage with fresh data
              sessionStorage.setItem('user', JSON.stringify(userData));
            } else {
              console.warn("No user data returned from API");
              // If we don't have user data in sessionStorage either, create a minimal user object
              if (!storedUser) {
                console.log('Creating minimal user object');
                const token = sessionStorage.getItem('authToken');
                const minimalUser = createMinimalUserFromToken(token);
                setCurrentUser(minimalUser);
                sessionStorage.setItem('user', JSON.stringify(minimalUser));
              }
            }
          } catch (apiError) {
            console.error("Error fetching user data from API:", apiError);
            // Don't overwrite existing user data if API call fails
            if (!storedUser) {
              console.log('Creating minimal user object after API error');
              const token = sessionStorage.getItem('authToken');
              const minimalUser = createMinimalUserFromToken(token);
              setCurrentUser(minimalUser);
              sessionStorage.setItem('user', JSON.stringify(minimalUser));
            }
          }
        } catch (error) {
          console.error("Error in authentication process:", error);
          setError("Failed to load user data");
          // Ensure we have at least minimal user data
          const token = sessionStorage.getItem('authToken');
          const minimalUser = createMinimalUserFromToken(token);
          setCurrentUser(minimalUser);
          sessionStorage.setItem('user', JSON.stringify(minimalUser));
        }
      } else {
        console.log('User is not authenticated');
      }
      
      setLoading(false);
    };
    
    fetchData();
    
    // Clean up token refresh when component unmounts
    return () => {
      tokenService.clearTokenRefresh();
    };
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      console.log('Attempting login with credentials:', credentials);
      
      const response = await AuthService.login(credentials);
      console.log('Login response:', response);

      if (response.error) {
        console.error('Login error:', response.error);
        setError(response.error);
        return false;
      }

      // Get user data after successful login
      try {
        console.log('Login successful, fetching user data...');
        
        // Use the user data from the login response if available
        if (response.data && response.data.user) {
          console.log('User data found in login response:', response.data.user);
          // Ensure user_id is available (handle both id and user_id from API)
          const userData = {
            ...response.data.user,
            user_id: response.data.user.user_id || response.data.user.id,
            role: response.data.user.role || 'customer' // Ensure role is set
          };
          console.log('Login: Setting user data with role:', userData);
          setCurrentUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
        } else if (response.data && response.data.user_id) {
          // Handle case where user_id is returned directly in login response
          console.log('User ID found in login response:', response.data.user_id);
          const userData = {
            user_id: response.data.user_id,
            token: response.data.access_token,
            fullName: 'User' // Will be updated when we fetch full user data
          };
          setCurrentUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Otherwise fetch it separately
          console.log('Fetching user data from API...');
          const userData = await AuthService.getCurrentUserData();
          console.log('User data response:', userData);
          
          if (userData && userData.data) {
            console.log('Setting user data:', userData.data);
            // Ensure user_id is available (handle both id and user_id from API)
            const userDataFormatted = {
              ...userData.data,
              user_id: userData.data.user_id || userData.data.id
            };
            setCurrentUser(userDataFormatted);
            // Store user data in sessionStorage for persistence
            sessionStorage.setItem('user', JSON.stringify(userDataFormatted));
          } else {
            console.error("Failed to fetch user data after login");
            // Create a minimal user object from the token if we have to
            if (response.data && response.data.access_token) {
              console.log('Creating minimal user object from token');
              const minimalUser = createMinimalUserFromToken(response.data.access_token);
              setCurrentUser(minimalUser);
              sessionStorage.setItem('user', JSON.stringify(minimalUser));
            }
          }
        }
      } catch (userDataError) {
        console.error("Error fetching user data after login:", userDataError);
        // Don't fail the login process if user data fetch fails
        // Just create a minimal user object from the token
        if (response.data && response.data.access_token) {
          console.log('Creating minimal user object from token after error');
          const minimalUser = createMinimalUserFromToken(response.data.access_token);
          setCurrentUser(minimalUser);
          sessionStorage.setItem('user', JSON.stringify(minimalUser));
        }
      }

      // Navigate to dashboard after successful login
      console.log('Navigating to dashboard...');
      navigate('/dashboard');

      return true;
    } catch (err) {
      console.error('Login process error:', err);
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
    // Clear token refresh before logout
    tokenService.clearTokenRefresh();
    
    // Perform logout
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