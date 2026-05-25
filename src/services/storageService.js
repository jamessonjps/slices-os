import { supabase } from '@/lib/supabase';

export const storageService = {
  /**
   * Faz upload de um arquivo para o bucket "images"
   * @param {File} file Arquivo a ser feito o upload
   * @returns {Promise<string>} URL pública da imagem
   */
  uploadImage: async (file) => {
    if (!file) throw new Error("Nenhum arquivo selecionado.");

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Gerar URL pública
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
