import { createId, database, matchesFilter, removeById, sortRecords } from '@/data/database';

export const stockService = {
  listProducts: async (sortString = 'name') => {
    return sortRecords(database.products, sortString);
  },
  getProductById: async (id) => {
    return database.products.find((product) => product.id === id) || null;
  },
  filterProducts: async (filter = {}) => {
    return database.products.filter((product) => matchesFilter(product, filter));
  },
  createProduct: async (data) => {
    const product = {
      id: createId('stock'),
      min_quantity: 0,
      price: 0,
      ...data
    };
    database.products.unshift(product);
    return product;
  },
  updateProduct: async (id, data) => {
    const product = database.products.find((item) => item.id === id);
    if (!product) return null;
    Object.assign(product, data);
    return product;
  },
  deleteProduct: async (id) => {
    return removeById(database.products, id);
  }
};
