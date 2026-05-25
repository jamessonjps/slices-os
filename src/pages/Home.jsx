import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Pizza, ClipboardList, Phone, MapPin, Clock } from 'lucide-react';
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
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings(),
    staleTime: 1000 * 60 * 5,
  });

  const hours = settings?.business_hours || DEFAULT_HOURS;
  const whatsapp = settings?.whatsapp_number || '';
  const storeName = settings?.store_name || 'Milano Pizzaria';

  const open = useMemo(() => isOpen(hours), [hours]);
  const hoursGroups = useMemo(() => getHoursDisplay(hours), [hours]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-3xl mx-auto mb-4" />
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 overflow-x-hidden">
      <div className="text-center max-w-sm w-full py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-black p-0 rounded-3xl shadow-2xl mb-6 inline-block border border-slate-800 overflow-hidden w-64 h-32 relative">
             <img 
               src="/src/assets/logo.jpeg" 
               alt={storeName} 
               className="absolute inset-0 w-full h-full object-cover scale-150 transform"
               onError={(e) => {
                 e.target.parentElement.style.padding = '1.5rem';
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'block';
               }}
             />
             <div style={{ display: 'none' }}>
               <Pizza className="w-16 h-16 text-red-600 mx-auto" />
             </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            {storeName}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest mb-8 ${
            open ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${open ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {open ? 'Aberto agora' : 'Fechado no momento'}
        </motion.div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8 text-left space-y-5">
          <div className="flex gap-4">
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {hoursGroups?.map((g, i) => (
                <div key={i}>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{g.label}:</span>{' '}
                  {g.config?.closed 
                    ? 'Fechado' 
                    : `${g.config?.open || '--:--'} às ${g.config?.close || '--:--'}`
                  }
                </div>
              )) || <p>Horário não disponível</p>}
            </div>
          </div>

          {whatsapp && (
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                className="text-xs text-green-600 font-bold hover:underline">
                WhatsApp: {whatsapp}
              </a>
            </div>
          )}

          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-slate-200">
                {settings?.address || 'Endereço não informado'}
              </span><br />
              Entregamos em toda a região
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link to={createPageUrl('Wizard')} className="block">
            <Button className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-black shadow-lg shadow-red-200 dark:shadow-none rounded-2xl transition-all active:scale-95">
              <Pizza className="w-6 h-6 mr-3" />
              VER CARDÁPIO & PEDIR
            </Button>
          </Link>

          <Link to={createPageUrl('MyOrders')} className="block">
            <Button variant="outline" className="w-full h-14 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
              <ClipboardList className="w-5 h-5 mr-3 text-slate-400" />
              ACOMPANHAR PEDIDOS
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <Link to={createPageUrl('AdminHome')} className="text-[10px] text-slate-400 uppercase font-black tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
            Painel Administrativo
          </Link>
          <Link to={createPageUrl('DeleteAccount')} className="text-[10px] text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors uppercase font-bold tracking-widest">
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
