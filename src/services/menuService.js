import { fakeProducts } from '@/mocks/fakeProducts';

export const menuService = {
  listMenuItems: async () => {
    return [...fakeProducts];
  },
  getMenuItemById: async (id) => {
    return fakeProducts.find((product) => product.id === id) || null;
  }
};
