import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { Bike, CheckCircle, Package, MessageCircle, MapPin, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

export default function DeliveryDashboard() {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState(null); // armazena o pedido que está sendo confirmado

  // Obter usuário logado
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  // Obter configurações da loja para o WhatsApp da loja
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings()
  });
  const storePhone = settings?.whatsapp_number || '';

  // Buscar pedidos ativos
  const { data: activeOrders = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => orderService.listDeliveryOrders(),
    refetchInterval: 30000,
  });

  // Subscrição Realtime
  useEffect(() => {
    const sub = orderService.subscribe(() => {
      queryClient.invalidateQueries(['delivery-orders']);
    });
    return () => sub.unsubscribe();
  }, [queryClient]);

  // Mutações
  const acceptMutation = useMutation({
    mutationFn: (orderId) => orderService.acceptDelivery(orderId, user?.id),
    onSuccess: () => {
      toast.success('Corrida aceita! Boa entrega.');
      queryClient.invalidateQueries(['delivery-orders']);
    },
    onError: (err) => toast.error('Erro ao aceitar corrida: ' + err.message)
  });

  const confirmMutation = useMutation({
    mutationFn: (orderId) => orderService.confirmDelivery(orderId),
    onSuccess: () => {
      toast.success('Entrega confirmada com sucesso!');
      setConfirmDialog(null);
      queryClient.invalidateQueries(['delivery-orders']);
    },
    onError: (err) => toast.error('Erro ao confirmar entrega: ' + err.message)
  });

  // Lógicas de UI
  const formatMoney = (val) => {
    if (val == null || isNaN(val)) return '0,00';
    return Number(val).toFixed(2).replace('.', ',');
  };

  const getWaLink = (phone, msg) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const prefix = cleanPhone.startsWith('55') ? '' : '55';
    return `https://wa.me/${prefix}${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Fixo */}
      <div className="bg-red-600 text-white sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Área do Entregador</h1>
                <p className="text-red-100 text-xs">
                  {user ? `Olá, ${user.name?.split(' ')[0]}` : 'Carregando...'}
                </p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <Link to="/AdminHome">
                <Button variant="ghost" size="icon" className="text-white hover:bg-red-700">
                  <Home className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex-1 max-w-lg mx-auto w-full p-4 pb-24">
        
        <div className="space-y-4">
          {isLoadingActive ? (
            <div className="text-center py-12">
              <RefreshCcw className="w-8 h-8 animate-spin text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Buscando corridas...</p>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-700">Nenhuma corrida no momento</h2>
              <p className="text-slate-500 text-sm mt-1">Fique online, os pedidos aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            activeOrders.map(order => {
              const isMine = order.driver_id === user?.id;
              const isOutForDelivery = order.status === 'out_for_delivery';

              // Se está saiu para entrega e não é meu, não mostro (ou mostro bloqueado)
              // Vamos ocultar para não poluir a tela do entregador se outro já pegou
              if (isOutForDelivery && !isMine) return null;

              return (
                <Card key={order.id} className={`p-0 overflow-hidden shadow-sm border-slate-200 ${isOutForDelivery ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Badge variant="secondary" className="mb-2 font-mono text-[10px]">#{order.id.split('-')[0]}</Badge>
                        <h3 className="font-bold text-slate-900">{order.customer_name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">A Receber</p>
                        <p className="font-black text-lg text-emerald-600">R$ {formatMoney(order.total_amount)}</p>
                        <p className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                          {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'card' ? 'Cartão' : 'Dinheiro'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg mb-4 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-slate-700 leading-snug">
                        {order.address_text || 'Endereço não informado'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <a 
                        href={getWaLink(order.customer_phone, `Olá ${order.customer_name}, sou o entregador da Millano Pizzaria. Estou a caminho com seu pedido!`)}
                        target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Cliente
                      </a>
                      <a 
                        href={getWaLink(storePhone, `Olá, sou o entregador e tenho uma dúvida sobre o pedido #${order.id.split('-')[0]}`)}
                        target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Loja
                      </a>
                    </div>

                    {!isOutForDelivery ? (
                      <Button 
                        className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white"
                        onClick={() => acceptMutation.mutate(order.id)}
                        disabled={acceptMutation.isPending}
                      >
                        {acceptMutation.isPending ? 'Aceitando...' : 'Aceitar Corrida'}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        onClick={() => setConfirmDialog(order)}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" /> Confirmar Entrega
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

      </div>

      {/* Modal Dupla Confirmação */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent className="max-w-xs mx-auto rounded-2xl p-6">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center text-xl">Confirmar Entrega?</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-slate-600">
              Tem certeza que entregou o pedido para <strong>{confirmDialog?.customer_name}</strong>?
            </p>
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
              Valor a cobrar: <strong className="text-slate-900">R$ {formatMoney(confirmDialog?.total_amount)}</strong>
            </p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => confirmMutation.mutate(confirmDialog.id)}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? 'Confirmando...' : 'Sim, entreguei'}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-12 text-slate-500"
              onClick={() => setConfirmDialog(null)}
              disabled={confirmMutation.isPending}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
