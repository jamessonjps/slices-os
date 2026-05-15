import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';

const getDefaultStoreId = () => import.meta.env.VITE_STORE_ID || '11111111-1111-1111-1111-111111111111';

export const menuService = {
  listMenuItems: async (sortString = 'name') => {
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
    return data.map(item => ({
      ...item,
      price: item.price != null ? Number(item.price) : null,
      price_small: item.price_small != null ? Number(item.price_small) : null,
      price_medium: item.price_medium != null ? Number(item.price_medium) : null,
      price_large: item.price_large != null ? Number(item.price_large) : null,
    }));
  },

  getMenuItemById: async (id) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return {
      ...data,
      price: data.price != null ? Number(data.price) : null,
      price_small: data.price_small != null ? Number(data.price_small) : null,
      price_medium: data.price_medium != null ? Number(data.price_medium) : null,
      price_large: data.price_large != null ? Number(data.price_large) : null,
    };
  },

  filterMenuItems: async (filter = {}) => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    let query = supabase.from('menu_items').select('*').eq('store_id', storeId);

    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(item => ({
      ...item,
      price: item.price != null ? Number(item.price) : null,
      price_small: item.price_small != null ? Number(item.price_small) : null,
      price_medium: item.price_medium != null ? Number(item.price_medium) : null,
      price_large: item.price_large != null ? Number(item.price_large) : null,
    }));
  },

  listProducts: async (categoryId = null) => {
    const storeId = getDefaultStoreId();
    let query = supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    
    return (data || []).map(p => ({
      ...p,
      price: Number(p.price || 0),
      half_price: p.half_price ? Number(p.half_price) : null
    }));
  },

  listCategories: async () => {
    const storeId = getDefaultStoreId();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  getProductById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      price: Number(data.price || 0),
      half_price: data.half_price ? Number(data.half_price) : null
    };
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

  toggleAvailability: async (id, currentStatus) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ available: !currentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  toggleHalfHalf: async (id, currentStatus) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ allow_half_half: !currentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteMenuItem: async (id) => {
    // Soft delete: marca como indispon\u00edvel em vez de deletar
    // Isso protege o hist\u00f3rico de pedidos que referenciam este item
    const { data, error } = await supabase
      .from('menu_items')
      .update({ available: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  hardDeleteMenuItem: async (id) => {
    // Delete real - usar apenas quando o item nunca foi vendido
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
