import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChefHat, UserPlus, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import logoUrl from '@/assets/logo.jpeg';

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error("As senhas n\u00E3o coincidem!");
    }
    if (form.password.length < 6) {
      return toast.error("A senha deve ter pelo menos 6 caracteres.");
    }

    setLoading(true);
    try {
      await authService.signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName
      });
      toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
      navigate(createPageUrl('Login'));
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <Link to={createPageUrl('Login')} className="absolute top-6 left-6">
        <Button variant="ghost" className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Login
        </Button>
      </Link>

      <div className="w-full max-w-md space-y-8 px-2 sm:px-0">
        <div className="text-center">
          <div className="bg-black rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4 border border-slate-800 overflow-hidden w-56 h-28 sm:w-64 sm:h-32 relative">
             <img 
               src={logoUrl} 
               alt="Milano Pizzaria" 
               className="absolute inset-0 w-full h-full object-contain"
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'flex';
               }}
             />
             <div className="hidden w-full h-full items-center justify-center bg-slate-900">
               <UserPlus className="w-10 h-10 text-white" />
             </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Milano Pizzaria</h2>
          <p className="mt-2 text-sm text-slate-400">
            Crie sua conta para começar a gerenciar sua pizzaria.
          </p>
        </div>

        <Card className="p-5 sm:p-8 bg-slate-800 border-slate-700 shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome Completo *</Label>
              <Input
                required
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-12 rounded-xl focus:ring-red-500"
                placeholder="Seu nome"
                value={form.fullName}
                onChange={f('fullName')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email *</Label>
              <Input
                required
                type="email"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-12 rounded-xl focus:ring-red-500"
                placeholder="exemplo@email.com"
                value={form.email}
                onChange={f('email')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Senha *</Label>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-12 pr-12 rounded-xl focus:ring-red-500"
                  placeholder="••••••"
                  value={form.password}
                  onChange={f('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-12 pr-12 rounded-xl focus:ring-red-500"
                  placeholder="••••••"
                  value={form.confirmPassword}
                  onChange={f('confirmPassword')}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-red-600/20 mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Criar Minha Conta
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-slate-500 text-sm">
          J\u00E1 tem uma conta?{' '}
          <Link to={createPageUrl('Login')} className="text-red-500 font-bold hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
