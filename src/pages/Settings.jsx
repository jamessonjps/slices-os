import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { safeJsonParse } from '@/utils/storage';
import { ArrowLeft, Save, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function WhatsAppSection({ settings, onSave }) {
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    const s = settings.find(s => s.key === 'whatsapp_number');
    if (s) setWhatsapp(s.value);
  }, [settings]);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">WhatsApp da Pizzaria</h2>
          <p className="text-sm text-slate-500">Número para receber pedidos via WhatsApp</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Número (com código do país, sem espaços ou símbolos)</Label>
        <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex: 5511999999999" />
        <p className="text-xs text-slate-400">Formato: 55 + DDD + número. Ex: <strong>5511987654321</strong></p>
      </div>
      <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => onSave('whatsapp_number', whatsapp)} disabled={!whatsapp}>
        <Save className="w-4 h-4 mr-2" />Salvar
      </Button>
    </Card>
  );
}

function HoursSection({ settings, onSave }) {
  const defaultHours = DAYS.reduce((acc, d) => ({ ...acc, [d]: { open: '18:00', close: '23:00', closed: false } }), {});
  const [hours, setHours] = useState(defaultHours);

  useEffect(() => {
    const s = settings.find(s => s.key === 'business_hours');
    if (s) {
      const parsed = safeJsonParse(s.value, null);
      if (parsed && typeof parsed === 'object') {
        setHours(parsed);
      }
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
          <h2 className="font-semibold text-slate-900">Horário de Funcionamento</h2>
          <p className="text-sm text-slate-500">Configure os horários de cada dia</p>
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
                className="rounded"
              />
              <span className="text-xs text-slate-500">Fechado</span>
            </label>
            {!hours[day]?.closed && (
              <>
                <Input type="time" value={hours[day]?.open || '18:00'} onChange={e => update(day, 'open', e.target.value)} className="h-8 w-28 text-sm" />
                <span className="text-slate-400 text-sm">às</span>
                <Input type="time" value={hours[day]?.close || '23:00'} onChange={e => update(day, 'close', e.target.value)} className="h-8 w-28 text-sm" />
              </>
            )}
            {hours[day]?.closed && <span className="text-sm text-slate-400 italic">Fechado</span>}
          </div>
        ))}
      </div>
      <Button className="mt-4" onClick={() => onSave('business_hours', JSON.stringify(hours))}>
        <Save className="w-4 h-4 mr-2" />Salvar Horários
      </Button>
    </Card>
  );
}


export default function Settings() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {
      setCurrentUser(null);
    });
  }, []);

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.Settings.list()
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const existing = settings.find(s => s.key === key);
      if (existing) {
        return base44.entities.Settings.update(existing.id, { value });
      } else {
        return base44.entities.Settings.create({ key, value });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Salvo com sucesso!');
    }
  });

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('AdminHome')}>
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <WhatsAppSection settings={settings} onSave={(key, value) => saveMutation.mutate({ key, value })} />
        <HoursSection settings={settings} onSave={(key, value) => saveMutation.mutate({ key, value })} />
        {isAdmin && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-900 text-sm">Gestão de Usuários</p>
              <p className="text-xs text-purple-600">Cadastre, edite e gerencie funcionários e admins</p>
            </div>
            <Link to={createPageUrl('UserManagement')}>
              <Button className="bg-purple-700 hover:bg-purple-800 text-white shrink-0">Gerenciar</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}