import { authService } from '@/services/authService';
import { customerService } from '@/services/customerService';
import { menuService } from '@/services/menuService';
import { orderService } from '@/services/orderService';
import { settingsService } from '@/services/settingsService';
import { staffService } from '@/services/staffService';
import { stockService } from '@/services/stockService';

const emptySubscription = () => ({ unsubscribe: () => {} });

const entityAdapters = {
  Order: {
    list: (sortString, limit) => orderService.listOrders(sortString, limit),
    filter: (filter) => orderService.filterOrders(filter),
    create: (data) => orderService.createOrder(data),
    update: (id, data) => orderService.updateOrder(id, data),
    delete: (id) => orderService.deleteOrder(id),
    get: (id) => orderService.getOrderById(id),
    subscribe: emptySubscription
  },
  MenuItem: {
    list: (sortString) => menuService.listMenuItems(sortString),
    filter: (filter) => menuService.filterMenuItems(filter),
    create: (data) => menuService.createMenuItem(data),
    update: (id, data) => menuService.updateMenuItem(id, data),
    delete: (id) => menuService.deleteMenuItem(id),
    get: (id) => menuService.getMenuItemById(id),
    subscribe: emptySubscription
  },
  Product: {
    list: (sortString) => stockService.listProducts(sortString),
    filter: (filter) => stockService.filterProducts(filter),
    create: (data) => stockService.createProduct(data),
    update: (id, data) => stockService.updateProduct(id, data),
    delete: (id) => stockService.deleteProduct(id),
    get: (id) => stockService.getProductById(id),
    subscribe: emptySubscription
  },
  Customer: {
    list: (sortString) => customerService.listCustomers(sortString),
    filter: (filter) => customerService.filterCustomers(filter),
    create: (data) => customerService.createCustomer(data),
    update: (id, data) => customerService.updateCustomer(id, data),
    delete: (id) => customerService.deleteCustomer(id),
    get: (id) => customerService.getCustomerById(id),
    subscribe: emptySubscription
  },
  Address: {
    list: () => customerService.listAddresses(),
    filter: (filter) => customerService.listAddresses().then((items) => items.filter((item) => {
      return Object.entries(filter || {}).every(([key, value]) => item?.[key] === value);
    })),
    create: (data) => customerService.createAddress(data),
    update: (id, data) => customerService.updateAddress(id, data),
    delete: (id) => customerService.deleteAddress(id),
    get: async (id) => {
      const addresses = await customerService.listAddresses();
      return addresses.find((item) => item.id === id) || null;
    },
    subscribe: emptySubscription
  },
  Settings: {
    list: () => settingsService.listSettings(),
    filter: (filter) => settingsService.filterSettings(filter),
    create: (data) => settingsService.createSetting(data),
    update: (id, data) => settingsService.updateSetting(id, data),
    delete: (id) => settingsService.deleteSetting(id),
    get: (key) => settingsService.getSetting(key),
    subscribe: emptySubscription
  },
  StaffProfile: {
    list: (sortString) => staffService.listProfiles(sortString),
    filter: (filter) => staffService.filterProfiles(filter),
    create: (data) => staffService.createProfile(data),
    update: (id, data) => staffService.updateProfile(id, data),
    delete: (id) => staffService.deleteProfile(id),
    get: async (id) => {
      const profiles = await staffService.listProfiles();
      return profiles.find((item) => item.id === id) || null;
    },
    subscribe: emptySubscription
  },
  User: {
    list: () => staffService.listUsers(),
    filter: async (filter = {}) => {
      const users = await staffService.listUsers();
      return users.filter((user) => Object.entries(filter).every(([key, value]) => user?.[key] === value));
    },
    create: (data) => staffService.inviteUser(data.email, data.role),
    update: async (id, data) => {
      const users = await staffService.listUsers();
      const user = users.find((item) => item.id === id);
      if (!user) return null;
      Object.assign(user, data);
      return user;
    },
    delete: async () => null,
    get: async (id) => {
      const users = await staffService.listUsers();
      return users.find((item) => item.id === id) || null;
    },
    subscribe: emptySubscription
  }
};

const createEntityProxy = () => {
  return new Proxy(entityAdapters, {
    get(target, entityName) {
      const key = String(entityName);
      if (target[key]) return target[key];
      throw new Error(`Local data adapter not implemented for entity "${key}"`);
    }
  });
};

export const base44 = {
  auth: {
    me: () => authService.getCurrentUser(),
    logout: () => authService.logout(),
    redirectToLogin: () => {},
    isAuthenticated: () => authService.isAuthenticated()
  },
  entities: createEntityProxy(),
  users: {
    inviteUser: (email, role) => staffService.inviteUser(email, role)
  },
  integrations: {
    Core: {
      SendEmail: async (payload) => ({ id: `email-${Date.now()}`, ...payload, sent: false })
    }
  },
  appLogs: {
    logUserInApp: async (pageName) => ({ pageName, logged: true })
  }
};
