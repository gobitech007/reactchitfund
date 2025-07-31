/**
 * Debug Helper Functions
 * Utility functions for debugging API issues, especially user creation errors
 */

import apiLogger from './api-logger';

/**
 * Global debug functions that can be called from browser console
 */
declare global {
  interface Window {
    debugApi: {
      getUserCreationErrors: () => void;
      downloadUserCreationLogs: () => void;
      clearLogs: () => void;
      getErrorSummary: () => void;
      showLastError: () => void;
      exportLogsToConsole: () => void;
      getAuthErrors: () => void;
      getPaymentErrors: () => void;
      getChitPaymentErrors: () => void;
      checkTokenStatus: () => void;
      debugAuthHeaders: () => void;
    };
  }
}

/**
 * Show user creation errors in console
 */
const getUserCreationErrors = () => {
  const errors = apiLogger.getUserCreationErrors();
  console.group('🚨 User Creation Errors');
  console.log(`Found ${errors.length} user creation errors:`);
  
  errors.forEach((error, index) => {
    console.group(`Error ${index + 1} - ${error.timestamp}`);
    console.log('Status:', error.responseStatus);
    console.log('Request Data:', error.requestData);
    console.log('Response Data:', error.responseData);
    console.log('Error Message:', error.error);
    console.groupEnd();
  });
  
  console.groupEnd();
  return errors;
};

/**
 * Download user creation logs
 */
const downloadUserCreationLogs = () => {
  const timestamp = new Date().toISOString().split('T')[0];
  apiLogger.downloadLogs('json', `user-creation-errors-${timestamp}.json`);
  console.log('📥 User creation logs downloaded');
};

/**
 * Clear all logs
 */
const clearLogs = () => {
  apiLogger.clearLogs();
  console.log('🗑️ All logs cleared');
};

/**
 * Get error summary
 */
const getErrorSummary = () => {
  const summary = apiLogger.getUserCreationErrorSummary();
  console.group('📊 User Creation Error Summary');
  console.log('Total Errors:', summary.totalErrors);
  console.log('Errors by Status Code:', summary.errorsByStatus);
  console.log('Common Errors:', summary.commonErrors);
  console.log('Recent Errors:', summary.recentErrors);
  console.groupEnd();
  return summary;
};

/**
 * Show the last error in detail
 */
const showLastError = () => {
  const errors = apiLogger.getUserCreationErrors();
  if (errors.length === 0) {
    console.log('ℹ️ No user creation errors found');
    return;
  }
  
  const lastError = errors[errors.length - 1];
  console.group('🔍 Last User Creation Error');
  console.log('Timestamp:', lastError.timestamp);
  console.log('Status:', lastError.responseStatus);
  console.log('Request Data:', JSON.stringify(lastError.requestData, null, 2));
  console.log('Response Data:', JSON.stringify(lastError.responseData, null, 2));
  console.log('Error Message:', lastError.error);
  
  // Parse validation errors if present
  if (lastError.responseData?.detail && Array.isArray(lastError.responseData.detail)) {
    console.log('Validation Errors:');
    lastError.responseData.detail.forEach((err: any, index: number) => {
      console.log(`  ${index + 1}. ${err.loc?.[err.loc.length - 1] || 'Field'}: ${err.msg}`);
    });
  }
  
  console.groupEnd();
  return lastError;
};

/**
 * Export all logs to console
 */
const exportLogsToConsole = () => {
  const allLogs = apiLogger.getAllLogs();
  console.group('📋 All API Logs');
  console.log(`Total logs: ${allLogs.length}`);
  console.log('Logs:', allLogs);
  console.groupEnd();
  return allLogs;
};

/**
 * Show authentication errors
 */
