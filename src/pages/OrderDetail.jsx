import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Clock, CheckCircle, Truck, Package, ChefHat, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: ChefHat },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  delivering: { label: 'Saiu p/ entrega', color: 'bg-purple-100 text-purple-800', icon: Truck },
  completed: { label: 'Concluído', color: 'bg-slate-100 text-slate-600', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: Package }
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['orders']);
      toast.success('Status atualizado');
    }
  });

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ id: orderId, data: { status: newStatus } });
  };

  const handlePaymentChange = (paymentStatus) => {
    updateMutation.mutate({ id: orderId, data: { payment_status: paymentStatus } });
  };

  const handleWhatsApp = () => {
    const phone = order.customer_phone.replace(/\D/g, '');
    const message = `Olá ${order.customer_name}! Seu pedido #${order.id.slice(0, 8)} está ${config.label.toLowerCase()}. 🍕`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openGoogleMaps = () => {
    if (order.delivery_type === 'delivery' && order.address_text) {
      const encodedAddress = encodeURIComponent(order.address_text);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen">Pedido não encontrado</div>;
  }

  const config = statusConfig[order.status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-slate-900">Pedido #{order.id.slice(0, 8)}</h1>
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
        {/* Status */}
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-semibold text-slate-900">{config.label}</p>
            </div>
          </div>
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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

        {/* Customer */}
        <Card className="p-4 bg-white border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Cliente</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-500">Nome:</span> {order.customer_name}</p>
            <p><span className="text-slate-500">Telefone:</span> {order.customer_phone}</p>
            <p><span className="text-slate-500">Tipo:</span> {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}</p>
            {order.address_text && (
              <div>
                <p><span className="text-slate-500">Endereço:</span> {order.address_text}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openGoogleMaps}
                  className="mt-2 w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Abrir rota no Google Maps
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Pizzas */}
        <Card className="p-4 bg-white border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Pizzas</h3>
          <div className="space-y-3">
            {order.pizzas?.map((pizza, i) => (
              <div key={i} className="border-l-4 border-slate-300 pl-3 py-2">
                <p className="font-medium text-slate-900">
                  {pizza.size} fatias - {pizza.is_half ? `${pizza.flavor1} / ${pizza.flavor2}` : pizza.flavor1}
                </p>
                <p className="text-sm text-slate-500">R$ {pizza.price?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Drinks */}
        {order.drinks?.length > 0 && (
          <Card className="p-4 bg-white border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Bebidas</h3>
            <div className="space-y-2">
              {order.drinks.map((drink, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-700">{drink.quantity}x {drink.name}</span>
                  <span className="text-slate-900">R$ {(drink.price * drink.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card className="p-4 bg-white border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Observações</h3>
            <p className="text-sm text-slate-600">{order.notes}</p>
          </Card>
        )}

        {/* Payment */}
        <Card className="p-4 bg-white border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Pagamento</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status:</span>
              <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
              </Badge>
            </div>
            <Select value={order.payment_status} onValueChange={handlePaymentChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Total */}
        <Card className="p-4 bg-slate-900 text-white">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">R$ {order.total_amount?.toFixed(2)}</span>
          </div>
        </Card>

        {/* Timestamp */}
        <p className="text-center text-sm text-slate-400">
          Criado em {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}