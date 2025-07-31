/**
 * User Service
 * Handles user profile management and related operations
 */

import ApiService from './api.service';
import { RegisterRequest, User } from './auth.service';

// User profile update request
export interface UserUpdateRequest {
  fullName?: string;
  mobileNumber?: string; // Keep optional for updates, but mandatory for registration
  email?: string; // Optional
  dateOfBirth?: string;
  aadharNumber?: string;
  address?: string;
  profilePicture?: string;
}

// User preferences
export interface UserPreferences {
  language?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

/**
 * User Service
 * Provides methods for user profile management
 */
export const UserService = {
  /**
   * Get current user profile
   * @returns Promise with user profile data
   */
  getCurrentProfile: async () => {
    return await ApiService.get<User>('/users/profile');
  },

  /**
   * Update user profile
   * @param userData - User data to update
   * @returns Promise with updated user profile
   */
  updateProfile: async (userData: UserUpdateRequest) => {
    const response = await ApiService.put<User>('/users/profile', userData);
    
    // Update local storage user data if successful
    if (response.data) {
      const currentUser = sessionStorage.getItem('user');
      if (currentUser) {
        const updatedUser = { ...JSON.parse(currentUser), ...response.data };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response;
  },

  /**
   * Change user password
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Promise with password change response
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    return await ApiService.post('/users/change-password', {
      currentPassword,
      newPassword
    });
  },

  /**
   * Upload profile picture
   * @param file - Image file to upload
   * @returns Promise with upload response
   */
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    // Custom headers for file upload
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    
    return await ApiService.post('/users/profile-picture', formData, headers);
  },

  /**
   * Get user preferences
   * @returns Promise with user preferences
   */
  getPreferences: async () => {
    return await ApiService.get<UserPreferences>('/users/preferences');
  },

  /**
   * Update user preferences
   * @param preferences - User preferences to update
   * @returns Promise with updated preferences
   */
  updatePreferences: async (preferences: UserPreferences) => {
    return await ApiService.put<UserPreferences>('/users/preferences', preferences);
  },

  /**
   * Delete user account
   * @param password - User password for confirmation
   * @returns Promise with account deletion response
   */
  deleteAccount: async (password: string) => {
    return await ApiService.post('/users/delete-account', { password });
  },

  /**
   * Get user activity log
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise with user activity log
   */
  getActivityLog: async (page: number = 1, limit: number = 10) => {
    return await ApiService.get('/users/activity-log', {
      page: page.toString(),
      limit: limit.toString()
    });
  },

  /**
   * Create a new user (admin only)
   * @param userData - User data for new user
   * @returns Promise with created user data
   */
  createUser: async (userData: RegisterRequest) => {
    return await ApiService.post<User>('/users', userData);
  }
};

export default UserService;