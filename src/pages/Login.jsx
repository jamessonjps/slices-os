import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export default function Login() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      await authService.login(data);
      await checkUserAuth();
      toast.success('Bem-vindo de volta!');
      navigate('/AdminHome');
    } catch (error) {
      toast.error("Erro ao fazer login: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-slate-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 mt-2 text-sm">Faça login para acessar o painel administrativo.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              {...register('email')}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all ${
                errors.email ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="seu@email.com" 
            />
            {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" 
              {...register('password')}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all ${
                errors.password ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
            />
            {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full py-6 text-lg rounded-xl mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : "Entrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

