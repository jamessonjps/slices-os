import { supabase } from '@/lib/supabase';

export const authService = {
  getCurrentUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Busca o perfil na tabela public.users
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .or(`id.eq.${session.user.id},auth_id.eq.${session.user.id},email.eq.${session.user.email}`)
        .maybeSingle();

      // Força role master para o email mestre ou se definido no banco
      const isMasterEmail = session.user.email === 'jamesson.jps@gmail.com';
      const role = isMasterEmail ? 'master' : (userData?.role || 'staff');

      // Se achou por email mas não tinha auth_id, vincula agora
      if (userData && !userData.auth_id) {
        await supabase.from('users').update({ auth_id: session.user.id }).eq('id', userData.id);
      }

      const finalStoreId = userData?.store_id || session.user.user_metadata?.store_id || session.user.app_metadata?.store_id;

      // Se for o admin mestre e não tiver store_id no banco, tenta vincular ao da env
      if (isMasterEmail && !userData?.store_id) {
        const envStoreId = import.meta.env.VITE_STORE_ID;
        if (envStoreId) {
          await supabase.from('users').upsert({
            id: session.user.id,
            auth_id: session.user.id,
            email: session.user.email,
            full_name: userData?.full_name || 'Admin Master',
            role: 'master',
            store_id: envStoreId
          }, { onConflict: 'email' });
        }
      }

      return {
        id: session.user.id,
        email: session.user.email,
        name: userData?.full_name || session.user.user_metadata?.name || session.user.email,
        role: role,
        store_id: finalStoreId
      };
    } catch (error) {
      console.error("Auth error:", error);
      return null;
    }
  },
  
  isAuthenticated: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return Boolean(session);
    } catch (error) {
      return false;
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    return null;
  },
  
  isAdmin: (user) => {
    return ['admin', 'master'].includes(user?.role);
  },
  
  hasRole: (user, roles = []) => {
    if (!user) return false;
    if (roles.length === 0) return true;
    return roles.includes(user.role);
  },
  
  getStoreId: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.user_metadata?.store_id) return session.user.user_metadata.store_id;
    
    // Busca no perfil do usuário se não estiver no JWT
    const { data } = await supabase
      .from('users')
      .select('store_id')
      .or(`id.eq.${session?.user?.id},auth_id.eq.${session?.user?.id},email.eq.${session?.user?.email}`)
      .maybeSingle();
      
    return data?.store_id || import.meta.env.VITE_STORE_ID;
  },
  
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Busca perfil e vincula se necessário
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .or(`id.eq.${data.user.id},auth_id.eq.${data.user.id},email.eq.${data.user.email}`)
      .maybeSingle();

    const isMasterEmail = data.user.email === 'jamesson.jps@gmail.com';
    const role = isMasterEmail ? 'master' : (userData?.role || 'staff');

    if (userData && !userData.auth_id) {
      await supabase.from('users').update({ auth_id: data.user.id }).eq('id', userData.id);
    }

    if (userData?.status === 'pending') {
      await supabase.auth.signOut();
      throw new Error('Sua conta está aguardando aprovação do administrador.');
    }

    if (userData?.status === 'blocked') {
      await supabase.auth.signOut();
      throw new Error('Sua conta foi desativada. Entre em contato com o suporte.');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      role: role,
      store_id: userData?.store_id || data.user.app_metadata?.store_id
    };
  },

  signUp: async ({ email, password, fullName }) => {
    const storeId = import.meta.env.VITE_STORE_ID;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
          store_id: storeId
        }
      }
    });

    if (error) throw error;
    return data;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/ResetPassword`,
    });
    if (error) throw error;
    return true;
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return true;
  }
};
