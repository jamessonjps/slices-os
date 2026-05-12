import { fakeAuthUser } from '@/mocks/fakeAuth';

let currentUser = { ...fakeAuthUser };

export const authService = {
  getCurrentUser: async () => {
    return currentUser ?? { ...fakeAuthUser };
  },
  isAuthenticated: async () => {
    return Boolean(currentUser);
  },
  logout: async () => {
    currentUser = null;
    return null;
  },
  isAdmin: (user) => user?.role === 'admin',
  login: async (user) => {
    currentUser = { ...user };
    return currentUser;
  }
};
