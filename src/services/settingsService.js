import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';

const getDefaultStoreId = () => import.meta.env.VITE_STORE_ID || '11111111-1111-1111-1111-111111111111';

export const settingsService = {
  // Retorna as configurações completas da loja
  getStoreSettings: async () => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // Retorna defaults se não houver config no banco
    return data || {
      store_id: storeId,
      store_name: "Pizzaria SliceOS",
      whatsapp_number: "",
      delivery_fee: 0,
      business_hours: {},
      pix_key: ""
    };
  },

  // Mantido para retrocompatibilidade
  listSettings: async () => {
    try {
      const settings = await settingsService.getStoreSettings();
      return [
        { key: 'whatsapp_number', value: settings.whatsapp_number },
        { key: 'store_name', value: settings.store_name },
        { key: 'delivery_fee', value: settings.delivery_fee },
        { key: 'business_hours', value: JSON.stringify(settings.business_hours) }
      ];
    } catch (e) {
      return [];
    }
  },

  // Atualiza as configurações
  updateSettings: async (updates) => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    // Faz um upsert baseado no store_id
    const { data, error } = await supabase
      .from('settings')
      .upsert({ 
        store_id: storeId, 
        ...updates 
      }, { onConflict: 'store_id' })
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
    return data;
  },
  
  // Script para rodar no SQL Editor do Supabase para resetar a numeração (IDs):
  // TRUNCATE public.orders CASCADE;
  // ALTER SEQUENCE orders_id_seq RESTART WITH 1;
  // DELETE FROM public.users WHERE role != 'admin';
  
  resetSystem: async () => {
    // 1. Deletar todos os pedidos
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
      
    if (orderError) throw orderError;
    
    // 2. Deletar usuários que não são admins
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .neq('role', 'admin');
      
    if (userError) throw userError;
    
    return true;
  }
};
