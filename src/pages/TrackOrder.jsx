import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, ChefHat, CheckCircle, Truck, Home, Package, MessageCircle, ArrowLeft } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { orderService } from '@/services/orderService';

const statusFlow = [
  { key: 'pending', label: 'Pedido Recebido', icon: Clock, color: 'text-amber-500' },
  { key: 'preparing', label: 'Em Preparo', icon: ChefHat, color: 'text-blue-500' },
  { key: 'ready', label: 'Pronto', icon: CheckCircle, color: 'text-green-500' },
  { key: 'delivering', label: 'Saiu para Entrega', icon: Truck, color: 'text-purple-500' },
  { key: 'completed', label: 'Entregue', icon: CheckCircle, color: 'text-green-600' }
];

export default function TrackOrder() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const orderId = urlParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['track-order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
    refetchInterval: 5000
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ['all-active-orders'],
    queryFn: async () => {
      const orders = await orderService.listOrders('-created_date', 100);
      return orders.filter(o => ['pending', 'preparing'].includes(o.status));
    },
    refetchInterval: 10000
  });

  const calculateEstimate = () => {
    if (!order) return null;
    
    const baseTime = 30; // minutes
    const queuedOrders = allOrders.filter(o => 
      new Date(o.created_date) < new Date(order.created_date) && 
      o.status !== 'completed'
    ).length;
    
    const additionalTime = queuedOrders * 10;
    const totalTime = baseTime + additionalTime;
    
    if (order.status === 'completed') return 'Pedido entregue!';
    if (order.status === 'delivering') return 'Em rota de entrega';
    if (order.status === 'ready') return 'Pronto para retirada/entrega';
    
    return `${totalTime} minutos estimados`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-medium">Localizando seu pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-sm w-full">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ops!</h2>
          <p className="text-slate-500 mb-6">Não conseguimos encontrar esse pedido em nosso sistema.</p>
          <Link to={createPageUrl('Home')} className="w-full">
            <Button className="w-full bg-slate-900">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = statusFlow.findIndex(s => s.key === order.status);
  const items = order.items || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Pedido #{order.id.slice(0, 8)}</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{order.customer_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-6 bg-slate-900 text-white shadow-xl border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock className="w-24 h-24 rotate-12" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Previsão de Entrega</p>
            <p className="text-2xl font-bold text-white mb-4">{calculateEstimate()}</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${((currentIndex + 1) / statusFlow.length) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            Acompanhe o Status
          </h3>
          <div className="space-y-8 relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100" />
            {statusFlow.map((status, index) => {
              const Icon = status.icon;
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={status.key} className="flex items-center gap-5 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    isActive ? 'bg-white border-green-50' : 'bg-white border-slate-50'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? status.color : 'text-slate-300'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                      {status.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-green-600 font-bold animate-pulse mt-0.5">Em andamento...</p>
                    )}
                  </div>
                  {isActive && index < currentIndex && (
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Resumo do Pedido</h3>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-slate-800">{item.quantity || 1}x {item.name}</p>
                  {item.size && <p className="text-[10px] text-slate-400">Tamanho: {item.size}</p>}
                </div>
                <p className="font-bold text-slate-900">R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
              </div>
            ))}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <span className="font-bold text-slate-900">Total Pago</span>
              <span className="text-xl font-black text-slate-900">R$ {order.total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {order.delivery_type === 'delivery' && order.address_text && (
          <Card className="p-4 bg-white border-0 shadow-sm flex items-start gap-4">
            <div className="bg-slate-50 p-2 rounded-lg">
              <Truck className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Endereço de Entrega</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">{order.address_text}</p>
            </div>
          </Card>
        )}

        <div className="space-y-3 pt-4">
          <a
            href={`https://wa.me/5511999999999?text=${encodeURIComponent('Olá! Quero informações sobre meu pedido #' + order.id.slice(0, 8))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-bold shadow-lg shadow-green-200">
              <MessageCircle className="w-4 h-4 mr-2" />
              Precisa de ajuda? Fale conosco
            </Button>
          </a>

          <Link to={createPageUrl('MyOrders')} className="block">
            <Button variant="outline" className="w-full h-12 font-medium border-slate-200 text-slate-600">
              Ver Histórico de Pedidos
            </Button>
          </Link>
        </div>

        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest py-8">
          Pedido realizado em {format(new Date(order.created_date), "dd/MM/yyyy 'Á s' HH:mm", { locale: ptBR })}
        </p>

        <SliceOSFooter />
      </div>
    </div>
  );
}
