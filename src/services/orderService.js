import { createId, database, matchesFilter, sortRecords } from '@/data/database';

function sortOrders(items, sortString) {
  return sortRecords(items, sortString || '-created_date');
}

function normalizePhone(phone = '') {
  return String(phone).replace(/\D/g, '');
}

function upsertCustomerFromOrder(order) {
  if (!order.customer_name || !order.customer_phone) return;

  const normalizedOrderPhone = normalizePhone(order.customer_phone);
  let customer = database.customers.find(
    (item) => normalizePhone(item.phone) === normalizedOrderPhone
  );

  if (!customer) {
    customer = {
      id: createId('cus'),
      name: order.customer_name,
      phone: order.customer_phone,
      email: order.customer_email || '',
      notes: '',
      last_order_id: order.id
    };
    database.customers.unshift(customer);
  } else {
    customer.name = order.customer_name || customer.name;
    customer.phone = order.customer_phone || customer.phone;
    customer.last_order_id = order.id;
  }

  if (order.delivery_type === 'delivery' && order.address_text) {
    const exists = database.addresses.some(
      (address) => address.customer_id === customer.id && address.address_text === order.address_text
    );
    if (!exists) {
      database.addresses.unshift({
        id: createId('addr'),
        customer_id: customer.id,
        address_text: order.address_text,
        street: order.address_text,
        number: '',
        district: '',
        city: '',
        complement: ''
      });
    }
  }
}

export const orderService = {
  listOrders: async (sortString = '-created_date', limit = 100) => {
    const sorted = sortOrders(database.orders, sortString);
    return sorted.slice(0, limit);
  },
  getOrderById: async (id) => {
    return database.orders.find((order) => order.id === id) || null;
  },
  createOrder: async (data) => {
    const newOrder = {
      id: createId('order'),
      created_date: new Date().toISOString(),
      status: 'pending',
      payment_status: data.payment_method === 'cash' ? 'pending' : 'paid',
      total_amount: data.total_amount || 0,
      pizzas: data.pizzas ?? [],
      drinks: data.drinks ?? [],
      ...data
    };
    database.orders.unshift(newOrder);
    upsertCustomerFromOrder(newOrder);
    return newOrder;
  },
  updateOrder: async (id, data) => {
    const order = database.orders.find((item) => item.id === id);
    if (!order) return null;
    Object.assign(order, data);
    upsertCustomerFromOrder(order);
    return order;
  },
  deleteOrder: async (id) => {
    const index = database.orders.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const [removed] = database.orders.splice(index, 1);
    return removed;
  },
  listKitchenOrders: async () => {
    return database.orders.filter((o) => ['pending', 'preparing', 'ready', 'delivering'].includes(o.status));
  },
  listActiveOrders: async () => {
    return database.orders.filter((o) => ['pending', 'preparing'].includes(o.status));
  },
  filterOrders: async (filterOrPredicate = {}) => {
    if (typeof filterOrPredicate === 'function') {
      return database.orders.filter(filterOrPredicate);
    }
    return database.orders.filter((order) => matchesFilter(order, filterOrPredicate));
  },
  subscribe: (callback) => {
    // Fake subscription for local mock data.
    return { unsubscribe: () => {} };
  }
};
