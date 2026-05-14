import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { safeJsonParse, safeLocalStorage } from '@/utils/storage';
import { ArrowLeft, CreditCard, Smartphone, Banknote, ShoppingCart, Truck, MapPin, User, Phone } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { orderService } from '@/services/orderService';
import { settingsService } from '@/services/settingsService';
import { formatCurrency } from '@/utils/format';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings()
  });

  const waPhone = settings?.whatsapp_number || '5511999999999';
  const storeName = settings?.store_name || 'SliceOS';
  const deliveryFeeConfig = parseFloat(settings?.delivery_fee) || 0;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_type: 'delivery',
    address_text: '',
    payment_method: 'cash',
    notes: ''
  });

  const [addressFields, setAddressFields] = useState({
    rua: '',
    numero: '',
    bairro: '',
    complemento: ''
  });

  useEffect(() => {
    const savedCart = safeLocalStorage.get('cart');
    if (savedCart) {
      const parsed = safeJsonParse(savedCart, []);
      setCart(Array.isArray(parsed) ? parsed : []);
    }
    
    const savedPhone = safeLocalStorage.get('customer_phone');
    if (savedPhone) {
      setFormData(prev => ({ ...prev, customer_phone: savedPhone }));
    }
  }, []);

  useEffect(() => {
    const text = [
      addressFields.rua,
      addressFields.numero,
      addressFields.bairro,
      addressFields.complemento
    ].filter(Boolean).join(', ');
    
    setFormData(prev => ({ ...prev, address_text: text }));
  }, [addressFields]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const deliveryFee = formData.delivery_type === 'delivery' ? deliveryFeeConfig : 0;
  const total = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: (data) => orderService.createOrder(data),
    onSuccess: (order) => {
      safeLocalStorage.remove('cart');
      safeLocalStorage.set('customer_phone', formData.customer_phone);
      toast.success('Pedido enviado com sucesso!');

      const itemsText = cart
        .map((i) => `• ${i.name} (${i.quantity}x) - ${formatCurrency(i.price * i.quantity)}`)
        .join('\n');

      const msg = encodeURIComponent(
        `🍕 *NOVO PEDIDO - ${storeName}*\n` +
        `🔢 *ID:* #${order.id.slice(0, 8)}\n\n` +
        `👤 *Cliente:* ${formData.customer_name}\n` +
        `📞 *Tel:* ${formData.customer_phone}\n\n` +
        `🛒 *Itens:*\n${itemsText}\n\n` +
        `💰 *Subtotal:* ${formatCurrency(subtotal)}\n` +
        (deliveryFee > 0 ? `🚚 *Taxa:* ${formatCurrency(deliveryFee)}\n` : '') +
        `⭐ *TOTAL:* ${formatCurrency(total)}\n\n` +
        `💳 *Pagamento:* ${
          formData.payment_method === 'cash' ? 'Dinheiro' : 
          formData.payment_method === 'card' ? 'Cartão (Maquininha)' : 'PIX'
        }\n` +
        `📍 *Entrega:* ${formData.delivery_type === 'delivery' ? formData.address_text : 'Retirada no Local'}\n` +
        (formData.notes ? `\n📝 *Obs:* ${formData.notes}` : '')
      );

      window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank');
      navigate(createPageUrl('TrackOrder') + `?id=${order.id}`);
    },
    onError: () => toast.error('Erro ao enviar pedido. Tente novamente.')
  });

  const handleSubmit = () => {
    if (!formData.customer_name || !formData.customer_phone) {
      return toast.error('Por favor, preencha seu nome e telefone.');
    }
    if (formData.delivery_type === 'delivery' && !formData.address_text) {
      return toast.error('Por favor, preencha o endereço de entrega.');
    }

    createOrderMutation.mutate({
      ...formData,
      items: cart,
      total_amount: total,
      status: 'pending'
    });
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-6">
            <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Carrinho Vazio</h2>
            <p className="text-slate-500 text-sm mb-6">Escolha suas pizzas favoritas para continuar.</p>
            <Button className="w-full bg-slate-900" onClick={() => navigate(createPageUrl('Menu'))}>
              Ver Cardápio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Checkout</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Finalize seu pedido</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 border-0 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-4 h-4" /> Seus Dados
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Nome Completo</Label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData(current => ({ ...current, customer_name: e.target.value }))}
                  placeholder="Como devemos te chamar?"
                  className="h-12"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Telefone / WhatsApp</Label>
                <Input
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(current => ({ ...current, customer_phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="h-12"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Entrega
            </h3>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
              <button
                onClick={() => setFormData(current => ({ ...current, delivery_type: 'delivery' }))}
                className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${
                  formData.delivery_type === 'delivery' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                }`}
              >
                DELIVERY
              </button>
              <button
                onClick={() => setFormData(current => ({ ...current, delivery_type: 'pickup' }))}
                className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${
                  formData.delivery_type === 'pickup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                }`}
              >
                RETIRADA
              </button>
            </div>

            {formData.delivery_type === 'delivery' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Rua / Avenida</Label>
                  <Input value={addressFields.rua} onChange={(e) => setAddressFields(current => ({ ...current, rua: e.target.value }))} className="h-11" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Número</Label>
                  <Input value={addressFields.numero} onChange={(e) => setAddressFields(current => ({ ...current, numero: e.target.value }))} className="h-11" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Bairro</Label>
                  <Input value={addressFields.bairro} onChange={(e) => setAddressFields(current => ({ ...current, bairro: e.target.value }))} className="h-11" />
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Forma de Pagamento</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', label: 'Dinheiro', icon: Banknote },
                { id: 'card', label: 'Cartão', icon: CreditCard },
                { id: 'pix', label: 'PIX', icon: Smartphone }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setFormData(current => ({ ...current, payment_method: method.id }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    formData.payment_method === method.id ? 'border-red-600 bg-red-50' : 'border-slate-50 bg-slate-50'
                  }`}
                >
                  <method.icon className={`w-6 h-6 ${formData.payment_method === method.id ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold uppercase ${formData.payment_method === method.id ? 'text-red-700' : 'text-slate-500'}`}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-0 shadow-xl bg-slate-900 text-white sticky top-24">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-6">Resumo do Pedido</h3>
            <div className="space-y-4 mb-8">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-white leading-tight">{item.quantity}x {item.name}</p>
                    {item.size && <p className="text-[10px] text-slate-400 uppercase mt-1">{item.size} fatias</p>}
                  </div>
                  <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-6 mb-6">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Taxa de Entrega</span>
                <span>{formData.delivery_type === 'delivery' ? formatCurrency(deliveryFee) : 'R$ 0,00'}</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2">
                <span>TOTAL</span>
                <span className="text-red-500">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(current => ({ ...current, notes: e.target.value }))}
                  placeholder="Ex: Tirar cebola, campainha estragada..."
                  className="bg-slate-800 border-0 text-white placeholder:text-slate-600 h-20 resize-none text-xs"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={createOrderMutation.isLoading}
                className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-2xl shadow-2xl shadow-red-900/20"
              >
                {createOrderMutation.isLoading ? 'PROCESSANDO...' : 'CONFIRMAR PEDIDO'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="mt-12 text-center opacity-30">
        <SliceOSFooter />
      </div>
    </div>
  );
}
