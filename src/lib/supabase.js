import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!rawUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');
