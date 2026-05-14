import { supabase } from '@/lib/supabase';

export const authService = {
  getCurrentUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email,
        role: 'admin', // Simplificação para MVP: usuário autenticado é admin
        store_id: session.user.user_metadata?.store_id || session.user.app_metadata?.store_id
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
    // No MVP, todo mundo que fez login no Supabase Auth tem acesso de admin
    return Boolean(user);
  },
  
  hasRole: (user, roles = []) => {
    return Boolean(user);
  },
  
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.user.id,
      email: data.user.email,
      role: 'admin',
      store_id: data.user.app_metadata?.store_id
    };
  }
};
