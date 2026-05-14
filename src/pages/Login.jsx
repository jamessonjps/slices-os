import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login({ email, password });
      await checkUserAuth(); // Atualiza o contexto global de Auth
      navigate('/AdminHome');
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleLogin} className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-slate-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 mt-2">Faça login para acessar o painel administrativo do SliceOS.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full py-6 text-lg rounded-xl mt-4" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
