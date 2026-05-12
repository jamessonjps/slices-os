import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CreditCard, Smartphone, Banknote } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   type: 'pizza' | 'drink';
 *   price: number;
 *   quantity: number;
 *   size?: string;
 *   is_half?: boolean;
 *   flavor1?: string;
 *   flavor2?: string;
 * }} CartItem
 */

/**
 * @typedef {{
 *   customer_name: string;
 *   customer_phone: string;
 *   delivery_type: 'delivery' | 'pickup';
 *   address_text: string;
 *   payment_method: 'cash' | 'card' | 'pix';
 *   notes: string;
 * }} CheckoutForm
 */

export default function Checkout() {
  const [cart, setCart] = useState(/** @type {CartItem[]} */ ([]));

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.Settings.list()
  });

  const settings = /** @type {{ key: string; value: string }[]} */ (
    settingsQuery.data ?? []
  );

  const waPhone = settings.find(
    /** @param {{ key: string; value: string }} s */
    (s) => s.key === 'whatsapp_number'
  )?.value || '5511999999999';

  const [formData, setFormData] = useState(/** @type {CheckoutForm} */ ({
    customer_name: '',
    customer_phone: '',
    delivery_type: 'delivery',
    address_text: '',
    payment_method: 'cash',
    notes: ''
  }));

  const [addressFields, setAddressFields] = useState({
    rua: '',
    numero: '',
    bairro: '',
    complemento: ''
  });

  const DELIVERY_FEE = 2;

  /**
   * @param {{rua:string, numero:string, bairro:string, complemento:string}} fields
   */
  const buildAddressText = (fields) => {
    const parts = [`${fields.rua}, ${fields.numero}`];
    if (fields.bairro) parts.push(fields.bairro);
    if (fields.complemento) parts.push(fields.complemento);
    return parts.join(' - ');
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) ?? []);
      } catch (error) {
        console.warn('Invalid cart data in localStorage:', error);
        localStorage.removeItem('cart');
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      address_text: buildAddressText(addressFields)
    }));
  }, [addressFields]);

  /**
   * @param {'customer_name'|'customer_phone'|'delivery_type'|'address_text'|'payment_method'|'notes'} field
   * @returns {(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}
   */
  const handleFormDataFieldChange = (field) =>
    /** @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event */
    (event) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value
      }));
    };

  /**
   * @param {'rua'|'numero'|'bairro'|'complemento'} field
   * @returns {(event: React.ChangeEvent<HTMLInputElement>) => void}
   */
  const handleAddressFieldChange = (field) =>
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    (event) => {
      setAddressFields((current) => ({
        ...current,
        [field]: event.target.value
      }));
    };

  const createOrderMutation = useMutation({
    /** @param {any} data */
    mutationFn: (data) => base44.entities.Order.create(data),
    /** @param {any} order */
    onSuccess: (order) => {
      localStorage.removeItem('cart');
      toast.success('Pedido criado!');

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = formData.delivery_type === 'delivery' ? DELIVERY_FEE : 0;
      const totalFinal = subtotal + deliveryFee;
      const items = cart
        .map(
          (i) => `• ${i.name} (${i.quantity}x) - R$ ${(i.price * i.quantity).toFixed(2)}`
        )
        .join('\n');

      const msg = encodeURIComponent(
        `🍕 *Novo Pedido - Millano Pizzaria*\n\n*Cliente:* ${formData.customer_name}\n*Tel:* ${formData.customer_phone}\n\n*Itens:*\n${items}\n\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n${
          deliveryFee > 0
            ? `*Taxa de entrega:* R$ ${deliveryFee.toFixed(2)}\n`
            : ''
        }*Total:* R$ ${totalFinal.toFixed(2)}\n\n*Pagamento:* ${
          formData.payment_method === 'cash'
            ? 'Dinheiro'
            : formData.payment_method === 'card'
            ? 'Cartão'
            : 'PIX'
        }\n*Entrega:* ${
          formData.delivery_type === 'delivery' ? formData.address_text : 'Retirada'
        }${
          formData.delivery_type === 'delivery'
            ? '\n\n📍 *Para agilizar sua entrega, por favor nos envie sua localização pelo WhatsApp!*'
            : ''
        }`
      );

      window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank');
      window.location.href = createPageUrl('TrackOrder') + `?id=${order.id}`;
    }
  });

  const handleSubmit = () => {
    const pizzas = cart
      .filter((item) => item.type === 'pizza')
      .map((p) => ({
        size: String(p.size),
        is_half: p.is_half || false,
        flavor1: p.flavor1 || p.name,
        flavor2: p.flavor2 || '',
        price: p.price * p.quantity
      }));

    const drinks = cart
      .filter((item) => item.type === 'drink')
      .map((d) => ({
        name: d.name,
        quantity: d.quantity,
        price: d.price
      }));

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = formData.delivery_type === 'delivery' ? DELIVERY_FEE : 0;

    createOrderMutation.mutate({
      ...formData,
      pizzas,
      drinks,
      total_amount: subtotal + deliveryFee,
      status: 'pending',
      payment_status: formData.payment_method === 'cash' ? 'pending' : 'paid'
    });
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = formData.delivery_type === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full text-center space-y-4 bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Nenhum item no carrinho</h1>
          <p className="text-sm text-slate-500">Adicione produtos ao carrinho antes de finalizar o pedido.</p>
          <Button onClick={() => (window.location.href = createPageUrl('Menu'))}>Voltar para o cardápio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Finalizar Pedido</h1>
              <p className="text-sm text-slate-500">Confira os dados e confirme o pedido.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="space-y-6 p-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Dados do Cliente</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Nome</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={handleFormDataFieldChange('customer_name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Telefone</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleFormDataFieldChange('customer_phone')}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Entrega</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                type="button"
                variant={formData.delivery_type === 'delivery' ? 'default' : 'outline'}
                onClick={() => setFormData((current) => ({ ...current, delivery_type: 'delivery' }))}
                className="w-full"
              >
                <Smartphone className="h-4 w-4" /> Delivery
              </Button>
              <Button
                type="button"
                variant={formData.delivery_type === 'pickup' ? 'default' : 'outline'}
                onClick={() => setFormData((current) => ({ ...current, delivery_type: 'pickup', address_text: '' }))}
                className="w-full"
              >
                <Banknote className="h-4 w-4" /> Retirada
              </Button>
            </div>

            {formData.delivery_type === 'delivery' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={addressFields.rua}
                    onChange={handleAddressFieldChange('rua')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={addressFields.numero}
                    onChange={handleAddressFieldChange('numero')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={addressFields.bairro}
                    onChange={handleAddressFieldChange('bairro')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={addressFields.complemento}
                    onChange={handleAddressFieldChange('complemento')}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Pagamento</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button
                type="button"
                variant={formData.payment_method === 'cash' ? 'default' : 'outline'}
                onClick={() => setFormData((current) => ({ ...current, payment_method: 'cash' }))}
                className="w-full"
              >
                Dinheiro
              </Button>
              <Button
                type="button"
                variant={formData.payment_method === 'card' ? 'default' : 'outline'}
                onClick={() => setFormData((current) => ({ ...current, payment_method: 'card' }))}
                className="w-full"
              >
                Cartão
              </Button>
              <Button
                type="button"
                variant={formData.payment_method === 'pix' ? 'default' : 'outline'}
                onClick={() => setFormData((current) => ({ ...current, payment_method: 'pix' }))}
                className="w-full"
              >
                PIX
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleFormDataFieldChange('notes')}
              placeholder="Adicione notas adicionais para o pedido"
              rows={4}
            />
          </section>

          <div className="flex justify-between items-center gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-sm text-slate-500">Total do pedido</p>
              <p className="text-2xl font-semibold text-slate-900">R$ {total.toFixed(2)}</p>
            </div>
            <Button type="button" onClick={handleSubmit} disabled={createOrderMutation.isLoading}>
              <CreditCard className="h-4 w-4" /> Confirmar pedido
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Resumo do Carrinho</h2>
            <span className="text-sm text-slate-500">{cart.length} itens</span>
          </div>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.type === 'pizza' ? 'Pizza' : 'Bebida'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{item.quantity}x</p>
                  <p className="text-sm text-slate-500">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <SliceOSFooter />
    </div>
  );
}
