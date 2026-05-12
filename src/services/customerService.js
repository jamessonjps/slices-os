import { fakeCustomers } from '@/mocks/fakeCustomers';
import { fakeAddresses } from '@/mocks/fakeAddresses';

const customers = [...fakeCustomers];
const addresses = [...fakeAddresses];

export const customerService = {
  listCustomers: async () => {
    return [...customers];
  },
  getCustomerById: async (id) => {
    return customers.find((customer) => customer.id === id) || null;
  },
  updateCustomer: async (id, data) => {
    const customer = customers.find((item) => item.id === id);
    if (!customer) return null;
    Object.assign(customer, data);
    return customer;
  },
  listAddresses: async () => {
    return [...addresses];
  },
  getAddressesForCustomer: async (customerId) => {
    return addresses.filter((address) => address.customer_id === customerId);
  }
};
