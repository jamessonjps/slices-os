import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Package, Clock, CheckCircle } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setSearchPhone(savedPhone);
    }
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', searchPhone],
    queryFn: async () => {
      if (!searchPhone) return [];
      const allOrders = await base44.entities.Order.list('-created_date', 100);
      return allOrders.filter(o => o.customer_phone === searchPhone);
    },
    enabled: !!searchPhone
  });

  const handleSearch = (e) => {
    e.preventDefault();
    localStorage.setItem('customer_phone', phone);
    setSearchPhone(phone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Menu')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Meus Pedidos</h1>
              <p className="text-sm text-slate-500">Histórico de pedidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Search */}
        {!searchPhone && (
          <Card className="p-4 mb-6">
            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <Label>Digite seu telefone para ver seus pedidos</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Buscar Pedidos
              </Button>
            </form>
          </Card>
        )}

        {/* Orders List */}
        {searchPhone && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                Mostrando pedidos de {searchPhone}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchPhone('');
                  setPhone('');
                  localStorage.removeItem('customer_phone');
                }}
              >
                Alterar
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Carregando...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Nenhum pedido encontrado</p>
                <Link to={createPageUrl('Menu')}>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Fazer Primeiro Pedido
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  
                  return (
                    <Link key={order.id} to={createPageUrl('TrackOrder') + `?id=${order.id}`}>
                      <Card className="p-4 hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">
                                Pedido #{order.id.slice(0, 8)}
                              </h3>
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500">
                              {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <span className="font-bold text-slate-900">
                            R$ {order.total_amount?.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-600">
                          {order.pizzas?.length > 0 && (
                            <p>{order.pizzas.length} pizza(s)</p>
                          )}
                          {order.drinks?.length > 0 && (
                            <p>{order.drinks.reduce((sum, d) => sum + d.quantity, 0)} bebida(s)</p>
                          )}
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
        <SliceOSFooter />
      </div>
    </div>
  );
}