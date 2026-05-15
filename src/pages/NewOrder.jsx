import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { menuService } from '@/services/menuService';
import { orderService } from '@/services/orderService';
import { settingsService } from '@/services/settingsService';

export default function NewOrder() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [referencia, setReferencia] = useState('');
  const [pizzas, setPizzas] = useState([{ size: '8', is_half: false, flavor1: '', flavor2: '', price: 45 }]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [drinks, setDrinks] = useState([]);
  const [notes, setNotes] = useState('');

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-neworder'],
    queryFn: () => menuService.listMenuItems()
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings()
  });

  const deliveryFee = settings?.delivery_fee || 0;

  const pizzaItems = menuItems.filter(i => i.type === 'pizza' && i.available);
  const drinkItems = menuItems.filter(i => i.type === 'drink' && i.available);

  const getPizzaPrice = (name, size) => {
    const item = pizzaItems.find(p => p.name === name);
    if (item) {
      if (size === '6') return item.price_small || 35;
      if (size === '8') return item.price_medium || 45;
      if (size === '12') return item.price_large || 55;
    }
    return size === '6' ? 35 : 45;
  };

  const addPizza = () => {
    setPizzas([...pizzas, { size: '8', is_half: false, flavor1: '', flavor2: '', price: 45 }]);
  };

  const removePizza = (index) => {
    setPizzas(pizzas.filter((_, i) => i !== index));
  };

  const updatePizza = (index, field, value) => {
    const updated = [...pizzas];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'size' || field === 'flavor1') {
      updated[index].price = getPizzaPrice(
        field === 'flavor1' ? value : updated[index].flavor1,
        field === 'size' ? value : updated[index].size
      );
    }
    setPizzas(updated);
  };

  const addDrink = () => {
    const firstDrink = drinkItems[0];
    setDrinks([...drinks, { 
      name: firstDrink?.name || '', 
      quantity: 1, 
      price: firstDrink?.price || 10 
    }]);
  };

  const removeDrink = (index) => {
    setDrinks(drinks.filter((_, i) => i !== index));
  };

  const updateDrink = (index, field, value) => {
    const updated = [...drinks];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'name') {
      const item = drinkItems.find(d => d.name === value);
      if (item) updated[index].price = item.price;
    }
    setDrinks(updated);
  };

  const calculateTotal = () => {
    const pizzaTotal = pizzas.reduce((sum, p) => sum + (p.price || 0), 0);
    const drinkTotal = drinks.reduce((sum, d) => sum + ((d.price || 0) * (d.quantity || 0)), 0);
    const fee = deliveryType === 'delivery' ? deliveryFee : 0;
    return pizzaTotal + drinkTotal + fee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      toast.error('Preencha nome e telefone do cliente');
      return;
    }
    if (deliveryType === 'delivery' && (!bairro || !rua || !numero)) {
      toast.error('Preencha o endereço de entrega');
      return;
    }
    if (pizzas.length === 0 || !pizzas[0].flavor1) {
      toast.error('Adicione pelo menos uma pizza');
      return;
    }
    setSubmitting(true);
    
    const addressText = deliveryType === 'delivery'
      ? `${rua}, ${numero}${complemento ? ', ' + complemento : ''} - ${bairro}${referencia ? ' (Ref: ' + referencia + ')' : ''}`
      : null;

    // Map items to a consistent format for the 'items' JSONB column
    const items = [
      ...pizzas.map(p => ({
        type: 'pizza',
        name: p.is_half ? `${p.flavor1} / ${p.flavor2}` : p.flavor1,
        size: p.size,
        price: p.price,
        isHalf: p.is_half,
        flavor1: p.flavor1,
        flavor2: p.flavor2,
        quantity: 1
      })),
      ...drinks.map(d => ({
        type: 'drink',
        name: d.name,
        price: d.price,
        quantity: d.quantity
      }))
    ];

    try {
      await orderService.createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_type: deliveryType,
        address_text: addressText,
        total_amount: calculateTotal(),
        notes,
        payment_method: paymentMethod,
        status: 'pending',
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
        items: items
      });
      toast.success('Pedido criado com sucesso!');
      navigate(createPageUrl('Orders'));
    } catch (err) {
      toast.error('Erro ao criar pedido: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">Novo Pedido</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-4 bg-white border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Dados do Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nome Completo *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: João Silva" />
            </div>
            <div className="space-y-1">
              <Label>WhatsApp / Telefone *</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Forma de Entrega</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={deliveryType === 'delivery' ? 'default' : 'outline'} className="h-12" onClick={() => setDeliveryType('delivery')}>
              Entregar em Casa
            </Button>
            <Button type="button" variant={deliveryType === 'pickup' ? 'default' : 'outline'} className="h-12" onClick={() => setDeliveryType('pickup')}>
              Retirar na Loja
            </Button>
          </div>
        </Card>

        {deliveryType === 'delivery' && (
          <Card className="p-4 bg-white border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Endereço de Entrega</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Bairro *</Label>
                  <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>NÁºmero / Complemento *</Label>
                  <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 123, Apto 4" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Logradouro (Rua/Av) *</Label>
                <Input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Ex: Rua das Flores" />
              </div>
              <div className="space-y-1">
                <Label>Ponto de Referência</Label>
                <Input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Próximo ao mercado..." />
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Pizzas</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addPizza} className="text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Outra
            </Button>
          </div>
          <div className="space-y-6">
            {pizzas.map((pizza, index) => (
              <div key={index} className="relative bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                {pizzas.length > 1 && (
                  <button type="button" onClick={() => removePizza(index)} className="absolute -top-2 -right-2 bg-white border border-red-100 rounded-full p-1 text-red-500 shadow-sm hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <Label>Tamanho</Label>
                    <Select value={pizza.size} onValueChange={(v) => updatePizza(index, 'size', v)}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">Pequena (6 fatias)</SelectItem>
                        <SelectItem value="8">Média (8 fatias)</SelectItem>
                        <SelectItem value="12">Família (12 fatias)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Preço (R$)</Label>
                    <Input type="number" value={pizza.price} onChange={(e) => updatePizza(index, 'price', parseFloat(e.target.value))} className="bg-white" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>{pizza.is_half ? 'Primeiro Sabor' : 'Sabor da Pizza'}</Label>
                    <Select value={pizza.flavor1} onValueChange={(v) => updatePizza(index, 'flavor1', v)}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Escolha um sabor" /></SelectTrigger>
                      <SelectContent>
                        {pizzaItems.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input type="checkbox" checked={pizza.is_half} onChange={(e) => updatePizza(index, 'is_half', e.target.checked)} className="w-4 h-4 rounded text-slate-900" id={`half-${index}`} />
                    <Label htmlFor={`half-${index}`} className="text-xs font-medium text-slate-600">Pizza Meio a Meio</Label>
                  </div>

                  {pizza.is_half && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Label>Segundo Sabor</Label>
                      <Select value={pizza.flavor2} onValueChange={(v) => updatePizza(index, 'flavor2', v)}>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="Escolha o segundo sabor" /></SelectTrigger>
                        <SelectContent>
                          {pizzaItems.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Bebidas & Adicionais</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addDrink} className="text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Item
            </Button>
          </div>
          {drinks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum item adicional selecionado</p>
          ) : (
            <div className="space-y-3">
              {drinks.map((drink, index) => (
                <div key={index} className="flex items-end gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-400">Item</Label>
                    <Select value={drink.name} onValueChange={(v) => updateDrink(index, 'name', v)}>
                      <SelectTrigger className="bg-white h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {drinkItems.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-400">Qtd</Label>
                    <Input type="number" min="1" value={drink.quantity} onChange={(e) => updateDrink(index, 'quantity', parseInt(e.target.value))} className="bg-white h-9" />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-400">Preço (un)</Label>
                    <Input type="number" value={drink.price} onChange={(e) => updateDrink(index, 'price', parseFloat(e.target.value))} className="bg-white h-9" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDrink(index)} className="text-red-400 h-9 w-9">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Pagamento</h2>
          <div className="grid grid-cols-3 gap-2">
            {[{v:'cash',l:'Dinheiro'},{v:'card',l:'Cartão'},{v:'pix',l:'PIX'}].map(opt => (
              <Button key={opt.v} type="button" variant={paymentMethod === opt.v ? 'default' : 'outline'} className="h-12" onClick={() => setPaymentMethod(opt.v)}>
                {opt.l}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <Label className="text-sm uppercase tracking-wider mb-2 block">Observações do Pedido</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Sem cebola, trocar refrigerante..." rows={3} />
        </Card>

        <Card className="p-6 bg-slate-900 text-white shadow-xl">
          <div className="space-y-3">
            {deliveryType === 'delivery' && (
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Taxa de Entrega</span>
                <span>+ R$ {deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-lg font-medium">Total do Pedido</span>
              <span className="text-3xl font-bold tracking-tight">R$ {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg"
          >
            {submitting ? (
              <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Finalizar Pedido</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
