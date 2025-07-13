/**
 * Utility functions for user-related operations
 */

/**
 * Check if a user is an admin
 * @param user The user object to check
 * @returns True if the user is an admin, false otherwise
 */
export const isAdmin = (user: any): boolean => {
  if (!user) return false;
  
  // Check multiple possible admin indicators for compatibility
  return (
    user.role === 'admin' || 
    user.isAdmin === true || 
    user.is_staff === true || 
    user.is_superuser === true
  );
};

/**
 * Check if a user is authenticated
 * @param user The user object to check
 * @returns True if the user is authenticated, false if not logged in
 */
export const isAuthenticated = (user: any): boolean => {
  return !!user;
};

/**
 * Check if a user should be shown in public listings
 * @param user The user object to check
 * @returns True if the user should be shown in public listings, false otherwise
 */
export const isPublicUser = (user: any): boolean => {
  if (!user) return false;
  
  // Don't show admin users in public listings
  if (isAdmin(user)) return false;
  
  // Check if the user is public based on is_public or profile.is_public
  const isPublicProfile = user.is_public !== false && 
    (user.profile ? user.profile.is_public !== false : true);
  
  return isPublicProfile;
};

/**
 * Check if a user has permission to perform specific actions
 * @param user The user object to check
 * @param action The action to check for: 'view_profiles', 'request_swap', 'message', etc.
 * @returns True if the user has permission to perform the action, false otherwise
 */
export const hasPermission = (user: any, action: string): boolean => {
  if (!user) return false;
  
  // Admin users have limited permissions - only admin actions
  if (isAdmin(user)) {
    const adminActions = [
      'admin_ban_user',
      'admin_delete_user', 
      'admin_reject_skill',
      'admin_send_broadcast',
      'admin_download_reports',
      'admin_monitor_swaps',
      'admin_view_all_users'
    ];
    return adminActions.includes(action);
  }
  
  // Regular users can do everything except admin actions
  const regularUserActions = [
    'view_profiles',
    'request_swap', 
    'message',
    'edit_profile',
    'view_requests',
    'submit_rating',
    'update_skills'
  ];
  return regularUserActions.includes(action);
};

/**
 * Check if a user can access regular user features
 * @param user The user object to check
 * @returns True if the user can access regular user features, false otherwise
 */
export const canAccessRegularFeatures = (user: any): boolean => {
  if (!user) return false;
  return user.role !== 'admin';
};

/**
 * Check if a user can access admin features
 * @param user The user object to check
 * @returns True if the user can access admin features, false otherwise
 */
export const canAccessAdminFeatures = (user: any): boolean => {
  if (!user) return false;
  return user.role === 'admin';
};
