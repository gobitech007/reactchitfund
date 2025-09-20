import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, getDefaultRole, ROLES } from '../utils/role-utils';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * RoleBasedRoute Component
 * Protects routes based on user roles
 * Redirects users with unauthorized roles to specified page
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard' 
}) => {
  const { currentUser, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If no user data available, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Get user role (default to 'customer' if not specified)
  const userRole = currentUser.role || getDefaultRole();

  // Debug logging
  // console.log('RoleBasedRoute Debug:', {
  //   userRole,
  //   allowedRoles,
  //   currentUser: currentUser,
  //   redirectTo
  // });

  // Check if user's role is in the allowed roles
  const userHasPermission = hasPermission(userRole, allowedRoles);

  // console.log(`Permission check: User role '${userRole}' has permission: ${userHasPermission}`);

  // If user doesn't have permission, redirect to specified page
  if (!userHasPermission) {
    // If user is a customer, redirect to pay page, otherwise redirect to dashboard
    const redirectPath = userRole === ROLES.CUSTOMER ? '/pay' : '/dashboard';
    // console.log(`Access denied: User role '${userRole}' not in allowed roles [${allowedRoles.join(', ')}]. Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // User has permission, render the protected content
  return <>{children}</>;
};

export default RoleBasedRoute;