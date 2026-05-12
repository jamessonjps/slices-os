import { database } from '@/data/database';

export const authService = {
  getCurrentUser: async () => {
    return database.currentUser;
  },
  isAuthenticated: async () => {
    return Boolean(database.currentUser);
  },
  logout: async () => {
    database.currentUser = null;
    return null;
  },
  isAdmin: (user) => user?.role === 'admin',
  hasRole: (user, roles = []) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return Boolean(user?.role && allowedRoles.includes(user.role));
  },
  login: async (user) => {
    const normalizedUser = {
      id: user.id || `user-${Date.now()}`,
      name: user.name || user.full_name || user.email,
      full_name: user.full_name || user.name || user.email,
      email: user.email,
      role: user.role || 'user'
    };
    database.currentUser = normalizedUser;
    if (!database.users.some((item) => item.email === normalizedUser.email)) {
      database.users.push(normalizedUser);
    }
    return database.currentUser;
  }
};
