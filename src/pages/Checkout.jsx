import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShoppingCart, ArrowLeft, Truck, Package, CreditCard, DollarSign, Wallet, MessageSquare, Loader2 } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { safeLocalStorage, safeJsonParse } from '@/utils/storage';
import { formatCurrency } from '@/utils/format';
import { orderService } from '@/services/orderService';
import { settingsService } from '@/services/settingsService';
import { isOpen } from '@/utils/businessHours';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  customer_name: z.string().min(3, 'Nome muito curto'),
  customer_phone: z.string().min(10, 'Telefone inválido'),
  delivery_type: z.enum(['delivery', 'pickup']),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  complemento: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'pix']),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.delivery_type === 'delivery') {
    return data.rua && data.numero && data.bairro;
  }
  return true;
}, {
  message: "Preencha o endereço completo para entrega",
  path: ["rua"],
});

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = React.useState([]);

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings(),
    staleTime: 0, // Garante que sempre pegue o mais novo
  });

  const hours = settings?.business_hours || {};
  const isStoreOpen = isOpen(hours);
  const storeName = settings?.store_name || 'SliceOS';
  const waPhone = settings?.whatsapp_number || '';
  const deliveryFeeConfig = parseFloat(settings?.delivery_fee) || 0;

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Sincronizando com a loja...</p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_type: 'delivery',
      payment_method: 'cash',
      customer_phone: safeLocalStorage.get('customer_phone') || ''
    }
  });

  const deliveryType = watch('delivery_type');
  const paymentMethod = watch('payment_method');

  useEffect(() => {
    const savedCart = safeLocalStorage.get('cart');
    if (savedCart) {
      const parsed = safeJsonParse(savedCart, []);
      setCart(Array.isArray(parsed) ? parsed : []);
    }
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const deliveryFee = deliveryType === 'delivery' ? deliveryFeeConfig : 0;
  const total = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: (data) => orderService.createOrder(data),
    onSuccess: (order, variables) => {
      safeLocalStorage.remove('cart');
      safeLocalStorage.set('customer_phone', variables.customer_phone);
      toast.success('Pedido enviado com sucesso!');

      const itemsText = cart
        .map((i) => `• ${i.name} (${i.quantity}x) - ${formatCurrency(i.price * i.quantity)}`)
        .join('\n');

      const addressText = variables.delivery_type === 'delivery' 
        ? `${variables.rua}, ${variables.numero}${variables.complemento ? ', ' + variables.complemento : ''} - ${variables.bairro}`
        : 'Retirada no Local';

      const msg = encodeURIComponent(
        `🍕 *NOVO PEDIDO - ${storeName}*\n` +
        `🔢 *ID:* #${order.id.slice(0, 8)}\n\n` +
        `👤 *Cliente:* ${variables.customer_name}\n` +
        `📞 *Tel:* ${variables.customer_phone}\n\n` +
        `🛒 *Itens:*\n${itemsText}\n\n` +
        `💰 *Subtotal:* ${formatCurrency(subtotal)}\n` +
        (deliveryFee > 0 ? `🚚 *Taxa:* ${formatCurrency(deliveryFee)}\n` : '') +
        `⭐ *TOTAL:* ${formatCurrency(total)}\n\n` +
        `💳 *Pagamento:* ${
          variables.payment_method === 'cash' ? 'Dinheiro' : 
          variables.payment_method === 'card' ? 'Cartão (Maquininha)' : 'PIX'
        }\n` +
        `📍 *Entrega:* ${addressText}\n` +
        (variables.notes ? `\n📝 *Obs:* ${variables.notes}` : '')
      );

      window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank');
      navigate(createPageUrl('TrackOrder') + `?id=${order.id}`);
    },
    onError: (err) => toast.error('Erro ao enviar pedido: ' + err.message)
  });

  const onSubmit = (data) => {
    const address_text = data.delivery_type === 'delivery'
      ? `${data.rua}, ${data.numero}${data.complemento ? ', ' + data.complemento : ''} - ${data.bairro}`
      : 'Retirada no Local';

    createOrderMutation.mutate({
      ...data,
      address_text,
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
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Menu')}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Finalizar Pedido</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6 border-0 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Seus Dados
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-400 ml-1">Nome Completo</Label>
                  <Input {...register('customer_name')} placeholder="Como devemos te chamar?" className={errors.customer_name ? 'border-red-500' : ''} />
                  {errors.customer_name && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.customer_name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-400 ml-1">WhatsApp</Label>
                  <Input {...register('customer_phone')} placeholder="(11) 99999-9999" className={errors.customer_phone ? 'border-red-500' : ''} />
                  {errors.customer_phone && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.customer_phone.message}</p>}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Forma de Entrega
              </h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={deliveryType === 'delivery' ? 'default' : 'outline'}
                  className="flex-1 h-20 flex-col gap-2 rounded-2xl"
                  onClick={() => setValue('delivery_type', 'delivery')}
                >
                  <Truck className="w-6 h-6" />
                  <span className="text-xs font-bold">Entrega</span>
                </Button>
                <Button
                  type="button"
                  variant={deliveryType === 'pickup' ? 'default' : 'outline'}
                  className="flex-1 h-20 flex-col gap-2 rounded-2xl"
                  onClick={() => setValue('delivery_type', 'pickup')}
                >
                  <Package className="w-6 h-6" />
                  <span className="text-xs font-bold">Retirada</span>
                </Button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-4 pt-4 border-t border-slate-50 mt-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Rua / Avenida</Label>
                      <Input {...register('rua')} placeholder="Ex: Av. Paulista" className={errors.rua ? 'border-red-500' : ''} />
                    </div>
                    <div className="col-span-1 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Nº</Label>
                      <Input {...register('numero')} placeholder="123" className={errors.numero ? 'border-red-500' : ''} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Bairro</Label>
                      <Input {...register('bairro')} placeholder="Ex: Centro" className={errors.bairro ? 'border-red-500' : ''} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Complemento</Label>
                      <Input {...register('complemento')} placeholder="Apto, Bloco..." />
                    </div>
                  </div>
                  {errors.rua && <p className="text-[10px] text-red-500 font-medium pl-1 text-center">Por favor, preencha o endereço completo</p>}
                </div>
              )}
            </Card>

            <Card className="p-6 border-0 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Pagamento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="justify-start h-14 rounded-xl px-4 gap-3"
                  onClick={() => setValue('payment_method', 'cash')}
                >
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="flex-1 text-left">Dinheiro</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="justify-start h-14 rounded-xl px-4 gap-3"
                  onClick={() => setValue('payment_method', 'card')}
                >
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <span className="flex-1 text-left">Cartão</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                  className="justify-start h-14 rounded-xl px-4 gap-3"
                  onClick={() => setValue('payment_method', 'pix')}
                >
                  <Wallet className="w-5 h-5 text-purple-500" />
                  <span className="flex-1 text-left">PIX</span>
                </Button>
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
                  <span>{deliveryType === 'delivery' ? formatCurrency(deliveryFee) : 'R$ 0,00'}</span>
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
                    {...register('notes')}
                    placeholder="Ex: Tirar cebola, campainha estragada..."
                    className="bg-slate-800 border-0 text-white placeholder:text-slate-600 h-20 resize-none text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || createOrderMutation.isPending || !open}
                  className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-2xl shadow-2xl shadow-red-900/20 disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmitting || createOrderMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : !open ? (
                    'LOJA FECHADA'
                  ) : (
                    'CONFIRMAR PEDIDO'
                  )}
                </Button>
                {!open && (
                  <p className="text-[10px] text-red-400 text-center font-bold uppercase tracking-widest mt-2">
                    Não estamos aceitando pedidos no momento
                  </p>
                )}
              </div>
            </Card>
            <SliceOSFooter />
          </div>
        </form>
      </div>
    </div>
  );
}
