import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';

const getDefaultStoreId = () => import.meta.env.VITE_STORE_ID || '11111111-1111-1111-1111-111111111111';

export const menuService = {
  listMenuItems: async (sortString = 'name') => {
    // Para listar, usamos a loja default (cliente) ou a loja do admin
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    const sortColumn = sortString.replace(/^-/, '');
    const isAscending = !sortString.startsWith('-');

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('store_id', storeId)
      .order(sortColumn, { ascending: isAscending });

    if (error) throw error;
    return data;
  },

  getMenuItemById: async (id) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data || null;
  },

  filterMenuItems: async (filter = {}) => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    let query = supabase.from('menu_items').select('*').eq('store_id', storeId);

    // Aplica os filtros básicos (igualdade)
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  createMenuItem: async (productData) => {
    const user = await authService.getCurrentUser();
    if (!user?.store_id) throw new Error("Usuário não tem loja associada.");

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ 
        ...productData, 
        store_id: user.store_id 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateMenuItem: async (id, productData) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteMenuItem: async (id) => {
    const { data, error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
