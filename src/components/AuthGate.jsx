import React, { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AuthGate - Protege páginas baseado no modo
 * @param {Object} props
 * @param {"public"|"private"} props.mode - Modo de acesso da página
 * @param {React.ReactNode} props.children - Conteúdo da página
 */
export default function AuthGate({ mode, children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const didRedirectRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Auto-redirect para login (apenas uma vez)
  useEffect(() => {
    if (mode === 'private' && isAuthenticated === false && !didRedirectRef.current) {
      didRedirectRef.current = true;
      // Pequeno delay para evitar race conditions
      setTimeout(() => {
        base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      }, 100);
    }
  }, [mode, isAuthenticated]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Páginas públicas: sempre renderizam
  if (mode === 'public') {
    return <>{children}</>;
  }

  // Páginas privadas: checam autenticação
  if (mode === 'private') {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center max-w-md">
            <ShieldAlert className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Necessário</h1>
            <p className="text-slate-600 mb-6">
              Esta página requer autenticação. Faça login para continuar.
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname + window.location.search)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Ir para Login
            </Button>
          </div>
        </div>
      );
    }

    // Autenticado: renderiza conteúdo
    return <>{children}</>;
  }

  // Fallback
  return <>{children}</>;
}