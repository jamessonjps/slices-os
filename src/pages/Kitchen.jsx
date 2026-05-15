import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import { settingsService } from '@/services/settingsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChefHat, Clock, CheckCircle, Truck, ArrowRight, Home, Circle, Pencil, Send, Plus, Trash2, Bell, BellOff, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import AuthGate from '@/components/AuthGate';
import { cn } from '@/lib/utils';
import PrintableTicket from '@/components/PrintableTicket';

/**
 * @typedef {Object} KitchenOrderItem
 * @property {Array<{ size?: string; is_half?: boolean; flavor1?: string; flavor2?: string; name?: string; price: number; quantity?: number; ready?: boolean }>} [pizzas]
 * @property {Array<{ name?: string; quantity?: number; price: number; ready?: boolean }>} [drinks]
 * @property {string} [customer_name]
 * @property {string} [customer_phone]
 * @property {'delivery'|'pickup'} [delivery_type]
 * @property {string} [address_text]
 * @property {'cash'|'card'|'pix'} [payment_method]
 * @property {'pending'|'preparing'|'ready'|'delivering'|'completed'} [status]
 * @property {string} [notes]
 * @property {string} [created_date]
 * @property {string} [id]
 */

const statusFlow = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivering',
  delivering: 'completed',
  completed: 'completed'
};

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-500', nextLabel: 'Iniciar Preparo' },
  preparing: { label: 'Preparando', color: 'bg-blue-500', nextLabel: 'Marcar Pronto' },
  ready: { label: 'Pronto', color: 'bg-green-500', nextLabel: 'Saiu p/ Entrega' },
  delivering: { label: 'Em Entrega', color: 'bg-purple-500', nextLabel: 'Concluir' },
  completed: { label: 'Concluído', color: 'bg-slate-500', nextLabel: 'Concluído' }
};

/**
 * @param {{ order: KitchenOrderItem | null; open: boolean; onClose: () => void; onSave: (data: any) => void; waPhone: string; settings?: any }} props
 */
