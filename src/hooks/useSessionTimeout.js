import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { safeSessionStorage } from '../utils/safe-storage';

const useSessionTimeout = (options = {}) => {
  const {
    timeout = 15 * 60 * 1000,
    warningTime = 2 * 60 * 1000,
    onWarning = null,
    onTimeout = null,
  } = options;

  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const isWarningShownRef = useRef(false);

  const handleLogout = useCallback(() => {
    console.log('Session timeout - logging out user');
    logout();
    navigate('/login', { replace: true });
    if (onTimeout) {
      onTimeout();
    }
  }, [logout, navigate, onTimeout]);

  const resetSessionTimeout = useCallback(() => {
    if (!isAuthenticated()) return;

    lastActivityRef.current = Date.now();
    isWarningShownRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    const warningDelay = timeout - warningTime;

    warningTimeoutRef.current = setTimeout(() => {
      if (!isWarningShownRef.current) {
        console.log('Session warning - showing warning modal');
        isWarningShownRef.current = true;
        if (onWarning) {
          onWarning();
        }
      }
    }, warningDelay);

    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeout);
  }, [timeout, warningTime, isAuthenticated, onWarning, handleLogout]);

  const handleActivity = useCallback(() => {
    if (isAuthenticated()) {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity > 1000) {
        resetSessionTimeout();
      }
    }
  }, [isAuthenticated, resetSessionTimeout]);

  const handleBeforeUnload = useCallback((e) => {
    if (isAuthenticated()) {
      safeSessionStorage.setItem('lastActivity', Date.now().toString());
    }
  }, [isAuthenticated]);

  const handlePopState = useCallback((e) => {
    console.log('Browser back button clicked');
    if (isAuthenticated()) {
      handleActivity();
    }
  }, [isAuthenticated, handleActivity]);

  useEffect(() => {
    if (!isAuthenticated()) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    resetSessionTimeout();

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [isAuthenticated, resetSessionTimeout, handleActivity, handleBeforeUnload, handlePopState]);

  return {
    resetTimeout: resetSessionTimeout,
    handleLogout,
    isWarningShown: isWarningShownRef.current,
  };
};

export default useSessionTimeout;
