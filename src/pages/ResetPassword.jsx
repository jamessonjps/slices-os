import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("As senhas n\u00E3o coincidem!");
    }
    if (password.length < 6) {
      return toast.error("A senha deve ter pelo menos 6 caracteres.");
    }

    setLoading(true);
    try {
      await authService.updatePassword(password);
      toast.success("Senha atualizada com sucesso!");
      navigate(createPageUrl('Login'));
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20 mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Nova Senha</h1>
          <p className="text-slate-400 mt-2">Defina sua nova senha de acesso</p>
        </div>

        <Card className="p-8 bg-slate-800 border-slate-700 shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nova Senha</Label>
              <Input
                required
                type="password"
                className="bg-slate-900 border-slate-700 text-white h-12 rounded-xl focus:ring-red-500"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirmar Nova Senha</Label>
              <Input
                required
                type="password"
                className="bg-slate-900 border-slate-700 text-white h-12 rounded-xl focus:ring-red-500"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-red-600/20 mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Atualizar Senha"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
