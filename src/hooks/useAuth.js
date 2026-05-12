import { useAuth as useAuthContext } from '@/lib/AuthContext';

export function useAuth() {
  return useAuthContext();
}
