import { supabase } from '@/lib/supabase';
import { authService } from './authService';

export const userService = {
  listUsers: async () => {
    const storeId = await authService.getStoreId();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('store_id', storeId)
      .order('full_name');

    if (error) throw error;
    return data;
  },

  createUser: async (userData) => {
    const storeId = await authService.getStoreId();
    const { data, error } = await supabase
      .from('users')
      .insert([{ ...userData, store_id: storeId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateUser: async (id, userData) => {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteUser: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
