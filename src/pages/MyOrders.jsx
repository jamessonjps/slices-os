import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { safeLocalStorage } from '@/utils/storage';
import { ArrowLeft, Package, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { orderService } from '@/services/orderService';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800' },
  delivering: { label: 'Em Entrega', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Concluído', color: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

export default function MyOrders() {
  const [phone, setPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  useEffect(() => {
    const savedPhone = safeLocalStorage.get('customer_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setSearchPhone(savedPhone);
    }
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', searchPhone],
    queryFn: () => orderService.listOrdersByPhone(searchPhone),
    enabled: !!searchPhone
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!phone) return;
    safeLocalStorage.set('customer_phone', phone);
    setSearchPhone(phone);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Meus Pedidos</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Histórico completo</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {!searchPhone && (
          <Card className="p-8 text-center border-0 shadow-sm">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Acompanhe seus pedidos</h2>
            <p className="text-slate-500 text-sm mb-6">Insira o nÁºmero do seu celular para ver o histórico e status atual.</p>
            <form onSubmit={handleSearch} className="space-y-4 max-w-xs mx-auto">
              <div className="text-left">
                <Label className="text-xs uppercase text-slate-400 font-bold ml-1">Celular / WhatsApp</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-12 text-lg text-center"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-slate-900 text-white font-bold">
                Ver Meus Pedidos
              </Button>
            </form>
          </Card>
        )}

        {searchPhone && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Pedidos de</p>
                  <p className="font-bold text-slate-900">{searchPhone}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 font-bold hover:bg-blue-50"
                onClick={() => {
                  setSearchPhone('');
                  setPhone('');
                  safeLocalStorage.remove('customer_phone');
                }}
              >
                Trocar nÁºmero
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 text-sm">Buscando seus pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum pedido ainda</h3>
                <p className="text-slate-500 text-sm mb-6">Você ainda não realizou pedidos com este nÁºmero.</p>
                <Link to={createPageUrl('Home')}>
                  <Button className="bg-slate-900 h-12 px-8">
                    Pedir uma Pizza Agora
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const items = order.items || [];
                  const pizzaCount = items.filter(i => i.type === 'pizza').length;
                  const drinkCount = items.filter(i => i.type === 'drink').reduce((sum, d) => sum + (d.quantity || 1), 0);

                  return (
                    <Link key={order.id} to={createPageUrl('TrackOrder') + `?id=${order.id}`}>
                      <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${config.color} border-0 shadow-none text-[10px] px-2 py-0.5`}>
                                {config.label.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                #{order.id.slice(0, 8)}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">
                              {pizzaCount > 0 ? `${pizzaCount} Pizza${pizzaCount > 1 ? 's' : ''}` : ''}
                              {pizzaCount > 0 && drinkCount > 0 ? ' & ' : ''}
                              {drinkCount > 0 ? `${drinkCount} Bebida${drinkCount > 1 ? 's' : ''}` : ''}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {format(new Date(order.created_date), "eeee, d 'de' MMMM 'Á s' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-900">R$ {order.total_amount?.toFixed(2)}</p>
                            <div className="flex items-center justify-end gap-1 text-blue-600 font-bold text-[10px] mt-2 group-hover:translate-x-1 transition-transform">
                              DETALHES <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-12">
          <SliceOSFooter />
        </div>
      </div>
    </div>
  );
}
