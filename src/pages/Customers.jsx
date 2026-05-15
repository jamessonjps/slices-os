import React, { useState } from 'react';
import { customerService } from '@/services/customerService';
import { orderService } from '@/services/orderService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Search, User, Phone, MapPin, Package, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.listCustomers()
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => orderService.listOrders('-created_date', 100)
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['all-addresses'],
    queryFn: () => customerService.listAddresses()
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Cliente atualizado');
      setEditingCustomer(null);
    }
  });

  const handleSaveNotes = () => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({
        id: editingCustomer.id,
        data: { notes: editingCustomer.notes }
      });
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getCustomerOrders = (customer) => {
    return orders.filter(o => 
      o.customer_id === customer.id || 
      (o.customer_phone && customer.phone && o.customer_phone.replace(/\D/g,'') === customer.phone.replace(/\D/g,''))
    );
  };

  const getCustomerAddresses = (customerId) => {
    return addresses.filter(a => a.customer_id === customerId);
  };

  const getCustomerStats = (customer) => {
    const customerOrders = getCustomerOrders(customer);
    const total = customerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return {
      totalOrders: customerOrders.length,
      totalSpent: total,
      lastOrder: customerOrders[0]?.created_date
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('AdminHome')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
                <p className="text-sm text-slate-500">{customers.length} clientes cadastrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone ou email..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Customers List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map(customer => {
              const stats = getCustomerStats(customer);
              
              return (
                <Card
                  key={customer.id}
                  className="p-4 cursor-pointer hover:border-slate-400 transition-colors"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{customer.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </span>
                            {customer.email && (
                              <span>{customer.email}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {customer.notes && (
                        <p className="text-sm text-slate-600 italic bg-amber-50 p-2 rounded">
                          {customer.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {stats.totalOrders} pedidos
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        R$ {stats.totalSpent.toFixed(2)}
                      </p>
                      {stats.lastOrder && (
                        <p className="text-xs text-slate-500">
                          Ášltimo: {format(new Date(stats.lastOrder), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-xl">{selectedCustomer.name}</h2>
                    <p className="text-sm text-slate-500 font-normal">{selectedCustomer.phone}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Notas e Preferências</Label>
                    {editingCustomer?.id === selectedCustomer.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingCustomer(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={handleSaveNotes}>
                          <Save className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCustomer({ ...selectedCustomer })}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                  {editingCustomer?.id === selectedCustomer.id ? (
                    <Textarea
                      value={editingCustomer.notes || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                      placeholder="Ex: Prefere borda recheada, alérgico a..."
                      className="h-20"
                    />
                  ) : (
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                      {selectedCustomer.notes || 'Nenhuma nota registrada'}
                    </p>
                  )}
                </div>

                {/* Addresses */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereços
                  </h3>
                  {getCustomerAddresses(selectedCustomer.id).length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum endereço cadastrado</p>
                  ) : (
                    <div className="space-y-2">
                      {getCustomerAddresses(selectedCustomer.id).map(addr => (
                        <Card key={addr.id} className="p-3 bg-slate-50">
                          <p className="text-sm text-slate-900">
                            {addr.street}, {addr.number}
                            {addr.complement && ` - ${addr.complement}`}
                          </p>
                          <p className="text-sm text-slate-600">
                            {addr.district}
                            {addr.city && ` â€¢ ${addr.city}`}
                          </p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders History */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Histórico de Pedidos ({getCustomerOrders(selectedCustomer).length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getCustomerOrders(selectedCustomer).map(order => (
                      <Link
                        key={order.id}
                        to={createPageUrl('OrderDetail') + `?id=${order.id}`}
                        onClick={() => setSelectedCustomer(null)}
                      >
                        <Card className="p-3 hover:border-slate-400 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                Pedido #{order.id.slice(0, 8)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(order.created_date), "dd/MM/yyyy 'Á s' HH:mm", { locale: ptBR })}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {order.pizzas?.length || 0} pizza(s) â€¢ {order.drinks?.reduce((sum, d) => sum + d.quantity, 0) || 0} bebida(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">
                                R$ {order.total_amount?.toFixed(2)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
