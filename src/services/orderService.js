import { fakeOrders } from '@/mocks/fakeOrders';

const orders = [...fakeOrders];

function sortOrders(items, sortString) {
  const direction = sortString?.startsWith('-') ? -1 : 1;
  const key = sortString?.replace(/^-/, '') || 'created_date';
  return [...items].sort((a, b) => {
    const aValue = a[key] || '';
    const bValue = b[key] || '';
    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });
}

export const orderService = {
  listOrders: async (sortString = '-created_date', limit = 100) => {
    const sorted = sortOrders(orders, sortString);
    return sorted.slice(0, limit);
  },
  getOrderById: async (id) => {
    return orders.find((order) => order.id === id) || null;
  },
  createOrder: async (data) => {
    const newOrder = {
      id: `order-${Date.now()}`,
      created_date: new Date().toISOString(),
      status: 'pending',
      payment_status: data.payment_method === 'cash' ? 'pending' : 'paid',
      total_amount: data.total_amount || 0,
      pizzas: data.pizzas ?? [],
      drinks: data.drinks ?? [],
      ...data
    };
    orders.unshift(newOrder);
    return newOrder;
  },
  updateOrder: async (id, data) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return null;
    Object.assign(order, data);
    return order;
  },
  listKitchenOrders: async () => {
    return orders.filter((o) => ['pending', 'preparing', 'ready', 'delivering'].includes(o.status));
  },
  listActiveOrders: async () => {
    return orders.filter((o) => ['pending', 'preparing'].includes(o.status));
  },
  filterOrders: async (predicate) => {
    return orders.filter(predicate);
  },
  subscribe: (callback) => {
    // Fake subscription for local mock data.
    return { unsubscribe: () => {} };
  }
};
