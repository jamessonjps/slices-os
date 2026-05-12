import { createId, database, matchesFilter, removeById, sortRecords } from '@/data/database';

export const menuService = {
  listMenuItems: async (sortString = 'name') => {
    return sortRecords(database.menuItems, sortString);
  },
  getMenuItemById: async (id) => {
    return database.menuItems.find((product) => product.id === id) || null;
  },
  filterMenuItems: async (filter = {}) => {
    return database.menuItems.filter((item) => matchesFilter(item, filter));
  },
  createMenuItem: async (data) => {
    const item = {
      id: createId('menu'),
      available: true,
      prep_time: 30,
      ...data
    };
    database.menuItems.unshift(item);
    return item;
  },
  updateMenuItem: async (id, data) => {
    const item = database.menuItems.find((product) => product.id === id);
    if (!item) return null;
    Object.assign(item, data);
    return item;
  },
  deleteMenuItem: async (id) => {
    return removeById(database.menuItems, id);
  }
};
