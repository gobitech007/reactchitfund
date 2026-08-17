import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSessionTimeout from '../hooks/useSessionTimeout';
import { useAuth } from './AuthContext';

export const SessionTimeoutProvider = ({ children }) => {
  const { t } = useTranslation();
  const { logout, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120);
  const remainingTimeRef = React.useRef(120);
  const countdownRef = React.useRef(null);

  const handleWarning = useCallback(() => {
    if (isAuthenticated()) {
      setShowWarning(true);
      remainingTimeRef.current = 120;
      setRemainingTime(120);

      if (countdownRef.current) clearInterval(countdownRef.current);

      countdownRef.current = setInterval(() => {
        remainingTimeRef.current -= 1;
        setRemainingTime(remainingTimeRef.current);

        if (remainingTimeRef.current <= 0) {
          clearInterval(countdownRef.current);
          setShowWarning(false);
        }
      }, 1000);
    }
  }, [isAuthenticated]);

  const { handleLogout } = useSessionTimeout({
    timeout: 15 * 60 * 1000,
    warningTime: 2 * 60 * 1000,
    onWarning: handleWarning,
  });

  const handleContinueSession = () => {
    setShowWarning(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  const handleLogoutNow = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setShowWarning(false);
    logout();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {children}
      <Dialog
        open={showWarning}
        onClose={() => {}}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('session.timeout.warning') || 'Session Timeout Warning'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              {t('session.timeout.message') ||
                'Your session is about to expire due to inactivity.'}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: 'error.main' }}>
              {t('session.timeout.timeRemaining') || 'Time remaining'}: {formatTime(remainingTime)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              {t('session.timeout.continue') ||
                'Click "Continue Session" to stay logged in.'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutNow} variant="outlined" color="error">
            {t('session.timeout.logout') || 'Logout'}
          </Button>
          <Button onClick={handleContinueSession} variant="contained" color="primary">
            {t('session.timeout.continue') || 'Continue Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SessionTimeoutProvider;
