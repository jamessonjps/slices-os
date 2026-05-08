import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, LogOut, ChefHat, DollarSign, Clock, CheckCircle, Truck, Package, ArrowLeft } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ChefHat },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  delivering: { label: 'Saiu p/ entrega', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  completed: { label: 'Concluído', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: Package }
};

export default function Orders() {
  const [user, setUser] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 100)
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin(createPageUrl('Orders'));
    });
  }, []);

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.created_date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayTotal = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingCount = orders.filter(o => ['pending', 'preparing', 'ready', 'delivering'].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('AdminHome')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Pizza Millano Pizzaria</h1>
                <p className="text-sm text-slate-500">{user?.full_name || user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Hoje</p>
                <p className="text-lg font-bold text-slate-900">R$ {todayTotal.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ativos</p>
                <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Carregando...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum pedido ainda</p>
            </div>
          ) : (
            orders.map(order => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const Icon = config.icon;
              
              return (
                <Link key={order.id} to={createPageUrl('OrderDetail') + `?id=${order.id}`}>
                  <Card className="p-4 bg-white border-slate-200 hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{order.customer_name}</h3>
                          {order.delivery_type === 'delivery' && (
                            <Truck className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{order.customer_phone}</p>
                      </div>
                      <Badge className={`${config.color} border flex items-center gap-1`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {format(new Date(order.created_date), "HH:mm", { locale: ptBR })}
                      </span>
                      <span className="font-bold text-slate-900">R$ {order.total_amount?.toFixed(2)}</span>
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* SliceOS Footer */}
      <div className="pb-24 px-4">
        <SliceOSFooter />
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
        <Link to={createPageUrl('NewOrder')}>
          <Button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg shadow-lg">
            <Plus className="w-6 h-6 mr-2" />
            Novo Pedido
          </Button>
        </Link>
      </div>
    </div>
  );
}