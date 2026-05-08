import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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

const DELIVERY_FEE = 2;

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
  const [pizzas, setPizzas] = useState([{ size: '8', is_half: false, flavor1: '', flavor2: '', price: 35 }]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [drinks, setDrinks] = useState([]);
  const [notes, setNotes] = useState('');

  // Load menu items from DB
  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-neworder'],
    queryFn: () => base44.entities.MenuItem.list()
  });

  const pizzaItems = menuItems.filter(i => i.type === 'pizza' && i.available);
  const drinkItems = menuItems.filter(i => i.type === 'drink' && i.available);

  const getPizzaPrice = (name, size) => {
    const item = pizzaItems.find(p => p.name === name);
    if (item) {
      if (size === '6') return item.price_small || 28;
      if (size === '8') return item.price_medium || 35;
    }
    return size === '6' ? 28 : 35;
  };

  const addPizza = () => {
    setPizzas([...pizzas, { size: '8', is_half: false, flavor1: '', flavor2: '', price: 35 }]);
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
    const fee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
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
    await base44.entities.Order.create({
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_type: deliveryType,
      address_text: addressText,
      pizzas,
      drinks,
      total_amount: calculateTotal(),
      notes,
      payment_method: paymentMethod,
      status: 'pending',
      payment_status: paymentMethod === 'cash' ? 'pending' : 'paid'
    });
    toast.success('Pedido criado com sucesso!');
    setSubmitting(false);
    navigate(createPageUrl('Orders'));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Novo Pedido</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Customer Info */}
        <Card className="p-4 bg-white border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-4">Dados do Cliente</h2>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>
        </Card>

        {/* Delivery Type */}
        <Card className="p-4 bg-white border-slate-200">
          <Label className="mb-2 block">Tipo de Entrega</Label>
          <div className="flex gap-2">
            <Button type="button" variant={deliveryType === 'delivery' ? 'default' : 'outline'} className="flex-1" onClick={() => setDeliveryType('delivery')}>
              Entrega
            </Button>
            <Button type="button" variant={deliveryType === 'pickup' ? 'default' : 'outline'} className="flex-1" onClick={() => setDeliveryType('pickup')}>
              Retirada
            </Button>
          </div>
        </Card>

        {/* Address */}
        {deliveryType === 'delivery' && (
          <Card className="p-4 bg-white border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-4">Endereço de Entrega</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Bairro *</Label>
                  <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Rua *</Label>
                <Input value={rua} onChange={(e) => setRua(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Complemento</Label>
                  <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, bloco..." />
                </div>
                <div>
                  <Label>Referência</Label>
                  <Input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Perto de..." />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Pizzas */}
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Pizzas</h2>
            <Button type="button" variant="outline" size="sm" onClick={addPizza}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="space-y-4">
            {pizzas.map((pizza, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Pizza #{index + 1}</span>
                  {pizzas.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePizza(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tamanho</Label>
                    <Select value={pizza.size} onValueChange={(v) => updatePizza(index, 'size', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 fatias</SelectItem>
                        <SelectItem value="8">8 fatias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Preço (R$)</Label>
                    <Input type="number" value={pizza.price} onChange={(e) => updatePizza(index, 'price', parseFloat(e.target.value))} />
                  </div>
                </div>
                <div>
                  <Label>Sabor 1</Label>
                  <Select value={pizza.flavor1} onValueChange={(v) => updatePizza(index, 'flavor1', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o sabor" /></SelectTrigger>
                    <SelectContent>
                      {pizzaItems.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={pizza.is_half} onChange={(e) => updatePizza(index, 'is_half', e.target.checked)} className="w-4 h-4" id={`half-${index}`} />
                  <Label htmlFor={`half-${index}`}>Meio a meio</Label>
                </div>
                {pizza.is_half && (
                  <div>
                    <Label>Sabor 2</Label>
                    <Select value={pizza.flavor2} onValueChange={(v) => updatePizza(index, 'flavor2', v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione o sabor" /></SelectTrigger>
                      <SelectContent>
                        {pizzaItems.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Drinks */}
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Bebidas</h2>
            <Button type="button" variant="outline" size="sm" onClick={addDrink}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
          {drinks.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma bebida adicionada</p>
          ) : (
            <div className="space-y-3">
              {drinks.map((drink, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Bebida #{index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDrink(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div>
                    <Label>Bebida</Label>
                    {drinkItems.length > 0 ? (
                      <Select value={drink.name} onValueChange={(v) => updateDrink(index, 'name', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {drinkItems.map(d => <SelectItem key={d.id} value={d.name}>{d.name} - R$ {d.price?.toFixed(2)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={drink.name} onChange={(e) => updateDrink(index, 'name', e.target.value)} placeholder="Nome da bebida" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Quantidade</Label>
                      <Input type="number" min="1" value={drink.quantity} onChange={(e) => updateDrink(index, 'quantity', parseInt(e.target.value))} />
                    </div>
                    <div>
                      <Label>Preço Unitário (R$)</Label>
                      <Input type="number" value={drink.price} onChange={(e) => updateDrink(index, 'price', parseFloat(e.target.value))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment */}
        <Card className="p-4 bg-white border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">Pagamento</h2>
          <div className="flex gap-2">
            {[{v:'cash',l:'Dinheiro'},{v:'card',l:'Cartão'},{v:'pix',l:'PIX'}].map(opt => (
              <Button key={opt.v} type="button" variant={paymentMethod === opt.v ? 'default' : 'outline'} className="flex-1" onClick={() => setPaymentMethod(opt.v)}>
                {opt.l}
              </Button>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-4 bg-white border-slate-200">
          <Label>Observações</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações do pedido..." rows={3} />
        </Card>

        {/* Total */}
        <Card className="p-4 bg-slate-900 text-white">
          {deliveryType === 'delivery' && (
            <div className="flex justify-between text-slate-300 text-sm mb-2">
              <span>Taxa de entrega</span>
              <span>R$ {DELIVERY_FEE.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">R$ {calculateTotal().toFixed(2)}</span>
          </div>
        </Card>
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {submitting ? 'Salvando...' : 'Salvar Pedido'}
        </Button>
      </div>
    </div>
  );
}