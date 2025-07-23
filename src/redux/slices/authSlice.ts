import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService, UserService, UserUpdateRequest } from '../../services';
import tokenService from '../../services/token.service';

// Define types
interface User {
  id?: string;
  username?: string;
  email?: string;
  token?: string;
  [key: string]: any;
}

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  username: string;
  password?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string,
  mobileNumber: string, 
  dateOfBirth: string, 
  aadharNumber: string, 
  pin: number
  [key: string]: any;
}

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword?: string;
}

// Initial state
const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Initialize token service for automatic token refresh
      tokenService.init();
      
      if (AuthService.isAuthenticated()) {
        // Try to get user data from localStorage first for immediate display
        const storedUser = localStorage.getItem('user');
        let userData = null;
        
        if (storedUser) {
          userData = JSON.parse(storedUser);
        }
        
        // Then fetch fresh data from the API
        try {
          const userResponse = await AuthService.getCurrentUserData();
          
          if (userResponse && userResponse.data) {
            userData = userResponse.data;
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(userResponse.data));
          } else if (!storedUser) {
            // If we don't have user data in localStorage either, create a minimal user object
            userData = { token: localStorage.getItem('authToken') };
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (apiError) {
          // Don't overwrite existing user data if API call fails
          if (!storedUser) {
            userData = { token: localStorage.getItem('authToken') };
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
        
        return userData;
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load user data');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);

      if (response.error) {
        return rejectWithValue(response.error);
      }

      // Get user data after successful login
      try {
        // Use the user data from the login response if available
        if (response.data && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          return response.data.user;
        } else {
          // Otherwise fetch it separately
          const userData = await AuthService.getCurrentUserData();
          
          if (userData && userData.data) {
            // Store user data in localStorage for persistence
            localStorage.setItem('user', JSON.stringify(userData.data));
            return userData.data;
          } else {
            // Create a minimal user object from the token if we have to
            if (response.data && response.data.access_token) {
              const minimalUser = { token: response.data.access_token };
              localStorage.setItem('user', JSON.stringify(minimalUser));
              return minimalUser;
            }
          }
        }
      } catch (userDataError) {
        // Don't fail the login process if user data fetch fails
        // Just create a minimal user object from the token
        if (response.data && response.data.access_token) {
          const minimalUser = { token: response.data.access_token };
          localStorage.setItem('user', JSON.stringify(minimalUser));
          return minimalUser;
        }
      }

      return null;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);

      if (response.error) {
        return rejectWithValue(response.error);
      }

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.requestPasswordReset(email);

      if (response.error) {
        return rejectWithValue(response.error);
      }

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData: ResetPasswordData, { rejectWithValue }) => {
    try {
      const response = await AuthService.resetPassword(resetData);

      if (response.error) {
        return rejectWithValue(response.error);
      }

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password reset failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: UserUpdateRequest, { rejectWithValue }) => {
    try {
      const response = await UserService.updateProfile(userData);

      if (response.error) {
        return rejectWithValue(response.error);
      }

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Profile update failed');
    }
  }
);

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Clear token refresh before logout
      tokenService.clearTokenRefresh();
      
      // Perform logout
      AuthService.logout();
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Request password reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;