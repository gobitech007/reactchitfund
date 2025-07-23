import React, { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { checkAuthStatus } from '../redux/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Check authentication status when the component mounts
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;