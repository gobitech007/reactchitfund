import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, ROUTE_PERMISSIONS } from '../utils/role-utils';

/**
 * RoleTestComponent
 * A test component to verify role-based access control
 */
const RoleTestComponent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated() || !currentUser) {
    return <div>Not authenticated</div>;
  }

  const userRole = currentUser.role || 'customer';

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      left: '10px', 
      background: '#fff', 
      border: '1px solid #ccc', 
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Role Test Debug</h4>
      <p><strong>User:</strong> {currentUser.fullName}</p>
      <p><strong>Role:</strong> {userRole}</p>
      <p><strong>User ID:</strong> {currentUser.user_id}</p>
      
      <h5>Route Permissions:</h5>
      <ul>
        <li>Dashboard: {hasPermission(userRole, ROUTE_PERMISSIONS.DASHBOARD) ? '✅' : '❌'}</li>
        <li>Pay: {hasPermission(userRole, ROUTE_PERMISSIONS.PAY) ? '✅' : '❌'}</li>
        <li>Transaction History: {hasPermission(userRole, ROUTE_PERMISSIONS.TRANSACTION_HISTORY) ? '✅' : '❌'}</li>
      </ul>
      
      <h5>Raw User Data:</h5>
      <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '5px' }}>
        {JSON.stringify(currentUser, null, 2)}
      </pre>
    </div>
  );
};

export default RoleTestComponent;