const getAuthErrors = () => {
  const authErrors = apiLogger.getAuthenticationErrors();
  console.group('🔐 Authentication Errors');
  console.log(`Found ${authErrors.length} authentication errors:`);
  
  authErrors.forEach((error, index) => {
    console.group(`Auth Error ${index + 1} - ${error.timestamp}`);
    console.log('Endpoint:', error.endpoint);
    console.log('Method:', error.method);
    console.log('Status:', error.responseStatus);
    console.log('Error:', error.error);
    console.log('Response Data:', error.responseData);
    console.groupEnd();
  });
  
  console.groupEnd();
  return authErrors;
};

/**
 * Show payment errors
 */
const getPaymentErrors = () => {
  const paymentErrors = apiLogger.getPaymentErrors();
  console.group('💳 Payment Errors');
  console.log(`Found ${paymentErrors.length} payment errors:`);
  
  paymentErrors.forEach((error, index) => {
    console.group(`Payment Error ${index + 1} - ${error.timestamp}`);
    console.log('Endpoint:', error.endpoint);
    console.log('Method:', error.method);
    console.log('Status:', error.responseStatus);
    console.log('Error:', error.error);
    console.log('Request Data:', error.requestData);
    console.log('Response Data:', error.responseData);
    console.groupEnd();
  });
  
  console.groupEnd();
  return paymentErrors;
};

/**
 * Show chit payment details errors specifically
 */
const getChitPaymentErrors = () => {
  const chitErrors = apiLogger.getChitPaymentDetailsErrors();
  console.group('🏦 Chit Payment Details Errors');
  console.log(`Found ${chitErrors.length} chit payment details errors:`);
  
  chitErrors.forEach((error, index) => {
    console.group(`Chit Error ${index + 1} - ${error.timestamp}`);
    console.log('Endpoint:', error.endpoint);
    console.log('Method:', error.method);
    console.log('Status:', error.responseStatus);
    console.log('Error:', error.error);
    console.log('Response Data:', error.responseData);
    console.groupEnd();
  });
  
  console.groupEnd();
  return chitErrors;
};

/**
 * Check current token status
 */
const checkTokenStatus = () => {
  const token = sessionStorage.getItem('authToken');
  const user = sessionStorage.getItem('user');
  
  console.group('🔑 Token Status Check');
  
  if (!token) {
    console.error('❌ No auth token found in sessionStorage');
  } else {
    console.log('✅ Auth token found');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    try {
      // Decode token to check expiration
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      const expTime = decoded.exp * 1000;
      const now = Date.now();
      
      console.log('Token expiration:', new Date(expTime).toLocaleString());
      console.log('Current time:', new Date(now).toLocaleString());
      
      if (now >= expTime) {
        console.error('❌ Token is EXPIRED');
      } else {
        const timeLeft = Math.round((expTime - now) / 1000 / 60);
        console.log(`✅ Token is valid (expires in ${timeLeft} minutes)`);
      }
      
      console.log('Token payload:', decoded);
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
    }
  }
  
  if (!user) {
    console.warn('⚠️ No user data found in sessionStorage');
  } else {
    console.log('✅ User data found');
    try {
      const userData = JSON.parse(user);
      console.log('User ID:', userData.id);
      console.log('User data:', userData);
    } catch (error) {
      console.error('❌ Failed to parse user data:', error);
    }
  }
  
  console.groupEnd();
  
  return {
    hasToken: !!token,
    hasUser: !!user,
    token: token ? token.substring(0, 50) + '...' : null
  };
};

/**
 * Debug authentication headers for the last request
 */
const debugAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  
  console.group('🔍 Authentication Headers Debug');
  
  if (!token) {
    console.error('❌ No token available for authentication');
  } else {
    console.log('✅ Token available');
    console.log('Authorization header would be:', `Bearer ${token.substring(0, 20)}...`);
    
    // Show what headers would be sent
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('Request headers that would be sent:');
    console.log('  Content-Type:', headers['Content-Type']);
    console.log('  Authorization:', `Bearer ${token.substring(0, 20)}...`);
  }
  
  console.groupEnd();
  
  return {
    token: token ? `Bearer ${token.substring(0, 20)}...` : null,
    hasValidToken: !!token
  };
};

