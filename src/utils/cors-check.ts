/**
 * CORS Check Utility
 * Provides functions to check CORS configuration and diagnose issues
 */

import { checkCorsSetup } from '../services/api.service';
import { getApiUrl } from './env-utils';

/**
 * Check CORS configuration on application startup
 * This helps diagnose CORS issues early
 */
export const performCorsCheck = async (): Promise<void> => {
  try {
    // console.log('🔍 Checking CORS configuration...');
    const corsWorking = await checkCorsSetup();
    
    if (corsWorking) {
      console.log('✅ CORS is properly configured');
    } else {
      console.warn('⚠️ CORS check failed. API requests may not work correctly.');
      console.warn('Make sure your backend server has CORS properly configured for:', window.location.origin);
    }
  } catch (error) {
    console.error('❌ CORS check error:', error);
    console.warn(`
      CORS Error Troubleshooting:
      1. Ensure the backend server is running
      2. Check that the API URL (${getApiUrl()}) is correct
      3. Verify the backend has CORS configured to allow requests from ${window.location.origin}
      4. Check for network issues or browser extensions blocking requests
    `);
  }
};

export default {
  performCorsCheck
};