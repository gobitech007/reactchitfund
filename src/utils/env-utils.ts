/**
 * Environment Utilities
 * Helper functions for working with environment variables
 */

/**
 * Environment configuration interface
 */
export interface EnvConfig {
  API_URL: string;
  ENV: 'development' | 'staging' | 'production';
  DEBUG: boolean;
  VERSION: string;
  [key: string]: string | boolean | undefined;
}

/**
 * Get environment configuration
 * @returns Environment configuration object
 */
export const getEnvConfig = (): EnvConfig => {
  return {
    API_URL: process.env.REACT_APP_API_URL || 'https://api.example.com',
    ENV: (process.env.REACT_APP_ENV || 'development') as 'development' | 'staging' | 'production',
    DEBUG: process.env.REACT_APP_DEBUG === 'true',
    VERSION: process.env.REACT_APP_VERSION || '0.0.0',
    // Add any other environment variables here
  };
};

/**
 * Check if the application is running in development mode
 * @returns Boolean indicating if in development mode
 */
export const isDevelopment = (): boolean => {
  return getEnvConfig().ENV === 'development';
};

/**
 * Check if the application is running in production mode
 * @returns Boolean indicating if in production mode
 */
export const isProduction = (): boolean => {
  return getEnvConfig().ENV === 'production';
};

/**
 * Check if the application is running in staging mode
 * @returns Boolean indicating if in staging mode
 */
export const isStaging = (): boolean => {
  return getEnvConfig().ENV === 'staging';
};

/**
 * Check if debugging is enabled
 * @returns Boolean indicating if debugging is enabled
 */
export const isDebugEnabled = (): boolean => {
  return getEnvConfig().DEBUG;
};

/**
 * Get API URL
 * @returns API URL from environment configuration
 */
export const getApiUrl = (): string => {
  return getEnvConfig().API_URL;
};

/**
 * Environment utilities object
 */
const envUtils = {
  getEnvConfig,
  isDevelopment,
  isProduction,
  isStaging,
  isDebugEnabled,
  getApiUrl
};

export default envUtils;