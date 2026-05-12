import { createId, database, matchesFilter, removeById, sortRecords } from '@/data/database';

export const customerService = {
  listCustomers: async (sortString = 'name') => {
    return sortRecords(database.customers, sortString);
  },
  getCustomerById: async (id) => {
    return database.customers.find((customer) => customer.id === id) || null;
  },
  filterCustomers: async (filter = {}) => {
    return database.customers.filter((customer) => matchesFilter(customer, filter));
  },
  createCustomer: async (data) => {
    const customer = {
      id: createId('cus'),
      notes: '',
      ...data
    };
    database.customers.unshift(customer);
    return customer;
  },
  updateCustomer: async (id, data) => {
    const customer = database.customers.find((item) => item.id === id);
    if (!customer) return null;
    Object.assign(customer, data);
    return customer;
  },
  deleteCustomer: async (id) => {
    return removeById(database.customers, id);
  },
  listAddresses: async () => {
    return [...database.addresses];
  },
  getAddressesForCustomer: async (customerId) => {
    return database.addresses.filter((address) => address.customer_id === customerId);
  },
  createAddress: async (data) => {
    const address = {
      id: createId('addr'),
      ...data
    };
    database.addresses.unshift(address);
    return address;
  },
  updateAddress: async (id, data) => {
    const address = database.addresses.find((item) => item.id === id);
    if (!address) return null;
    Object.assign(address, data);
    return address;
  },
  deleteAddress: async (id) => {
    return removeById(database.addresses, id);
  }
};
