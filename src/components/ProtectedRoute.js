import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

const ProtectedRoute = () => {
  const { isAuthenticated, currentUser, loading } = useAppSelector(state => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only set authChecked to true when loading is complete
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // Show nothing while checking authentication
  if (!authChecked) {
    return null;
  }

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;