/**
 * Initialize debug helpers
 */
export const initializeDebugHelpers = () => {
  // Only add debug helpers in development
  if (process.env.NODE_ENV === 'development') {
    window.debugApi = {
      getUserCreationErrors,
      downloadUserCreationLogs,
      clearLogs,
      getErrorSummary,
      showLastError,
      exportLogsToConsole,
      getAuthErrors,
      getPaymentErrors,
      getChitPaymentErrors,
      checkTokenStatus,
      debugAuthHeaders
    };

    console.log('🛠️ Debug API helpers loaded. Available commands:');
    console.log('  debugApi.getUserCreationErrors() - Show user creation errors');
    console.log('  debugApi.downloadUserCreationLogs() - Download error logs');
    console.log('  debugApi.getErrorSummary() - Show error summary');
    console.log('  debugApi.showLastError() - Show last error details');
    console.log('  debugApi.clearLogs() - Clear all logs');
    console.log('  debugApi.exportLogsToConsole() - Export all logs to console');
    console.log('  debugApi.getAuthErrors() - Show authentication errors');
    console.log('  debugApi.getPaymentErrors() - Show payment errors');
    console.log('  debugApi.getChitPaymentErrors() - Show chit payment errors');
    console.log('  debugApi.checkTokenStatus() - Check current token status');
    console.log('  debugApi.debugAuthHeaders() - Debug authentication headers');
  }
};

/**
 * Log user creation attempt for debugging
 */
export const logUserCreationAttempt = (userData: any) => {
  console.group('👤 User Creation Attempt');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User Data:', userData);
  console.log('Required fields check:');
  console.log('  - fullname:', userData.fullname ? '✅' : '❌');
  console.log('  - phone:', userData.phone ? '✅' : '❌');
  console.log('  - dob:', userData.dob ? '✅' : '❌');
  console.log('  - pin:', userData.pin ? '✅' : '❌');
  console.log('Optional fields:');
  console.log('  - email:', userData.email ? '✅' : '➖');
  console.log('  - aadhar:', userData.aadhar ? '✅' : '➖');
  console.groupEnd();
};

/**
 * Analyze common user creation issues
 */
export const analyzeUserCreationIssues = () => {
  const errors = apiLogger.getUserCreationErrors();
  const analysis = {
    totalErrors: errors.length,
    statusCodes: {} as Record<number, number>,
    fieldErrors: {} as Record<string, number>,
    commonIssues: [] as string[]
  };

  errors.forEach(error => {
    // Count status codes
    analysis.statusCodes[error.responseStatus] = 
      (analysis.statusCodes[error.responseStatus] || 0) + 1;

    // Analyze validation errors
    if (error.responseData?.detail && Array.isArray(error.responseData.detail)) {
      error.responseData.detail.forEach((validationError: any) => {
        if (validationError.loc) {
          const field = validationError.loc[validationError.loc.length - 1];
          analysis.fieldErrors[field] = (analysis.fieldErrors[field] || 0) + 1;
        }
      });
    }
  });

  // Generate common issues
  if (analysis.statusCodes[400] > 0) {
    analysis.commonIssues.push('Bad Request errors - check data format and required fields');
  }
  if (analysis.statusCodes[422] > 0) {
    analysis.commonIssues.push('Validation errors - check field formats and constraints');
  }
  if (analysis.statusCodes[409] > 0) {
    analysis.commonIssues.push('Conflict errors - user might already exist');
  }
  if (analysis.statusCodes[500] > 0) {
    analysis.commonIssues.push('Server errors - backend issues');
  }

  console.group('🔍 User Creation Issues Analysis');
  console.log('Analysis:', analysis);
  console.groupEnd();

  return analysis;
};

export default {
  initializeDebugHelpers,
  logUserCreationAttempt,
  analyzeUserCreationIssues,
  getUserCreationErrors,
  downloadUserCreationLogs,
  clearLogs,
  getErrorSummary,
  showLastError,
  exportLogsToConsole
};