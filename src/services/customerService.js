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
    const storeId = getDefaultStoreId();
    
    // Simplificando usando o recurso nativo de UPSERT do Supabase
    // O onConflict 'store_id,phone' garante que ele atualize se já existir esse par
    const { data, error } = await supabase
      .from('customers')
      .upsert({ 
        ...customerData, 
        phone, 
        store_id: storeId,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'store_id,phone' 
      })
      .select()
      .single();
      
    if (error) {
      console.error("Erro ao cadastrar cliente automaticamente:", error);
      throw error;
    }
    return data;
  },

  deleteCustomerByPhone: async (phone) => {
    const storeId = getDefaultStoreId();
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('store_id', storeId)
      .eq('phone', phone)
      .select();

    if (error) throw error;
    return data;
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
