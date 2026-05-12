const createEntityProxy = () => {
  return new Proxy(/** @type {Record<string, any>} */ ({}), {
    get(target, entityName) {
      const key = String(entityName);
      if (!target[key]) {
        const entity = {
          list: async () => [],
          filter: async () => [],
          create: async () => ({}),
          update: async () => ({}),
          delete: async () => ({}),
          subscribe: () => ({ unsubscribe: () => {} }),
          get: async () => ({}),
        };
        target[key] = entity;
      }
      return target[key];
    }
  });
};

export const base44 = {
  auth: {
    me: async () => ({ id: 'admin', name: 'Admin', role: 'admin' }),
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
