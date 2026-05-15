import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { customerService } from '@/services/customerService';

const getDefaultStoreId = () => import.meta.env.VITE_STORE_ID || '11111111-1111-1111-1111-111111111111';

export const orderService = {
  listOrders: async (sortString = '-created_date', limitCount = 100) => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    const sortColumn = sortString.replace(/^-/, '');
    const isAscending = !sortString.startsWith('-');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .order(sortColumn, { ascending: isAscending })
      .limit(limitCount);

    if (error) throw error;
    return data;
  },

  getOrderById: async (id) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  createOrder: async (orderData) => {
    const storeId = getDefaultStoreId();

    let customerId = null;
    if (orderData.customer_phone) {
      try {
        const customer = await customerService.upsertCustomerByPhone(orderData.customer_phone, {
          name: orderData.customer_name,
          email: orderData.customer_email || ''
        });
        customerId = customer.id;
      } catch (err) {
        console.error("Erro ao salvar cliente no pedido:", err);
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        store_id: storeId,
        customer_id: customerId,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        status: orderData.status || 'pending',
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status || 'pending',
        delivery_type: orderData.delivery_type,
        address_text: orderData.address_text,
        total_amount: orderData.total_amount || 0,
        items: orderData.items || [],
        notes: orderData.notes
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  listOrdersByPhone: async (phone) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  updateOrder: async (id, orderData) => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    const { data, error } = await supabase
      .from('orders')
      .update({ ...orderData, store_id: storeId })
      .eq('id', id)
      .eq('store_id', storeId) // Garantia dupla para RLS
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar pedido:", error);
      throw error;
    }
    return data;
  },

  deleteOrder: async (id) => {
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  listKitchenOrders: async () => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .in('status', ['pending', 'preparing', 'ready', 'delivering'])
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  listActiveOrders: async () => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .in('status', ['pending', 'preparing'])
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  filterOrders: async (filter = {}) => {
    const user = await authService.getCurrentUser();
    const storeId = user?.store_id || getDefaultStoreId();

    let query = supabase.from('orders').select('*').eq('store_id', storeId);

    // Se passarmos uma função como filtro, precisamos retornar tudo e filtrar no JS (menos performático)
    // No MVP ideal usamos apenas filtros por objeto
    if (typeof filter === 'function') {
      const { data, error } = await query;
      if (error) throw error;
      return data.filter(filter);
    }

    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Inscrição em tempo real (Supabase Realtime)
  subscribe: (callback) => {
    const userStoreId = getDefaultStoreId(); // Ou pegue do auth caso consiga injetar aqui

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${userStoreId}`
        },
        (payload) => {
          console.log("Realtime Update in orders:", payload);
          callback(payload.new, payload.eventType);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log("Conectado ao Supabase Realtime (Orders)");
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error("Realtime offline:", status, err);
          // O fallback é feito no componente através de polling ou aviso
        }
      });

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
};
