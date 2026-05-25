import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShieldAlert, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { customerService } from '@/services/customerService';
import { formatPhoneMask, unmaskPhone } from '@/utils/phone';

export default function DeleteAccount() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Por favor, informe um telefone válido com DDD');
      return;
    }

    setLoading(true);
    try {
      const result = await customerService.deleteCustomerByPhone(cleanPhone);
      
      if (result && result.length > 0) {
        setSuccess(true);
        toast.success('Seus dados foram excluídos com sucesso.');
      } else {
        toast.error('Telefone não encontrado em nossa base de dados.');
      }
    } catch (err) {
      console.error("Erro ao excluir dados:", err);
      toast.error('Erro ao processar solicitação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao início
          </Button>
        </Link>

        <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl text-left">
          {!success ? (
            <>
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl mb-6">
                <ShieldAlert className="w-12 h-12 text-red-600 mb-4" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Privacidade e Dados</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Deseja remover seu nome e telefone de nossa lista de clientes? Esta ação apagará seus dados de cadastro imediatamente.
                </p>
              </div>

              <form onSubmit={handleDelete} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Seu Telefone (com DDD)
                  </label>
                  <Input 
                    type="tel" 
                    placeholder="+55 (11) 99999-9999"
                    value={formatPhoneMask(phone)}
                    onChange={(e) => setPhone(unmaskPhone(e.target.value))}
                    className="h-14 rounded-2xl text-lg border-slate-200 dark:border-slate-800"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-slate-900 hover:bg-red-600 text-white font-bold rounded-2xl transition-all"
                >
                  {loading ? 'Processando...' : 'EXCLUIR MEUS DADOS'}
                  {!loading && <Trash2 className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <p className="text-[10px] text-slate-400 text-center mt-8 uppercase tracking-widest font-bold">
                Ação em conformidade com a LGPD
              </p>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dados Excluídos</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2 mb-8 leading-relaxed">
                Pronto! Seus dados de cadastro foram removidos de nossa base com sucesso.
              </p>
              <Link to={createPageUrl('Home')}>
                <Button className="bg-slate-900 text-white w-full h-14 rounded-2xl font-bold shadow-lg shadow-slate-200">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
