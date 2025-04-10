/**
 * Base API Service
 * Handles HTTP requests to the backend API
 */

import { getApiUrl, isDebugEnabled } from '../utils/env-utils';

// Log environment in development mode
if (isDebugEnabled()) {
  console.log('API Environment:', {
    API_URL: getApiUrl(),
    DEBUG: isDebugEnabled()
  });

  // Add a startup check for API connectivity
  fetch(getApiUrl())
    .then(response => {
      console.log('✅ API server is reachable at:', getApiUrl());
    })
    .catch(error => {
      console.warn('⚠️ API server is not reachable at:', getApiUrl());
      console.warn('Error details:', error.message);
      console.warn('Please make sure the backend server is running with: python run.py --mode dev');
    });
}

// API Configuration
const API_URL = getApiUrl();

// CORS preflight check function
export const checkCorsSetup = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/cors-check`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('CORS preflight check failed:', error);
    return false;
  }
};

// HTTP Request Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

// Interface for API request options
export interface ApiRequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

// Interface for API response
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Handles API requests with error handling and authentication
 * @param endpoint - API endpoint path
 * @param options - Request options (method, headers, body, params)
 * @returns Promise with the API response
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions
): Promise<ApiResponse<T>> => {
  try {
    // Build URL with query parameters if provided
    let url = `${API_URL}${endpoint}`;
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      url = `${url}?${queryParams.toString()}`;
    }

    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method,
      headers,
      credentials: 'include', // Include cookies for cross-origin requests
      mode: 'cors', // Explicitly set CORS mode
    };

    // Add request body if provided (and not GET request)
    if (options.body && options.method !== HttpMethod.GET) {
      // Log the request body for debugging
      console.log('Request body before serialization:', options.body);
      requestOptions.body = JSON.stringify(options.body);
      console.log('Request body after serialization:', requestOptions.body);
    }

    // Make the request
    const response = await fetch(url, requestOptions);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // Handle API errors
    if (!response.ok) {
      console.error('API Error Response:', response.status, response.statusText, data);
      let errorMessage = data?.detail || data?.message || `API Error: ${response.status} ${response.statusText}`;
      
      // Handle validation errors (422 Unprocessable Entity)
      if (response.status === 422 && data?.detail) {
        try {
          // FastAPI validation errors are typically in the format:
          // { "detail": [ { "loc": ["body", "field_name"], "msg": "error message", "type": "error_type" } ] }
          interface ValidationError {
            loc: string[];
            msg: string;
            type: string;
          }
          
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map((err: ValidationError) => 
              `${err.loc[err.loc.length - 1]}: ${err.msg}`
            ).join(', ');
          }
        } catch (e) {
          console.error('Error parsing validation errors:', e);
        }
      }
      
      return {
        data: null,
        error: errorMessage,
        status: response.status
      };
    }

    // Return successful response
    return {
      data,
      error: null,
      status: response.status
    };
  } catch (error) {
    // Handle network or other errors
    console.error('API Request Error:', error);

    // Provide more detailed error information for debugging
    let errorMessage = 'Unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Add specific handling for network errors
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Could not connect to the API server. Please ensure the backend server is running at ' + API_URL;
        console.warn('API Connection Error: Make sure the backend server is running at', API_URL);
      }
    }

    return {
      data: null,
      error: errorMessage,
      status: 0
    };
  }
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Helper methods for common HTTP requests
 */
export const ApiService = {
  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @param headers - Custom headers
   */
  get: <T = any>(
    endpoint: string,
    params?: Record<string, string>,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> => {
    if (getToken()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return apiRequest<T>(endpoint, {
      method: HttpMethod.GET,
      params,
      headers
    });
  },

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Custom headers
   */
  post: <T = any>(
    endpoint: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> => {
    if (getToken()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return apiRequest<T>(endpoint, {
      method: HttpMethod.POST,
      body,
      headers
    });
  },

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Custom headers
   */
  put: <T = any>(
    endpoint: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> => {
    if (getToken()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return apiRequest<T>(endpoint, {
      method: HttpMethod.PUT,
      body,
      headers
    });
  },

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @param headers - Custom headers
   */
  delete: <T = any>(
    endpoint: string,
    params?: Record<string, string>,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> => {
    if (getToken()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return apiRequest<T>(endpoint, {
      method: HttpMethod.DELETE,
      params,
      headers
    });
  },

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Custom headers
   */
  patch: <T = any>(
    endpoint: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> => {
    if (getToken()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return apiRequest<T>(endpoint, {
      method: HttpMethod.PATCH,
      body,
      headers
    });
  }
};

export default ApiService;