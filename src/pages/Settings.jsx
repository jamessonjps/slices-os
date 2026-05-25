import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { safeJsonParse } from '@/utils/storage';
import { formatPhoneMask, unmaskPhone } from '@/utils/phone';
import { ArrowLeft, Save, MessageCircle, Clock, Store, DollarSign, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { settingsService } from '@/services/settingsService';
import { useAuth } from '@/lib/AuthContext';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function GeneralSection({ settings, onSave, loading }) {
  const [formData, setFormData] = useState({ store_name: '', delivery_fee: 0, pix_key: '' });

  useEffect(() => {
    if (settings) {
      setFormData({ 
        store_name: settings.store_name || '', 
        delivery_fee: settings.delivery_fee || 0,
        pix_key: settings.pix_key || '',
        address: settings.address || ''
      });
    }
  }, [settings]);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Store className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Geral</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configurações básicas da loja</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nome da Pizzaria *</Label>
          <Input 
            value={formData.store_name} 
            onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))} 
          />
        </div>
        <div className="space-y-2">
          <Label>Taxa de Entrega (R$)</Label>
          <Input 
            type="number"
            value={formData.delivery_fee} 
            onChange={(e) => setFormData(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) || 0 }))} 
          />
        </div>
        <div className="space-y-2">
          <Label>Chave PIX da Loja (opcional)</Label>
          <Input 
            value={formData.pix_key} 
            onChange={(e) => setFormData(prev => ({ ...prev, pix_key: e.target.value }))} 
            placeholder="CNPJ, E-mail, Celular ou Chave Aleatória"
          />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Esta chave será mostrada aos clientes no Checkout se selecionarem PIX.</p>
        </div>
        <div className="space-y-2">
          <Label>Endereço da Empresa</Label>
          <Input 
            value={formData.address} 
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} 
            placeholder="Ex: Rua das Flores, 123 - Centro"
          />
        </div>
      </div>
      <Button className="mt-4" onClick={() => onSave(formData)} disabled={loading}>
        {loading ? "Salvando..." : <><Save className="w-4 h-4 mr-2" />Salvar Alterações</>}
      </Button>
    </Card>
  );
}

function WhatsAppSection({ settings, onSave, loading }) {
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (settings?.whatsapp_number) setWhatsapp(settings.whatsapp_number);
  }, [settings]);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">WhatsApp da Pizzaria</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Número para receber pedidos via WhatsApp</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Número (com código do país, sem espaços ou símbolos)</Label>
        <Input 
          value={formatPhoneMask(whatsapp)} 
          onChange={(e) => setWhatsapp(unmaskPhone(e.target.value))} 
          placeholder="+55 (11) 99999-9999" 
        />
        <p className="text-xs text-slate-400">Formato: 55 + DDD + número. O sistema formata automaticamente.</p>
      </div>
      <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => onSave({ whatsapp_number: whatsapp })} disabled={!whatsapp || loading}>
        {loading ? "Salvando..." : <><Save className="w-4 h-4 mr-2" />Salvar WhatsApp</>}
      </Button>
    </Card>
  );
}

function HoursSection({ settings, onSave, loading }) {
  const defaultHours = DAYS.reduce((acc, d) => ({ ...acc, [d]: { open: '18:00', close: '23:00', closed: false } }), {});
  const [hours, setHours] = useState(defaultHours);

  useEffect(() => {
    if (settings?.business_hours) {
      setHours(settings.business_hours);
    }
  }, [settings]);

  const update = (day, field, value) => {
    setHours(h => ({ ...h, [day]: { ...h[day], [field]: value } }));
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Horário de Funcionamento</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure os horários de cada dia</p>
        </div>
      </div>
      <div className="space-y-3">
        {DAYS.map(day => (
          <div key={day} className="flex items-center gap-3">
            <div className="w-16 text-sm font-medium text-slate-700 shrink-0">{day}</div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hours[day]?.closed || false}
                onChange={e => update(day, 'closed', e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">Fechado</span>
            </label>
            {!hours[day]?.closed && (
              <>
                <Input type="time" value={hours[day]?.open || '18:00'} onChange={e => update(day, 'open', e.target.value)} className="h-8 w-28 text-sm" />
                <span className="text-slate-400 text-sm">às</span>
                <Input type="time" value={hours[day]?.close || '23:00'} onChange={e => update(day, 'close', e.target.value)} className="h-8 w-28 text-sm" />
              </>
            )}
            {hours[day]?.closed && <span className="text-sm text-slate-400 italic">Folga</span>}
          </div>
        ))}
      </div>
      <Button className="mt-4" onClick={() => onSave({ business_hours: hours })} disabled={loading}>
        {loading ? "Salvando..." : <><Save className="w-4 h-4 mr-2" />Salvar Horários</>}
      </Button>
    </Card>
  );
}

function DangerZone({ onReset, loading }) {
  const [confirm, setConfirm] = useState('');

  return (
    <Card className="p-5 border-red-200 bg-red-50/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="font-semibold text-red-900">Zona de Perigo</h2>
          <p className="text-sm text-red-600">Ações irreversíveis no sistema</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-red-100 rounded-xl">
          <p className="text-sm font-bold text-red-900 mb-1">Reset Total do Sistema</p>
          <p className="text-xs text-red-600 mb-4">
            Isso apagará todos os pedidos, clientes e usuários (exceto você). 
            A numeração dos pedidos continuará de onde parou a menos que use o SQL Editor.
          </p>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-red-400">Digite RESET para confirmar</Label>
            <div className="flex gap-2">
              <Input 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                placeholder="RESET"
                className="border-red-200 focus:border-red-500"
              />
              <Button 
                variant="destructive"
                disabled={confirm !== 'RESET' || loading}
                onClick={() => {
                  if (window.confirm('TEM CERTEZA? Todos os dados serão apagados permanentemente.')) {
                    onReset();
                    setConfirm('');
                  }
                }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Resetar Tudo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings()
  });

  const saveMutation = useMutation({
    mutationFn: (updates) => settingsService.updateSettings(updates),
    onSuccess: () => {
      // Invalida e força o refetch imediato
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.refetchQueries({ queryKey: ['settings'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (err) => {
      console.error("Erro ao salvar:", err);
      toast.error('Erro ao salvar: ' + (err.message || 'Verifique sua conexão'));
    }
  });

  const resetMutation = useMutation({
    mutationFn: () => settingsService.resetSystem(),
    onSuccess: () => {
      toast.success('Sistema resetado com sucesso!');
      window.location.reload();
    },
    onError: (err) => {
      toast.error('Erro ao resetar: ' + err.message);
    }
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('AdminHome')}>
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Configurações</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-20">
        <GeneralSection settings={settings} onSave={(updates) => saveMutation.mutate(updates)} loading={saveMutation.isPending} />
        <WhatsAppSection settings={settings} onSave={(updates) => saveMutation.mutate(updates)} loading={saveMutation.isPending} />
        <HoursSection settings={settings} onSave={(updates) => saveMutation.mutate(updates)} loading={saveMutation.isPending} />
        
        {isAdmin && (
          <>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-purple-900 text-sm">Gestão de Usuários</p>
                <p className="text-xs text-purple-600">Cadastre, edite e gerencie funcionários e admins</p>
              </div>
              <Link to={createPageUrl('UserManagement')}>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white shrink-0">Gerenciar</Button>
              </Link>
            </div>

            <DangerZone 
              onReset={() => resetMutation.mutate()} 
              loading={resetMutation.isPending} 
            />
          </>
        )}
      </div>
    </div>
  );
}
