import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';

const getDefaultStoreId = () => import.meta.env.VITE_STORE_ID || '11111111-1111-1111-1111-111111111111';

export const customerService = {
  listCustomers: async (sortString = 'name') => {
    const user = await authService.getCurrentUser();
    if (!user?.store_id) return [];

    const sortColumn = sortString.replace(/^-/, '');
    const isAscending = !sortString.startsWith('-');

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', user.store_id)
      .order(sortColumn, { ascending: isAscending });

    if (error) throw error;
    return data;
  },

  getCustomerById: async (id) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  filterCustomers: async (filter = {}) => {
    const user = await authService.getCurrentUser();
    if (!user?.store_id) return [];

    let query = supabase.from('customers').select('*').eq('store_id', user.store_id);

    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  createCustomer: async (customerData) => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customerData, store_id: storeId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateCustomer: async (id, customerData) => {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  upsertCustomerByPhone: async (phone, customerData) => {
    // Usado no checkout para evitar duplicatas
    const storeId = getDefaultStoreId();
    
    // Verifica se já existe
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('store_id', storeId)
      .eq('phone', phone)
      .single();
      
    if (existing) {
      return await customerService.updateCustomer(existing.id, customerData);
    } else {
      return await customerService.createCustomer({ ...customerData, phone, store_id: storeId });
    }
  },

  deleteCustomer: async (id) => {
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  // Stubs para compatibilidade com a UI antiga (já que o endereço vai direto no pedido agora)
  listAddresses: async () => [],
  getAddressesForCustomer: async () => [],
  createAddress: async (data) => data,
  updateAddress: async (id, data) => data,
  deleteAddress: async (id) => null
};
