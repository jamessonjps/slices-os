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
            <Link to={createPageUrl('AdminHome')}>
              <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
                <Home className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
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
            <p className="text-sm text-slate-500 mt-2">Todos os pedidos foram concluídos! 🎉</p>
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
                    onTogglePizza={togglePizzaReady}
                    onToggleDrink={toggleDrinkReady}
                    onEdit={setEditingOrder}
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
                    onTogglePizza={togglePizzaReady}
                    onToggleDrink={toggleDrinkReady}
                    onEdit={setEditingOrder}
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
                    onTogglePizza={togglePizzaReady}
                    onToggleDrink={toggleDrinkReady}
                    onEdit={setEditingOrder}
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

      {/* Pizzas */}
      <div className="space-y-2 mb-4">
        {order.pizzas?.map((pizza, i) => (
          <div
            key={i}
            onClick={() => order.status === 'preparing' && onTogglePizza(order, i)}
            className={cn(
              "bg-slate-700 rounded-lg p-3 transition-all",
              order.status === 'preparing' && "cursor-pointer hover:bg-slate-600",
              pizza.ready && "bg-green-900 border-2 border-green-600"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-slate-600 text-white border-0">
                {pizza.size} fatias
              </Badge>
              {pizza.ready ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : order.status === 'preparing' ? (
                <Circle className="w-4 h-4 text-slate-400" />
              ) : null}
            </div>
            <p className="text-sm text-white font-medium">
              {pizza.is_half ? (
                <>
                  <span className="text-amber-400">½</span> {pizza.flavor1}
                  <br />
                  <span className="text-amber-400">½</span> {pizza.flavor2}
                </>
              ) : (
                pizza.flavor1
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Drinks */}
      {(order.drinks?.length ?? 0) > 0 && (
        <div className="mb-4 border-t border-slate-700 pt-3">
          <p className="text-xs text-slate-400 mb-2">Bebidas:</p>
          <div className="space-y-2">
            {(order.drinks ?? []).map((drink, i) => (
              <div
                key={i}
                onClick={() => order.status === 'preparing' && onToggleDrink(order, i)}
                className={cn(
                  "text-sm text-slate-300 p-2 rounded flex items-center justify-between",
                  order.status === 'preparing' && "cursor-pointer hover:bg-slate-600",
                  drink.ready && "bg-green-900 text-green-100"
                )}
              >
                <span>{drink.quantity}x {drink.name}</span>
                {drink.ready ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : order.status === 'preparing' ? (
                  <Circle className="w-4 h-4 text-slate-400" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advance Button */}
      <Button
        onClick={() => onAdvance(order)}
        disabled={updating || (order.status === 'preparing' && !allItemsReady)}
        className={cn(
          `w-full ${config.color} hover:opacity-90 text-white font-semibold`,
          order.status === 'preparing' && !allItemsReady && "opacity-50 cursor-not-allowed"
        )}
      >
        {config.nextLabel}
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

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(order)}
        className="w-full mt-2 text-slate-400 hover:text-white hover:bg-slate-700 text-xs"
      >
        <Pencil className="w-3 h-3 mr-1" />
        Editar e Notificar Cliente
      </Button>
    </Card>
  );
}