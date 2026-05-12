import { fakeAddresses } from '@/mocks/fakeAddresses';
import { fakeAuthUser } from '@/mocks/fakeAuth';
import { fakeCustomers } from '@/mocks/fakeCustomers';
import { fakeOrders } from '@/mocks/fakeOrders';
import { fakeSettings } from '@/mocks/fakeSettings';

const nowId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const menuItems = [
  {
    id: 'menu-1001',
    name: 'Margherita',
    category: 'pizza_tradicional',
    type: 'pizza',
    price_small: 35,
    price_medium: 45,
    price_large: 55,
    description: 'Molho de tomate, mussarela e manjericao.',
    available: true,
    prep_time: 30
  },
  {
    id: 'menu-1002',
    name: 'Calabresa',
    category: 'pizza_tradicional',
    type: 'pizza',
    price_small: 40,
    price_medium: 50,
    price_large: 60,
    description: 'Calabresa fatiada com cebola e oregano.',
    available: true,
    prep_time: 30
  },
  {
    id: 'menu-1003',
    name: 'Quatro Queijos',
    category: 'pizza_especial',
    type: 'pizza',
    price_small: 42,
    price_medium: 52,
    price_large: 62,
    description: 'Mussarela, provolone, parmesao e gorgonzola.',
    available: true,
    prep_time: 35
  },
  {
    id: 'menu-1004',
    name: 'Chocolate com Morango',
    category: 'pizza_doce',
    type: 'pizza',
    price_small: 38,
    price_medium: 48,
    description: 'Chocolate, morango e leite condensado.',
    available: true,
    prep_time: 30
  },
  {
    id: 'menu-1005',
    name: 'Refrigerante 600ml',
    category: 'bebida',
    type: 'drink',
    price: 7.5,
    description: 'Opcoes de Coca-Cola, Guarana e Fanta.',
    available: true,
    prep_time: 0
  },
  {
    id: 'menu-1006',
    name: 'Agua Mineral',
    category: 'bebida',
    type: 'drink',
    price: 4,
    description: 'Garrafa 500ml.',
    available: true,
    prep_time: 0
  },
  {
    id: 'menu-1007',
    name: 'Brownie',
    category: 'sobremesa',
    type: 'dessert',
    price: 12,
    description: 'Brownie individual.',
    available: true,
    prep_time: 5
  }
];

const products = [
  {
    id: 'stock-1001',
    name: 'Mussarela',
    category: 'ingrediente',
    quantity: 12,
    unit: 'kg',
    min_quantity: 3,
    price: 32
  },
  {
    id: 'stock-1002',
    name: 'Calabresa',
    category: 'ingrediente',
    quantity: 7,
    unit: 'kg',
    min_quantity: 2,
    price: 28
  },
  {
    id: 'stock-1003',
    name: 'Molho de Tomate',
    category: 'ingrediente',
    quantity: 5,
    unit: 'kg',
    min_quantity: 2,
    price: 14
  },
  {
    id: 'stock-1004',
    name: 'Refrigerante 600ml',
    category: 'bebida',
    quantity: 36,
    unit: 'unidade',
    min_quantity: 12,
    price: 4.5
  },
  {
    id: 'stock-1005',
    name: 'Caixa para Pizza',
    category: 'embalagem',
    quantity: 80,
    unit: 'unidade',
    min_quantity: 20,
    price: 1.2
  }
];

const staffProfiles = [
  {
    id: 'staff-1001',
    name: 'Administrador',
    user_email: fakeAuthUser.email,
    phone: '(11) 99999-9999',
    role_title: 'Administrador',
    system_role: 'admin',
    default_password: 'admin123',
    notes: 'Usuario fake temporario'
  }
];

const users = [
  {
    id: fakeAuthUser.id,
    name: fakeAuthUser.name,
    full_name: fakeAuthUser.name,
    email: fakeAuthUser.email,
    role: fakeAuthUser.role
  }
];

export const database = {
  orders: [...fakeOrders],
  customers: [...fakeCustomers],
  addresses: [...fakeAddresses],
  menuItems,
  products,
  settings: [...fakeSettings],
  staffProfiles,
  users,
  currentUser: { ...users[0] }
};

export function createId(prefix) {
  return nowId(prefix);
}

export function sortRecords(items, sortString = '') {
  if (!sortString) return [...items];
  const direction = sortString.startsWith('-') ? -1 : 1;
  const key = sortString.replace(/^-/, '');
  return [...items].sort((a, b) => {
    const aValue = a?.[key] ?? '';
    const bValue = b?.[key] ?? '';
    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });
}

export function matchesFilter(item, filter = {}) {
  return Object.entries(filter).every(([key, value]) => item?.[key] === value);
}

export function removeById(collection, id) {
  const index = collection.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const [removed] = collection.splice(index, 1);
  return removed;
}

