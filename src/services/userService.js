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

    if (error) {
      console.error("Error listing users:", error);
      throw error;
    }
    return data;
  },

  createUser: async (userData) => {
    try {
      const storeId = await authService.getStoreId();
      console.log("Tentando cadastrar usuário na loja:", storeId);
      
      if (!storeId) {
        throw new Error("Seu perfil não tem uma Loja (Store ID) vinculada. Verifique as configurações.");
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([{ ...userData, store_id: storeId }])
        .select()
        .single();

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message || "Erro no banco de dados ao salvar.");
      }
      return data;
    } catch (err) {
      console.error("Create user exception:", err);
      throw err;
    }
  },

  updateUser: async (id, userData) => {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }
    return data;
  },

  deleteUser: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
    return true;
  }
};
