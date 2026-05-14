import { supabase } from '@/lib/supabase';
import { authService } from './authService';

export const productService = {
  listProducts: async () => {
    const storeId = await authService.getStoreId();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('name');

    if (error) throw error;
    return data;
  },

  createProduct: async (productData) => {
    const storeId = await authService.getStoreId();
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, store_id: storeId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateProduct: async (id, productData) => {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteProduct: async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
