import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export default function Login() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      const user = await authService.login(data);
      await checkUserAuth();
      toast.success('Bem-vindo de volta!');
      if (user.role === 'delivery') {
        navigate('/DeliveryDashboard');
      } else {
        navigate('/AdminHome');
      }
    } catch (error) {
      toast.error("Erro ao fazer login: " + error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return toast.error("Informe seu email");
    setIsResetting(true);
    try {
      await authService.resetPassword(resetEmail);
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setResetOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative">
      <Link to={createPageUrl('Home')} className="absolute top-6 left-6">
        <Button variant="ghost" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao site
        </Button>
      </Link>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-slate-600 dark:text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SliceOS</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Faça login para acessar o painel administrativo.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
            <input 
              type="email" 
              {...register('email')}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white ${
                errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
              placeholder="seu@email.com" 
            />
            {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Senha *</label>
              
              <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogTrigger asChild>
                  <button type="button" className="text-xs font-semibold text-red-600 hover:underline">
                    Esqueci minha senha
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recuperar Senha</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Seu Email de Cadastro</Label>
                      <Input 
                        type="email" 
                        value={resetEmail} 
                        onChange={(e) => setResetEmail(e.target.value)} 
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-slate-900" disabled={isResetting}>
                      {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar link de recuperação"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                {...register('password')}
                className={`w-full p-3 pr-12 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white ${
                  errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full py-6 text-lg rounded-xl mt-4 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Não tem uma conta?{' '}
            <Link to={createPageUrl('SignUp')} className="text-red-600 font-bold hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