function EditOrderDialog({ order, open, onClose, onSave, waPhone, settings }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (order) {
      setItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);
    }
  }, [order]);

  if (!order) return null;

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: (field === 'price' || field === 'quantity') ? parseFloat(String(value)) || 0 : value };
    setItems(updated);
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const addItem = (type = 'drink') => setItems([...items, { type, name: '', quantity: 1, price: 0 }]);

  const calcTotal = () => {
    const sub = items.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
    return sub + (order.delivery_type === 'delivery' ? (order.delivery_fee || 0) : 0);
  };

  const handleSendWhatsApp = () => {
    const sub = items.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
    const deliveryFee = order.delivery_type === 'delivery' ? (order.delivery_fee || 0) : 0;
    const total = sub + deliveryFee;

    const allItems = items.map(p => {
      return `• ${p.name} (${p.quantity || 1}x) - R$ ${((p.price) * (p.quantity || 1)).toFixed(2)}`;
    }).join('\n');

    const msgLines = [
      `\u{1F355} *ATUALIZAÇÁO DO PEDIDO - Millano Pizzaria*`,
      `\u{1F522} *ID:* #${order.id.slice(0, 8)}`,
      ``,
      `\u{1F464} *Cliente:* ${order.customer_name}`,
      `\u{1F4DE} *Tel:* ${order.customer_phone}`,
      ``,
      `\u{1F6D2} *Itens atualizados:*`,
      allItems,
      ``,
      `\u{1F4B0} *Subtotal:* R$ ${sub.toFixed(2)}`,
      ...(deliveryFee > 0 ? [`\u{1F69A} *Taxa:* R$ ${deliveryFee.toFixed(2)}`] : []),
      `\u2B50 *TOTAL:* R$ ${total.toFixed(2)}`,
      ``,
      `\u{1F4B3} *Pagamento:* ${
        order.payment_method === 'cash' ? `Dinheiro${order.change_for ? ` (Troco para R$ ${order.change_for})` : ''}` : 
        order.payment_method === 'card' ? 'Cart\u00E3o' : `PIX${settings?.pix_key ? `\n\u{1F511} *Chave PIX:* ${settings.pix_key}` : ''}\n\u26A0\uFE0F *Aguardando comprovante para confirmar pedido!*`
      }`,
      ``,
      `\u{1F4CD} *Entrega:* ${order.delivery_type === 'delivery' ? order.address_text : 'Retirada no Local'}`,
      ...(order.notes ? [``, `\u{1F4DD} *Obs:* ${order.notes}`] : []),
      ``,
      `\u{1F4CD} *Para agilizar a entrega, por favor nos envie sua localiza\u00E7\u00E3o pelo WhatsApp!*`
    ];

    const msg = encodeURIComponent(msgLines.join('\n'));

    const phone = order.customer_phone?.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
    onSave({ items, total_amount: total });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Editar Pedido</DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cliente: <strong className="text-slate-700 dark:text-slate-200">{order.customer_name}</strong>
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-slate-900 dark:text-white">Itens no Pedido</Label>
              <Button variant="outline" size="sm" onClick={() => addItem('item')} className="h-7 text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Plus className="w-3 h-3 mr-1" /> Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
              {items.length > 0 && (
                <div className="flex gap-2 px-1 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex-1 min-w-[150px]">Item / Descrição</div>
                  <div className="w-16 text-center">Qtd</div>
                  <div className="w-20 text-center">R$ Unit</div>
                  <div className="w-8"></div>
                </div>
              )}
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-1 min-w-[150px]">
                    <Input
                      className="h-8 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      value={item.name}
                      onChange={(e) => updateItem(i, 'name', e.target.value)}
                      placeholder="Nome do item"
                    />
                  </div>
                  <div className="w-16">
                    <Input
                      type="number"
                      className="h-8 text-sm text-center bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-1"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      className="h-8 text-sm text-center bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-1"
                      value={item.price}
                      onChange={(e) => updateItem(i, 'price', e.target.value)}
                    />
                  </div>
                  <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded-md transition-colors" title="Remover item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 py-4">Nenhum item no pedido.</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 flex justify-between items-center border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total do Pedido</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">R$ {calcTotal().toFixed(2)}</span>
          </div>

          <div className="pt-2">
            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={handleSendWhatsApp}
            >
              <Send className="w-5 h-5 mr-2" />
              Salvar e Notificar Cliente
            </Button>
            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
              Ao clicar, o pedido será atualizado e o WhatsApp web abrirá com a nova mensagem.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KitchenContent() {
  const queryClient = useQueryClient();
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [editingOrder, setEditingOrder] = useState(/** @type {KitchenOrderItem | null} */ (null));
  const [printingOrder, setPrintingOrder] = useState(null);
  const [autoNotify, setAutoNotify] = useState(() => {
    const saved = localStorage.getItem('sliceos_kitchen_notify');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleAutoNotify = () => {
    setAutoNotify(prev => {
      const next = !prev;
      localStorage.setItem('sliceos_kitchen_notify', JSON.stringify(next));
      return next;
    });
  };

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings()
  });
  const waPhone = settingsQuery.data?.whatsapp_number || '5511999999999';

  const ordersQuery = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => orderService.listKitchenOrders(),
    // Fallback: poll a cada 30 segundos caso o Realtime falhe
    refetchInterval: 30000,
    staleTime: 10000
  });

  const orders = ordersQuery.data ?? [];
  const isLoading = ordersQuery.isLoading;

  // Realtime Integration
  useEffect(() => {
    const subscription = orderService.subscribe((payload, eventType) => {
      // Invalida o cache para recarregar os dados
      queryClient.invalidateQueries(['kitchen-orders']);
      
      // Se for um novo pedido e notificação estiver ativa, toca o som
      if (eventType === 'INSERT' && autoNotify) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiWLz/LDdykGIm6+8N6URAwSWK3n8KRYE');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, autoNotify]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => orderService.updateOrder(id, data),
    onMutate: async ({ id, data }) => {
      // Cancela refetches
      await queryClient.cancelQueries(['kitchen-orders']);
      // Salva estado anterior
      const previousOrders = queryClient.getQueryData(['kitchen-orders']);
      // Atualiza cache de forma otimista
      queryClient.setQueryData(['kitchen-orders'], (old) => {
        return old?.map(order => order.id === id ? { ...order, ...data } : order);
      });
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['kitchen-orders'], context.previousOrders);
      console.error("Erro na mutação da cozinha:", err);
      toast.error(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['kitchen-orders']);
    }
  });

  /**
   * @param {KitchenOrderItem} order
   * @param {any} updatedData
   */
  /**
   * @param {KitchenOrderItem} order
   * @param {any} updatedData
   */
  const handleSaveEdit = (order, updatedData) => {
    updateMutation.mutate({ id: order.id, data: updatedData }, {
      onSuccess: () => {
        setEditingOrder(null);
        toast.success('Pedido atualizado e WhatsApp enviado!');
      }
    });
  };

  /**
   * @param {KitchenOrderItem} order
   * @param {'preparing'|'ready'|'delivering'|'completed'} newStatus
   */
  const sendStatusWhatsApp = (order, newStatus) => {
    const phone = order.customer_phone?.replace(/\D/g, '');
    if (!phone) return;
    const statusMessages = {
      preparing: `\u{1F355} Ol\u00E1 ${order.customer_name}! Seu pedido foi *confirmado* e est\u00E1 sendo preparado agora! \u23F1\uFE0F`,
      ready: `\u2705 Ol\u00E1 ${order.customer_name}! Sua pizza est\u00E1 *pronta*!${order.delivery_type === 'pickup' ? ' Pode vir buscar! \u{1F60A}' : ' J\u00E1 vamos embalar para entrega.'}`,
      delivering: `\u{1F6F5} Ol\u00E1 ${order.customer_name}! Seu pedido *saiu para entrega*! Em breve estar\u00E1 na sua porta. \u{1F355}\n\n\u{1F4CD} Por favor, nos envie sua localiza\u00E7\u00E3o para agilizar a entrega!`,
      completed: `\u2705 Ol\u00E1 ${order.customer_name}! Seu pedido foi *entregue*! Obrigado pela prefer\u00EAncia! \u{1F355}\u2764\uFE0F\n\n*Millano Pizzaria*`
    };
    const msg = statusMessages[newStatus];
    if (msg) {
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  /** @param {KitchenOrderItem} order */
  /** @param {KitchenOrderItem} order */
  const handlePrint = (order) => {
    setPrintingOrder(order);
    // Pequeno delay para garantir que o DOM renderizou o componente invis\u00EDvel
    setTimeout(() => {
      window.print();
    }, 100);
  };

  /** @param {KitchenOrderItem} order */
  const handleAdvanceStatus = (order) => {
    let nextStatus = /** @type {'preparing'|'ready'|'delivering'|'completed'} */ (statusFlow[order.status ?? 'pending']);
    
    // Se for retirada e o status atual for 'ready', pula direto para 'completed'
    if (order.delivery_type === 'pickup' && order.status === 'ready') {
      nextStatus = 'completed';
    }

    if (nextStatus) {
      updateMutation.mutate({ id: order.id, data: { status: nextStatus } }, {
        onSuccess: () => {
          // Imprimir automaticamente ao aceitar o pedido
          if (nextStatus === 'preparing') {
            handlePrint(order);
          }

          if (autoNotify) {
            sendStatusWhatsApp(order, nextStatus);
          } else {
            const label = nextStatus === 'completed' && order.delivery_type === 'pickup' 
              ? 'Pedido Entregue (Retirada)' 
              : `Pedido movido para: ${statusConfig[nextStatus].label}`;
            toast.success(label);
          }
        }
      });
    }
  };

  const toggleItemReady = (order, itemIndex) => {
    const updatedItems = [...(order.items || [])];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      ready: !updatedItems[itemIndex].ready
    };
    updateMutation.mutate({ id: order.id, data: { items: updatedItems } });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    // Priority: pending > preparing > ready > delivering > completed
    const statusPriority = { pending: 0, preparing: 1, ready: 2, delivering: 3, completed: 4 };
    const statusDiff = statusPriority[a.status ?? 'pending'] - statusPriority[b.status ?? 'pending'];
    if (statusDiff !== 0) return statusDiff;
    
    // Within same status, sort by time (oldest first)
    return (
      new Date(a.created_date || 0).getTime() - new Date(b.created_date || 0).getTime()
    );
  });

  const groupedOrders = {
    pending: sortedOrders.filter(o => o.status === 'pending'),
    preparing: sortedOrders.filter(o => o.status === 'preparing'),
    ready: sortedOrders.filter(o => o.status === 'ready'),
    delivering: sortedOrders.filter(o => o.status === 'delivering')
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <EditOrderDialog
        order={editingOrder}
        open={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={(data) => editingOrder && handleSaveEdit(editingOrder, data)}
        waPhone={waPhone}
        settings={settingsQuery.data}
      />
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Cozinha</h1>
                <p className="text-sm text-slate-400">{orders.length} pedidos ativos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant={autoNotify ? "default" : "outline"}
                size="sm"
                onClick={toggleAutoNotify}
                className={autoNotify ? "bg-green-600 hover:bg-green-700" : "text-slate-400 border-slate-700"}
              >
                {autoNotify ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
                {autoNotify ? "Notificação: ON" : "Notificação: OFF"}
              </Button>

              <Link to={createPageUrl('AdminHome')}>
                <Button variant="ghost" className="text-white bg-slate-700 hover:bg-slate-600 border border-slate-500">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
          </div>
        </div>
      </div>
    </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Carregando...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-slate-400">Nenhum pedido ativo</p>
            <p className="text-sm text-slate-500 mt-2">Todos os pedidos foram concluídos! {'🎉'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Column */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <h2 className="font-semibold text-white">Pendentes ({groupedOrders.pending.length})</h2>
              </div>
              <div className="space-y-3">
                {groupedOrders.pending.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onToggleItem={toggleItemReady}
                    onEdit={setEditingOrder}
                    onPrint={handlePrint}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>

            {/* Preparing Column */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h2 className="font-semibold text-white">Preparando ({groupedOrders.preparing.length})</h2>
              </div>
              <div className="space-y-3">
                {groupedOrders.preparing.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onToggleItem={toggleItemReady}
                    onEdit={setEditingOrder}
                    onPrint={handlePrint}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>

            {/* Ready Column */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h2 className="font-semibold text-white">Prontos ({groupedOrders.ready.length})</h2>
              </div>
              <div className="space-y-3">
                {groupedOrders.ready.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onToggleItem={toggleItemReady}
                    onEdit={setEditingOrder}
                    onPrint={handlePrint}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>

            {/* Delivering Column */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <h2 className="font-semibold text-white">Em Entrega ({groupedOrders.delivering.length})</h2>
              </div>
              <div className="space-y-3">
                {groupedOrders.delivering.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onToggleItem={toggleItemReady}
                    onEdit={setEditingOrder}
                    onPrint={handlePrint}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Componente Invisível para Impressão */}
      {printingOrder && (
        <PrintableTicket order={printingOrder} settings={settingsQuery.data} />
      )}
    </div>
  );
}

export default function Kitchen() {
  return (
    <AuthGate mode="private">
      <KitchenContent />
    </AuthGate>
  );
}

function OrderCard({ order, onAdvance, onToggleItem, onEdit, onPrint, updating }) {
  const config = statusConfig[order.status ?? 'pending'];
  const timeAgo = format(new Date(order.created_date || 0), 'HH:mm', { locale: ptBR });
  const minutesAgo = differenceInMinutes(new Date(), new Date(order.created_date || 0));
  
  const allItemsReady = (order.items || []).every((item) => item.ready);

  const openGoogleMaps = () => {
    if (order.delivery_type === 'delivery' && order.address_text) {
      const encodedAddress = encodeURIComponent(order.address_text);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Card className={cn(
      "p-4 bg-slate-800 border-slate-700",
      minutesAgo > 15 && order.status === 'preparing' && "border-red-500 border-2"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">{order.customer_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">{timeAgo}</span>
            {minutesAgo > 0 && (
              <Badge className={cn(
                "text-xs",
                minutesAgo > 15 ? "bg-red-600" : minutesAgo > 10 ? "bg-amber-600" : "bg-slate-600"
              )}>
                {minutesAgo}min
              </Badge>
            )}
          </div>
          {order.delivery_type === 'delivery' && order.address_text && (
            <button
              onClick={openGoogleMaps}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
            >
              <Truck className="w-3 h-3" />
              Ver rota no Maps
            </button>
          )}
        </div>
        {order.delivery_type === 'delivery' && (
          <Truck className="w-4 h-4 text-slate-500" />
        )}
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {(order.items || []).map((item, i) => (
          <div
            key={i}
            onClick={() => order.status === 'preparing' && onToggleItem(order, i)}
            className={cn(
              "bg-slate-700 rounded-lg p-3 transition-all",
              order.status === 'preparing' && "cursor-pointer hover:bg-slate-600",
              item.ready && "bg-green-900 border-2 border-green-600"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn(
                "border-0",
                item.type === 'pizza' ? "bg-amber-600 text-white" : "bg-slate-600 text-white"
              )}>
                {item.type === 'pizza' ? 'Pizza' : 'Item'}
              </Badge>
              {item.ready ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : order.status === 'preparing' ? (
                <Circle className="w-4 h-4 text-slate-400" />
              ) : null}
            </div>
            <div>
              <p className="text-sm text-white font-medium">
                {item.quantity > 1 && <span className="text-amber-400 mr-1">{item.quantity}x</span>}
                {item.name}
              </p>
              {item.type === 'pizza' && item.size && (
                <p className="text-[11px] font-bold mt-1 text-amber-300">
                  {item.size === 6 ? 'TAMANHO P (6 FATIAS)' : 'TAMANHO M (8 FATIAS)'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Advance Button */}
      <Button
        onClick={() => onAdvance(order)}
        disabled={updating || (order.status === 'preparing' && !allItemsReady)}
        className={cn(
          `w-full ${config.color} hover:opacity-90 text-white font-semibold`,
          order.status === 'preparing' && !allItemsReady && "opacity-50 cursor-not-allowed"
        )}
      >
        {order.status === 'ready' && order.delivery_type === 'pickup' 
          ? 'Concluir Retirada' 
          : config.nextLabel}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {order.status === 'preparing' && !allItemsReady && (
        <p className="text-xs text-amber-400 text-center mt-2">
          Marque todos os itens como prontos
        </p>
      )}

      {order.notes && (
        <p className="text-xs text-slate-400 mt-3 italic">"{order.notes}"</p>
      )}

        Editar e Notificar Cliente
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPrint(order)}
        className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs"
      >
        <Printer className="w-3 h-3 mr-1" />
        Imprimir Comanda
      </Button>
    </Card>
  );
}
