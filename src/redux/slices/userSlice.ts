import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserService, UserUpdateRequest } from '../../services';
import { User as AuthUser } from '../../services/auth.service';
import { UserPreferences } from '../../services';

// Either use the imported type directly
// type User = AuthUser;

interface User extends AuthUser {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth?: string;
  aadharNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; 
}

interface UserState {
  profile: AuthUser | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean; 
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  updateSuccess: false,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getCurrentProfile();
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: UserUpdateRequest, { rejectWithValue }) => {
    try {
      const response = await UserService.updateProfile(userData);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update user profile');
    }
  }
);

// Add this to userSlice.ts
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await UserService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to change password');
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: UserPreferences, { rejectWithValue }) => {
    try {
      const response = await UserService.updatePreferences(preferences);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update user preferences');
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add these cases to the extraReducers section
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        // Update preferences in the profile if needed
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;