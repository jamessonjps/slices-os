import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, ChefHat, CheckCircle, Truck, Home, Package, MessageCircle, ArrowLeft } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusFlow = [
  { key: 'pending', label: 'Pedido Recebido', icon: Clock, color: 'text-amber-500' },
  { key: 'preparing', label: 'Em Preparo', icon: ChefHat, color: 'text-blue-500' },
  { key: 'ready', label: 'Pronto', icon: CheckCircle, color: 'text-green-500' },
  { key: 'delivering', label: 'Saiu para Entrega', icon: Truck, color: 'text-purple-500' },
  { key: 'completed', label: 'Entregue', icon: CheckCircle, color: 'text-green-600' }
];

export default function TrackOrder() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['track-order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId,
    refetchInterval: 5000
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ['all-active-orders'],
    queryFn: async () => {
      const orders = await base44.entities.Order.list('-created_date', 100);
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

  useEffect(() => {
    if (!orderId) {
      window.location.href = createPageUrl('Menu');
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Pedido não encontrado</p>
          <Link to={createPageUrl('Menu')}>
            <Button>Voltar ao Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = statusFlow.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Pedido #{order.id.slice(0, 8)}</h1>
                <p className="text-sm text-slate-500">{order.customer_name}</p>
              </div>
            </div>
            <Link to={createPageUrl('Menu')}>
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Novo Pedido
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Estimate */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-900 font-medium">Tempo Estimado</p>
              <p className="text-lg font-bold text-blue-900">{calculateEstimate()}</p>
            </div>
          </div>
        </Card>

        {/* Status Timeline */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Status do Pedido</h3>
          <div className="space-y-4">
            {statusFlow.map((status, index) => {
              const Icon = status.icon;
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={status.key} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? status.color : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                      {status.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-green-600 font-semibold">Em andamento</p>
                    )}
                  </div>
                  {isActive && index < currentIndex && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Detalhes do Pedido</h3>
          <div className="space-y-3">
            {order.pizzas?.map((pizza, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-700">
                  Pizza {pizza.flavor1} ({pizza.size} fatias)
                </span>
                <span className="text-slate-900 font-medium">R$ {pizza.price?.toFixed(2)}</span>
              </div>
            ))}
            {order.drinks?.map((drink, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-700">{drink.quantity}x {drink.name}</span>
                <span className="text-slate-900 font-medium">R$ {(drink.price * drink.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-slate-900">R$ {order.total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Delivery Info */}
        {order.delivery_type === 'delivery' && order.address_text && (
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Endereço de Entrega</h3>
            <p className="text-sm text-slate-600">{order.address_text}</p>
          </Card>
        )}

        {/* Order Time */}
        <p className="text-center text-sm text-slate-500">
          Pedido realizado em {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>

        {/* WhatsApp contact */}
        <a
          href={`https://wa.me/5511999999999?text=${encodeURIComponent('Olá! Quero informações sobre meu pedido #' + order.id.slice(0, 8))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com a Pizzaria no WhatsApp
          </Button>
        </a>

        {/* View History */}
        <Link to={createPageUrl('MyOrders')}>
          <Button variant="outline" className="w-full">
            Ver Meus Pedidos
          </Button>
        </Link>

        <SliceOSFooter />
      </div>
    </div>
  );
}