import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Clock, CheckCircle, Truck, Package, ChefHat, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { orderService } from '@/services/orderService';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: ChefHat },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  delivering: { label: 'Saiu p/ entrega', color: 'bg-purple-100 text-purple-800', icon: Truck },
  completed: { label: 'Concluído', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: Package }
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const orderId = urlParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => orderService.updateOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['orders']);
      toast.success('Pedido atualizado');
    }
  });

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ status: newStatus });
  };

  const handlePaymentChange = (paymentStatus) => {
    updateMutation.mutate({ payment_status: paymentStatus });
  };

  const config = statusConfig[order?.status] || statusConfig.pending;

  const handleWhatsApp = () => {
    const phone = order?.customer_phone ? order.customer_phone.replace(/\D/g, '') : '';
    if (!phone) {
      toast.error('Telefone do cliente indisponível');
      return;
    }

    const message = `Olá ${order.customer_name || 'cliente'}! Seu pedido #${order.id?.slice(0, 8) || ''} está ${config.label.toLowerCase()}. 🍕`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openGoogleMaps = () => {
    if (order.delivery_type === 'delivery' && order.address_text) {
      const encodedAddress = encodeURIComponent(order.address_text);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  if (!order) return <div className="flex items-center justify-center min-h-screen">Pedido não encontrado</div>;

  const Icon = config.icon;
  const items = order.items || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pedido #{order.id.slice(0, 8)}</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleWhatsApp}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Status Atual</p>
              <p className="font-semibold text-slate-900 dark:text-white">{config.label}</p>
            </div>
          </div>
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="preparing">Preparando</SelectItem>
              <SelectItem value="ready">Pronto</SelectItem>
              <SelectItem value="delivering">Saiu p/ entrega</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Cliente</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-500 dark:text-slate-400">Nome:</span> {order.customer_name}</p>
            <p><span className="text-slate-500 dark:text-slate-400">Telefone:</span> {order.customer_phone}</p>
            <p><span className="text-slate-500 dark:text-slate-400">Entrega:</span> {order.delivery_type === 'delivery' ? 'Entrega em domicílio' : 'Retirada no balcão'}</p>
            {order.address_text && (
              <div className="pt-2">
                <p className="text-slate-500 dark:text-slate-400 mb-1">Endereço:</p>
                <p className="font-medium">{order.address_text}</p>
                <Button variant="outline" size="sm" onClick={openGoogleMaps} className="mt-2 w-full text-blue-600 border-blue-600">
                  <Truck className="w-4 h-4 mr-2" /> Abrir no Google Maps
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Itens do Pedido</h3>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {item.quantity > 1 && <span className="text-blue-600 mr-1">{item.quantity}x</span>}
                    {item.name}
                  </p>
                  {item.size && <p className="text-[10px] text-slate-500 dark:text-slate-400">Tamanho: {item.size} fatias</p>}
                  {item.is_half && <p className="text-[10px] text-slate-500 dark:text-slate-400">Meio a meio: {item.flavor1} / {item.flavor2}</p>}
                  {item.notes && <p className="text-[10px] text-amber-600 mt-1 italic">Obs: {item.notes}</p>}
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {order.notes && (
          <Card className="p-4 bg-amber-50 border-amber-100">
            <h3 className="font-semibold text-amber-900 mb-1 text-sm uppercase tracking-wider">Observações Gerais</h3>
            <p className="text-sm text-amber-800">{order.notes}</p>
          </Card>
        )}

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Pagamento</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Situação:</span>
              <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
              </Badge>
            </div>
            <Select value={order.payment_status} onValueChange={handlePaymentChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium opacity-80">Valor Total</span>
            <span className="text-3xl font-bold tracking-tight text-white">R$ {order.total_amount?.toFixed(2)}</span>
          </div>
        </Card>

        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-4">
          Criado em {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}
