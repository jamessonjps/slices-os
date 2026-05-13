import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import { settingsService } from '@/services/settingsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChefHat, Clock, CheckCircle, Truck, ArrowRight, Home, Circle, Pencil, Send, Plus, Trash2 } from 'lucide-react';
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
 * @param {{ order: KitchenOrderItem | null; open: boolean; onClose: () => void; onSave: (data: any) => void; waPhone: string }} props
 */
function EditOrderDialog({ order, open, onClose, onSave, waPhone }) {
  const [pizzas, setPizzas] = useState(
    /** @type {Array<{ size?: string; is_half?: boolean; flavor1?: string; flavor2?: string; name?: string; price: number; quantity?: number; ready?: boolean }>} */
    ([])
  );
  const [drinks, setDrinks] = useState(
    /** @type {Array<{ name: string; quantity: number; price: number; ready?: boolean }>} */
    ([])
  );

  useEffect(() => {
    if (order) {
      setPizzas(order.pizzas ? JSON.parse(JSON.stringify(order.pizzas)) : []);
      setDrinks(order.drinks ? JSON.parse(JSON.stringify(order.drinks)) : []);
    }
  }, [order]);

  if (!order) return null;

  /**
   * @param {number} i
   * @param {string} field
   * @param {string | number} value
   */
  const updatePizza = (i, field, value) => {
    const updated = [...pizzas];
    updated[i] = { ...updated[i], [field]: field === 'price' ? parseFloat(String(value)) || 0 : value };
    setPizzas(updated);
  };

  /**
   * @param {number} i
   * @param {string} field
   * @param {string | number} value
   */
  const updateDrink = (i, field, value) => {
    const updated = [...drinks];
    updated[i] = {
      ...updated[i],
      [field]: field === 'price' || field === 'quantity' ? parseFloat(String(value)) || 0 : value
    };
    setDrinks(updated);
  };

  /** @param {number} i */
  const removePizza = (i) => setPizzas(pizzas.filter((_, idx) => idx !== i));
  /** @param {number} i */
  const removeDrink = (i) => setDrinks(drinks.filter((_, idx) => idx !== i));

  const addDrink = () => setDrinks([...drinks, { name: '', quantity: 1, price: 0 }]);

  const calcTotal = () => {
    const sub = [...pizzas, ...drinks].reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
    return sub + (order.delivery_type === 'delivery' ? 2 : 0);
  };

  const handleSendWhatsApp = () => {
    const sub = [...pizzas, ...drinks].reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
    const deliveryFee = order.delivery_type === 'delivery' ? 2 : 0;
    const total = sub + deliveryFee;

    const pizzaLines = pizzas.map(p => {
      const label = p.is_half ? `½ ${p.flavor1} / ½ ${p.flavor2}` : p.flavor1 || p.name || '';
      return `• ${label} (${p.quantity || 1}x) - R$ ${((p.price) * (p.quantity || 1)).toFixed(2)}`;
    });
    const drinkLines = drinks.map(d => `• ${d.name} (${d.quantity}x) - R$ ${(d.price * d.quantity).toFixed(2)}`);
    const allItems = [...pizzaLines, ...drinkLines].join('\n');
    const paymentLabel = order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method === 'card' ? 'Cartão' : 'PIX';

    const msg = encodeURIComponent(
      `🍕 *Atualização do seu Pedido - Millano Pizzaria*\n\n*Cliente:* ${order.customer_name}\n*Tel:* ${order.customer_phone}\n\n*Itens:*\n${allItems}\n\n*Subtotal:* R$ ${sub.toFixed(2)}\n${deliveryFee > 0 ? `*Taxa de entrega:* R$ ${deliveryFee.toFixed(2)}\n` : ''}*Total:* R$ ${total.toFixed(2)}\n\n*Pagamento:* ${paymentLabel}\n*Entrega:* ${order.delivery_type === 'delivery' ? order.address_text : 'Retirada'}\n\n📍 *Para agilizar a entrega, por favor nos envie sua localização pelo WhatsApp!*`
    );

    const phone = order.customer_phone?.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
    onSave({ pizzas, drinks, total_amount: total });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pedido — {order.customer_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Pizzas */}
          <div>
            <Label className="text-sm font-semibold">Pizzas</Label>
            <div className="space-y-2 mt-2">
              {pizzas.map((p, i) => (
                <div key={i} className="flex gap-2 items-center bg-slate-50 rounded-lg p-2">
                  <div className="flex-1 text-sm text-slate-700 truncate">
                    {p.is_half ? `½ ${p.flavor1} / ½ ${p.flavor2}` : p.flavor1 || p.name}
                  </div>
                  <Input
                    type="number"
                    className="w-20 h-8 text-sm"
                    value={p.price}
                    onChange={(e) => updatePizza(i, 'price', e.target.value)}
                    placeholder="R$"
                  />
                  <button onClick={() => removePizza(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Drinks */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Bebidas</Label>
              <Button variant="ghost" size="sm" onClick={addDrink} className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {drinks.map((d, i) => (
                <div key={i} className="flex gap-2 items-center bg-slate-50 rounded-lg p-2">
                  <Input
                    className="flex-1 h-8 text-sm"
                    value={d.name}
                    onChange={(e) => updateDrink(i, 'name', e.target.value)}
                    placeholder="Nome"
                  />
                  <Input
                    type="number"
                    className="w-14 h-8 text-sm"
                    value={d.quantity}
                    onChange={(e) => updateDrink(i, 'quantity', e.target.value)}
                    placeholder="Qtd"
                  />
                  <Input
                    type="number"
                    className="w-20 h-8 text-sm"
                    value={d.price}
                    onChange={(e) => updateDrink(i, 'price', e.target.value)}
                    placeholder="R$"
                  />
                  <button onClick={() => removeDrink(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-3 text-sm font-semibold text-slate-800 flex justify-between">
            <span>Total</span>
            <span>R$ {calcTotal().toFixed(2)}</span>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSendWhatsApp}
          >
            <Send className="w-4 h-4 mr-2" />
            Salvar e Enviar WhatsApp ao Cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KitchenContent() {
  const queryClient = useQueryClient();
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [editingOrder, setEditingOrder] = useState(/** @type {KitchenOrderItem | null} */ (null));

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.listSettings()
  });
  const settings = /** @type {{ key: string; value: string }[]} */ (
    settingsQuery.data ?? []
  );
  const waPhone = settings.find(
    /** @param {{ key: string; value: string }} s */
    (s) => s.key === 'whatsapp_number'
  )?.value || '5511999999999';

  const ordersQuery = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const all = await orderService.listKitchenOrders();
      return all;
    },
    refetchInterval: 10000
  });
  const orders = /** @type {KitchenOrderItem[]} */ (ordersQuery.data ?? []);
  const isLoading = ordersQuery.isLoading;

  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiWLz/LDdykGIm6+8N6URAwSWK3n8KRYE');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    setLastOrderCount(orders.length);
  }, [orders.length]);

  const updateMutation = useMutation({
    mutationFn: /** @param {{ id: string; data: any }} params */
      ({ id, data }) => orderService.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['kitchen-orders']);
      toast.success('Atualizado');
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
      preparing: `🍕 Olá ${order.customer_name}! Seu pedido foi *confirmado* e está sendo preparado agora! ⏱️`,
      ready: `✅ Olá ${order.customer_name}! Sua pizza está *pronta*!${order.delivery_type === 'pickup' ? ' Pode vir buscar! 😊' : ' Já vamos embalar para entrega.'}`,
      delivering: `🛵 Olá ${order.customer_name}! Seu pedido *saiu para entrega*! Em breve estará na sua porta. 🍕\n\n📍 Por favor, nos envie sua localização para agilizar a entrega!`,
      completed: `✅ Olá ${order.customer_name}! Seu pedido foi *entregue*! Obrigado pela preferência! 🍕❤️\n\n*Millano Pizzaria*`
    };
    const msg = statusMessages[newStatus];
    if (msg) {
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  /** @param {KitchenOrderItem} order */
  /** @param {KitchenOrderItem} order */
  const handleAdvanceStatus = (order) => {
    const nextStatus = /** @type {'preparing'|'ready'|'delivering'|'completed'} */ (statusFlow[order.status ?? 'pending']);
    if (nextStatus) {
      updateMutation.mutate({ id: order.id, data: { status: nextStatus } }, {
        onSuccess: () => {
          sendStatusWhatsApp(order, nextStatus);
        }
      });
    }
  };

  /**
   * @param {KitchenOrderItem} order
   * @param {number} pizzaIndex
   */
  /**
   * @param {KitchenOrderItem} order
   * @param {number} pizzaIndex
   */
  const togglePizzaReady = (order, pizzaIndex) => {
    const updatedPizzas = [...(order.pizzas || [])];
    updatedPizzas[pizzaIndex] = {
      ...updatedPizzas[pizzaIndex],
      ready: !updatedPizzas[pizzaIndex].ready
    };
    updateMutation.mutate({ id: order.id, data: { pizzas: updatedPizzas } });
  };

  /**
   * @param {KitchenOrderItem} order
   * @param {number} drinkIndex
   */
  const toggleDrinkReady = (order, drinkIndex) => {
    const updatedDrinks = [...(order.drinks || [])];
    updatedDrinks[drinkIndex] = {
      ...updatedDrinks[drinkIndex],
      ready: !updatedDrinks[drinkIndex].ready
    };
    updateMutation.mutate({ id: order.id, data: { drinks: updatedDrinks } });
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
      />
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">Cozinha</h1>
                <p className="text-xs md:text-sm text-muted-foreground">{orders.length} pedidos ativos</p>
              </div>
            </div>
            <Link to={createPageUrl('AdminHome')} className="flex-shrink-0">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-4 md:py-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg md:text-xl font-semibold text-foreground">Nenhum pedido ativo</p>
            <p className="text-sm text-muted-foreground mt-2">Todos os pedidos foram concluídos! 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Pending Column */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-3 h-3 rounded-full bg-warning flex-shrink-0" />
                <h2 className="font-semibold text-foreground text-sm md:text-base">Pendentes</h2>
                <span className="ml-auto bg-warning/20 text-warning text-xs font-semibold px-2 py-1 rounded">
                  {groupedOrders.pending.length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {groupedOrders.pending.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onTogglePizza={togglePizzaReady}
                    onToggleDrink={toggleDrinkReady}
                    onEdit={setEditingOrder}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>

            {/* Preparing Column */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-3 h-3 rounded-full bg-info flex-shrink-0" />
                <h2 className="font-semibold text-foreground text-sm md:text-base">Preparando</h2>
                <span className="ml-auto bg-info/20 text-info text-xs font-semibold px-2 py-1 rounded">
                  {groupedOrders.preparing.length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {groupedOrders.preparing.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onTogglePizza={togglePizzaReady}
                    onToggleDrink={toggleDrinkReady}
                    onEdit={setEditingOrder}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>

            {/* Ready Column */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-3 h-3 rounded-full bg-success flex-shrink-0" />
                <h2 className="font-semibold text-foreground text-sm md:text-base">Prontos</h2>
                <span className="ml-auto bg-success/20 text-success text-xs font-semibold px-2 py-1 rounded">
                  {groupedOrders.ready.length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {groupedOrders.ready.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onTogglePizza={togglePizzaReady}
                    onToggleDrink={toggleDrinkReady}
                    onEdit={setEditingOrder}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>

            {/* Delivering Column */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                <h2 className="font-semibold text-foreground text-sm md:text-base">Entrega</h2>
                <span className="ml-auto bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded">
                  {groupedOrders.delivering.length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {groupedOrders.delivering.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAdvance={handleAdvanceStatus}
                    onTogglePizza={togglePizzaReady}
                    onToggleDrink={toggleDrinkReady}
                    onEdit={setEditingOrder}
                    updating={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
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

/**
 * @param {{
 *   order: KitchenOrderItem;
 *   onAdvance: (order: KitchenOrderItem) => void;
 *   onTogglePizza: (order: KitchenOrderItem, pizzaIndex: number) => void;
 *   onToggleDrink: (order: KitchenOrderItem, drinkIndex: number) => void;
 *   onEdit: (order: KitchenOrderItem | null) => void;
 *   updating: boolean;
 * }} props
 */
function OrderCard({ order, onAdvance, onTogglePizza, onToggleDrink, onEdit, updating }) {
  const config = statusConfig[order.status ?? 'pending'];
  const timeAgo = format(new Date(order.created_date || 0), 'HH:mm', { locale: ptBR });
  const minutesAgo = differenceInMinutes(new Date(), new Date(order.created_date || 0));
  
  const allItemsReady = 
    (order.pizzas?.every((p) => p.ready) ?? true) && 
    (order.drinks?.every((d) => d.ready) ?? true);

  const getStatusBadgeVariant = () => {
    if (minutesAgo > 15 && order.status === 'preparing') return 'destructive';
    if (minutesAgo > 10 && order.status === 'preparing') return 'warning';
    return 'default';
  };

  const openGoogleMaps = () => {
    if (order.delivery_type === 'delivery' && order.address_text) {
      const encodedAddress = encodeURIComponent(order.address_text);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Card className={cn(
      "p-3 md:p-4 border-2",
      minutesAgo > 15 && order.status === 'preparing' && "border-error"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-foreground truncate">{order.customer_name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {minutesAgo > 0 && (
              <Badge variant={getStatusBadgeVariant()} size="sm">
                {minutesAgo}min
              </Badge>
            )}
          </div>
        </div>
        {order.delivery_type === 'delivery' && (
          <Truck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {/* Address (if delivery) */}
      {order.delivery_type === 'delivery' && order.address_text && (
        <button
          onClick={openGoogleMaps}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mb-3"
        >
          <Truck className="w-3 h-3" />
          Ver rota
        </button>
      )}

      {/* Pizzas */}
      {(order.pizzas?.length ?? 0) > 0 && (
        <div className="space-y-2 mb-3">
          {order.pizzas?.map((pizza, i) => (
            <div
              key={i}
              onClick={() => order.status === 'preparing' && onTogglePizza(order, i)}
              className={cn(
                "bg-card rounded-lg p-2 transition-all text-sm border",
                order.status === 'preparing' && "cursor-pointer hover:shadow-sm",
                pizza.ready && "bg-success/10 border-success"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge size="sm" variant={pizza.ready ? "success" : "default"}>
                  {pizza.size}
                </Badge>
                {pizza.ready && (
                  <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                )}
              </div>
              <p className="text-foreground font-medium text-xs md:text-sm line-clamp-2">
                {pizza.is_half ? (
                  <>
                    <span className="text-warning">½</span> {pizza.flavor1} / <span className="text-warning">½</span> {pizza.flavor2}
                  </>
                ) : (
                  pizza.flavor1
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Drinks */}
      {(order.drinks?.length ?? 0) > 0 && (
        <div className="mb-3 border-t border-border pt-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Bebidas</p>
          <div className="space-y-1">
            {(order.drinks ?? []).map((drink, i) => (
              <div
                key={i}
                onClick={() => order.status === 'preparing' && onToggleDrink(order, i)}
                className={cn(
                  "text-xs p-2 rounded flex items-center justify-between transition-all",
                  order.status === 'preparing' && "cursor-pointer hover:bg-accent",
                  drink.ready && "bg-success/10"
                )}
              >
                <span className="text-foreground">{drink.quantity}x {drink.name}</span>
                {drink.ready && (
                  <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="mb-3 text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
          "{order.notes}"
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          onClick={() => onAdvance(order)}
          disabled={updating || (order.status === 'preparing' && !allItemsReady)}
          variant="default"
          size="sm"
          className="flex-1"
        >
          <span className="text-xs md:text-sm">{config.nextLabel}</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <Button
          onClick={() => onEdit(order)}
          variant="outline"
          size="icon"
          className="h-9 w-9"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </div>

      {order.status === 'preparing' && !allItemsReady && (
        <p className="text-xs text-warning text-center mt-2 font-medium">
          Marque itens prontos
        </p>
      )}
    </Card>
  );
}