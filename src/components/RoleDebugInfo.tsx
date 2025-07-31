import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleDisplayName, getDefaultRole } from '../utils/role-utils';

/**
 * RoleDebugInfo Component
 * Displays current user role information for debugging purposes
 * Only shows in development mode
 */
const RoleDebugInfo: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isAuthenticated() || !currentUser) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '12px',
        zIndex: 9999,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <strong>Role Debug:</strong> Not authenticated
      </div>
    );
  }

  const userRole = currentUser.role || getDefaultRole();
  const displayName = getRoleDisplayName(userRole);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div><strong>Role Debug:</strong></div>
      <div>User: {currentUser.fullName}</div>
      <div>Role: {displayName} ({userRole})</div>
      <div>User ID: {currentUser.user_id}</div>
    </div>
  );
};

export default RoleDebugInfo;