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
      business_hours: {}
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
    if (!user?.store_id) throw new Error("Usuário sem loja vinculada.");

    // Faz um upsert baseado no store_id
    const { data, error } = await supabase
      .from('settings')
      .upsert({ 
        store_id: user.store_id, 
        ...updates 
      }, { onConflict: 'store_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
