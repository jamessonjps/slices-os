import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { safeJsonParse } from '@/utils/storage';
import { Pizza, ClipboardList, Phone, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';
import { motion } from 'framer-motion';

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const DEFAULT_HOURS = {
  Segunda:  { closed: true },
  Terça:    { closed: true },
  Quarta:   { closed: true },
  Quinta:   { open: '18:00', close: '22:30', closed: false },
  Sexta:    { open: '18:00', close: '22:30', closed: false },
  Sábado:   { open: '18:00', close: '22:30', closed: false },
  Domingo:  { open: '18:00', close: '22:30', closed: false },
};

function isOpen(hours) {
  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  const todayConfig = hours[dayName];
  if (!todayConfig || todayConfig.closed) return false;

  const [openH, openM] = todayConfig.open.split(':').map(Number);
  const [closeH, closeM] = todayConfig.close.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

function getHoursDisplay(hours) {
  // Group consecutive days with same schedule
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const groups = [];
  let i = 0;
  while (i < days.length) {
    const day = days[i];
    const config = hours[day];
    let j = i + 1;
    while (j < days.length) {
      const next = hours[days[j]];
      const sameSchedule = config?.closed === next?.closed &&
        config?.open === next?.open &&
        config?.close === next?.close;
      if (!sameSchedule) break;
      j++;
    }
    if (j - i > 1) {
      groups.push({ label: `${day} a ${days[j - 1]}`, config });
    } else {
      groups.push({ label: day, config });
    }
    i = j;
  }
  return groups;
}

export default function Home() {
  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.listSettings()
  });

  const hours = useMemo(() => {
    const s = settings.find(s => s.key === 'business_hours');
    if (!s) return DEFAULT_HOURS;
    const parsed = safeJsonParse(s.value, DEFAULT_HOURS);
    return parsed && typeof parsed === 'object' ? parsed : DEFAULT_HOURS;
  }, [settings]);

  const whatsapp = settings.find(s => s.key === 'whatsapp_number')?.value || '';

  const open = isOpen(hours);
  const hoursGroups = getHoursDisplay(hours);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 pt-safe">
      <div className="text-center max-w-sm w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-6"
        >
          <img
            src="https://media.base44.com/images/public/698b33880f8f26bcac1c2f36/acd017143_Semttulo.jpg"
            alt="Milano Pizzaria"
            className="w-72 mx-auto rounded-xl mb-2"
          />
        </motion.div>

        {/* Status aberto/fechado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm mb-4 ${
          open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {open ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {open ? 'Aberto agora' : 'Fechado no momento'}
        </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 text-left space-y-3">
          {/* Horários */}
          <div className="flex gap-3">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-700 space-y-0.5">
              {hoursGroups.map((g, i) => (
                <div key={i}>
                  <span className="font-medium">{g.label}:</span>{' '}
                  {g.config?.closed
                    ? <span className="text-slate-400">Fechado</span>
                    : <span>{g.config?.open} às {g.config?.close}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Telefone */}
          {whatsapp && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
                className="text-sm text-green-600 font-medium hover:underline">
                WhatsApp: {whatsapp.replace(/^55/, '+55 ').replace(/(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')}
              </a>
            </div>
          )}

          {/* Endereço */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700">
              Rua das Pizzas, 123 — Centro<br />
              <span className="text-slate-400 text-xs">Entrega e retirada no local</span>
            </p>
          </div>
        </div>
        </motion.div>

        {/* Botões */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="space-y-3"
        >
          <Link to={createPageUrl('Menu')} className="block">
            <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-lg font-bold shadow-md">
              <Pizza className="w-5 h-5 mr-2" />
              Fazer Pedido Online
            </Button>
          </Link>

          <Link to={createPageUrl('MyOrders')} className="block">
            <Button variant="outline" className="w-full h-11 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
              <ClipboardList className="w-4 h-4 mr-2" />
              Meus Pedidos
            </Button>
          </Link>
        </motion.div>

        <div className="mt-10 pt-5 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <Link to={createPageUrl('AdminHome')} className="block text-xs text-slate-400 hover:text-slate-600">
            Acesso administrativo →
          </Link>
          <Link to={createPageUrl('DeleteAccount')} className="block text-xs text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-500">
            Excluir minha conta
          </Link>
        </div>

        <SliceOSFooter />
      </div>
    </div>
  );
}