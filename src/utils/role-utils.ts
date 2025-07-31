/**
 * Role Utilities
 * Helper functions for role-based access control
 */

export type UserRole = 'customer' | 'admin' | 'manager';

export const ROLES: Record<string, UserRole> = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager'
};

/**
 * Check if a user has permission to access a resource
 * @param userRole - The user's role
 * @param allowedRoles - Array of roles that can access the resource
 * @returns Boolean indicating if user has permission
 */
export const hasPermission = (userRole: string | undefined, allowedRoles: string[]): boolean => {
  if (!userRole) {
    return false;
  }
  
  return allowedRoles.includes(userRole);
};

/**
 * Get default role for new users
 * @returns Default role string
 */
export const getDefaultRole = (): UserRole => {
  return ROLES.CUSTOMER;
};

/**
 * Check if a role is valid
 * @param role - Role to validate
 * @returns Boolean indicating if role is valid
 */
export const isValidRole = (role: string): boolean => {
  return Object.values(ROLES).includes(role as UserRole);
};

/**
 * Get user-friendly role name
 * @param role - Role string
 * @returns Formatted role name
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case ROLES.CUSTOMER:
      return 'Customer';
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.MANAGER:
      return 'Manager';
    default:
      return 'Unknown';
  }
};

/**
 * Role-based route configurations
 */
export const ROUTE_PERMISSIONS = {
  DASHBOARD: [ROLES.ADMIN, ROLES.MANAGER], // Only admin and manager can access dashboard
  PAY: [ROLES.CUSTOMER, ROLES.ADMIN], // Only customers can access payment page
  TRANSACTION_HISTORY: [ROLES.ADMIN, ROLES.MANAGER], // Only admin and manager can view transaction history
  USER_MANAGEMENT: [ROLES.ADMIN],
  REPORTS: [ROLES.ADMIN, ROLES.MANAGER]
};