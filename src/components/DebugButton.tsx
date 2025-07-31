/**
 * Debug Button Component
 * Floating button to access API logs, only visible in development
 */

import React, { useState } from 'react';
import ApiLogViewer from './ApiLogViewer';
import { isDevelopment, isDebugEnabled } from '../utils/env-utils';
import apiLogger from '../utils/api-logger';

const DebugButton: React.FC = () => {
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [authErrorCount, setAuthErrorCount] = useState(0);
  const [chitErrorCount, setChitErrorCount] = useState(0);

  // Only show in development or when debug is enabled
  const shouldShow = isDevelopment() || isDebugEnabled();

  React.useEffect(() => {
    if (shouldShow) {
      // Update error count every 10 seconds
      const updateErrorCount = () => {
        const userCreationErrors = apiLogger.getUserCreationErrors();
        const authErrors = apiLogger.getAuthenticationErrors();
        const chitErrors = apiLogger.getChitPaymentDetailsErrors();
        
        setErrorCount(userCreationErrors.length);
        setAuthErrorCount(authErrors.length);
        setChitErrorCount(chitErrors.length);
      };

      updateErrorCount();
      const interval = setInterval(updateErrorCount, 10000);
      return () => clearInterval(interval);
    }
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Floating Debug Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsLogViewerOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors relative"
          title={`View API Logs - Auth Errors: ${authErrorCount}, Chit Errors: ${chitErrorCount}, User Errors: ${errorCount}`}
        >
          📋
          {/* Show auth errors with highest priority */}
          {authErrorCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {authErrorCount > 99 ? '99+' : authErrorCount}
            </span>
          )}
          {/* Show chit errors if no auth errors */}
          {authErrorCount === 0 && chitErrorCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {chitErrorCount > 99 ? '99+' : chitErrorCount}
            </span>
          )}
          {/* Show user creation errors if no auth or chit errors */}
          {authErrorCount === 0 && chitErrorCount === 0 && errorCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {errorCount > 99 ? '99+' : errorCount}
            </span>
          )}
        </button>
      </div>

      {/* Log Viewer Modal */}
      <ApiLogViewer 
        isOpen={isLogViewerOpen} 
        onClose={() => setIsLogViewerOpen(false)} 
      />
    </>
  );
};

export default DebugButton;