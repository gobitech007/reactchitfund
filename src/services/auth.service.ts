/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
import ApiService from './api.service';
import tokenService from './token.service';

// User interfaces
export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth?: string;
  aadharNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Login request payload
export interface LoginRequest {
  email?: string;
  phone?: string;
  aadhar?: string;
  password?: string;
}

// Login response
export interface LoginResponse {
  user: User;
  access_token: string;
  refreshToken?: string;
}

// Registration request payload
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
  dateOfBirth: string;
  aadharNumber: string;
  pin: number;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password update request
export interface PasswordUpdateRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Authentication Service
 * Provides methods for user authentication and session management
 */
export const AuthService = {
  /**
   * Login user with email, mobile number, or aadhar number and optional password
   * @param credentials - Login credentials (email/mobileNumber/aadharNumber, optional password)
   * @returns Promise with login response
   */
  login: async (credentials: LoginRequest) => {
    // Validate that at least one identifier is provided
    if (!credentials.email && !credentials.phone && !credentials.aadhar) {
      throw new Error('At least one of email, mobileNumber, or aadharNumber must be provided');
    }

    // If password is not provided, it will be handled by the backend
    // (e.g., for passwordless login or OTP-based authentication)

    const response = await ApiService.post<LoginResponse>('/auth/login', credentials);

    if (response.data && response.data.access_token) {
      // Store auth token and user data in localStorage
      localStorage.setItem('authToken', response.data.access_token);
      // AuthService.getCurrentUserData();

      // Store refresh token if available
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // Set up automatic token refresh
      tokenService.setupTokenRefresh(response.data.access_token);
    }

    return response;
  },

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise with registration response
   */
  register: async (userData: RegisterRequest) => {
    const userDataFinal = {
      fullname: userData.fullName,
      email: userData.email,
      phone: userData.mobileNumber,
      aadhar: userData.aadharNumber,
      dob: userData.dateOfBirth, // Should be in YYYY-MM-DD format
      pin: userData.pin,
      password: userData.password || "",
      role: "customer"
    };
    console.log('Sending registration data:', JSON.stringify(userDataFinal));
    return await ApiService.post<User>('/users/', userDataFinal);
  },

  /**
   * Logout current user
   * Removes auth tokens and user data from localStorage
   */
  logout: () => {
    // Clear token refresh
    tokenService.clearTokenRefresh();
    
    // Remove tokens and user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Optional: Call logout endpoint to invalidate token on server
    ApiService.post('/auth/logout').catch(error => {
      console.error('Logout error:', error);
    });
  },

  /**
   * Check if user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get current authenticated user
   * @returns Current user object or null
   */
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise with password reset response
   */
  requestPasswordReset: async (email: string) => {
    return await ApiService.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param resetData - Password reset data (token, new password)
   * @returns Promise with password reset response
   */
  resetPassword: async (resetData: PasswordUpdateRequest) => {
    return await ApiService.post('/auth/reset-password', resetData);
  },

  /**
   * Refresh authentication token
   * @returns Promise with new token response
   */
  refreshToken: async () => {
    // Use the token service to refresh the token
    const success = await tokenService.refreshToken();
    
    if (success) {
      return { 
        data: { token: localStorage.getItem('authToken') || '' }, 
        error: null, 
        status: 200 
      };
    } else {
      return { 
        data: null, 
        error: 'Failed to refresh token', 
        status: 401 
      };
    }
  },

  /**
   * Verify email address
   * @param token - Email verification token
   * @returns Promise with verification response
   */
  verifyEmail: async (token: string) => {
    return await ApiService.post('/auth/verify-email', { token });
  },

  getCurrentUserData: async () => {
    try {
      const response = await ApiService.get('/auth/me');
      // Return the full response object to maintain consistency with other methods
      return response;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }
};

export default AuthService;