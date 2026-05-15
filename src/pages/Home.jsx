import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Pizza, ClipboardList, Phone, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { settingsService } from '@/services/settingsService';

import { isOpen, getHoursDisplay } from '@/utils/businessHours';

const DEFAULT_HOURS = {
  Segunda:  { closed: true },
  Terça:    { closed: true },
  Quarta:   { closed: true },
  Quinta:   { open: '18:00', close: '22:30', closed: false },
  Sexta:    { open: '18:00', close: '22:30', closed: false },
  Sábado:   { open: '18:00', close: '22:30', closed: false },
  Domingo:  { open: '18:00', close: '22:30', closed: false },
};

export default function Home() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings()
  });

  const hours = settings?.business_hours || DEFAULT_HOURS;
  const whatsapp = settings?.whatsapp_number || '';
  const storeName = settings?.store_name || 'Milano Pizzaria';

  const open = isOpen(hours);
  const hoursGroups = getHoursDisplay(hours);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl mb-4 inline-block">
             <Pizza className="w-16 h-16 text-red-600 mx-auto" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            {storeName}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest mb-8 ${
            open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${open ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {open ? 'Aberto agora' : 'Fechado no momento'}
        </motion.div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8 text-left space-y-5">
          <div className="flex gap-4">
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {hoursGroups.map((g, i) => (
                <div key={i}>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{g.label}:</span>{' '}
                  {g.config?.closed 
                    ? 'Fechado' 
                    : `${g.config?.open || '--:--'} Á s ${g.config?.close || '--:--'}`
                  }
                </div>
              ))}
            </div>
          </div>

          {whatsapp && (
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
                className="text-xs text-green-600 font-bold hover:underline">
                WhatsApp: {whatsapp}
              </a>
            </div>
          )}

          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-slate-200">Rua das Pizzas, 123 â€” Centro</span><br />
              Entregamos em toda a região
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link to={createPageUrl('Menu')} className="block">
            <Button className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-black shadow-lg shadow-red-200 rounded-2xl transition-all hover:-translate-y-1">
              <Pizza className="w-6 h-6 mr-3" />
              VER CARDÁPIO & PEDIR
            </Button>
          </Link>

          <Link to={createPageUrl('MyOrders')} className="block">
            <Button variant="outline" className="w-full h-14 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl">
              <ClipboardList className="w-5 h-5 mr-3 text-slate-400" />
              ACOMPANHAR PEDIDOS
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <Link to={createPageUrl('AdminHome')} className="text-[10px] text-slate-400 uppercase font-black tracking-widest hover:text-slate-900 transition-colors">
            Painel Administrativo
          </Link>
          <Link to={createPageUrl('DeleteAccount')} className="text-[10px] text-slate-300 hover:text-red-500 transition-colors uppercase font-bold tracking-widest">
            Excluir minha conta
          </Link>
        </div>

        <div className="mt-8 opacity-50">
           <SliceOSFooter />
        </div>
      </div>
    </div>
  );
}
