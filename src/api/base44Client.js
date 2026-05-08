const createEntityProxy = () => {
  return new Proxy({}, {
    get(target, entityName) {
      if (!target[entityName]) {
        const entity = {
          list: async () => [],
          filter: async () => [],
          create: async () => ({}),
          update: async () => ({}),
          delete: async () => ({}),
          subscribe: () => ({ unsubscribe: () => {} }),
          get: async () => ({}),
        };
        target[entityName] = entity;
      }
      return target[entityName];
    }
  });
};

export const base44 = {
  auth: {
    me: async () => ({ id: 'guest', name: 'Guest' }),
    logout: async () => {},
    redirectToLogin: () => {},
    isAuthenticated: async () => true,
  },
  entities: createEntityProxy(),
  users: {
    inviteUser: async () => ({})
  },
  integrations: {
    Core: {
      SendEmail: async () => ({})
    }
  },
  appLogs: {
    logUserInApp: async () => ({})
  }
};
