import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Edit2, Trash2, Pizza, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const categories = [
  { value: 'pizza_tradicional', label: 'Pizzas Tradicionais' },
  { value: 'pizza_especial', label: 'Pizzas Especiais' },
  { value: 'pizza_doce', label: 'Pizzas Doces' },
  { value: 'bebida', label: 'Bebidas' },
  { value: 'sobremesa', label: 'Sobremesas' }
];

export default function MenuManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => base44.entities.MenuItem.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MenuItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item criado');
      setShowDialog(false);
      setEditingItem(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MenuItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item atualizado');
      setShowDialog(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item removido');
    }
  });

  const toggleAvailability = (item) => {
    updateMutation.mutate({
      id: item.id,
      data: { available: !item.available }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      category: formData.get('category'),
      type: formData.get('type'),
      description: formData.get('description'),
      available: editingItem?.available ?? true,
      prep_time: parseInt(formData.get('prep_time')) || 30
    };

    if (data.type === 'pizza') {
      data.price_small = parseFloat(formData.get('price_small'));
      data.price_medium = parseFloat(formData.get('price_medium'));
      data.price_large = parseFloat(formData.get('price_large'));
    } else {
      data.price = parseFloat(formData.get('price'));
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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
                <h1 className="text-xl font-bold text-slate-900">Gerenciar Cardápio</h1>
                <p className="text-sm text-slate-500">{items.length} itens cadastrados</p>
              </div>
            </div>
            <Button onClick={() => { setEditingItem(null); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {categories.map(cat => (
          <div key={cat.value}>
            <h2 className="text-lg font-bold text-slate-900 mb-3">{cat.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedItems[cat.value]?.map(item => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-slate-600">{item.description}</p>
                      )}
                    </div>
                    <Badge className={item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {item.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-slate-700 mb-3">
                    {item.type === 'pizza' ? (
                      <>
                        <p>6 fatias: R$ {item.price_small?.toFixed(2)}</p>
                        <p>8 fatias: R$ {item.price_medium?.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="font-bold">R$ {item.price?.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => toggleAvailability(item)}
                    >
                      {item.available ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditingItem(item); setShowDialog(true); }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {(!groupedItems[cat.value] || groupedItems[cat.value].length === 0) && (
              <p className="text-sm text-slate-500 italic">Nenhum item nesta categoria</p>
            )}
          </div>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input name="name" defaultValue={editingItem?.name} required />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select name="category" defaultValue={editingItem?.category} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea name="description" defaultValue={editingItem?.description} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select name="type" defaultValue={editingItem?.type} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pizza">Pizza</SelectItem>
                    <SelectItem value="drink">Bebida</SelectItem>
                    <SelectItem value="dessert">Sobremesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tempo de Preparo (min)</Label>
                <Input type="number" name="prep_time" defaultValue={editingItem?.prep_time || 30} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço 6 fatias</Label>
                <Input type="number" step="0.01" name="price_small" defaultValue={editingItem?.price_small} />
              </div>
              <div>
                <Label>Preço 8 fatias</Label>
                <Input type="number" step="0.01" name="price_medium" defaultValue={editingItem?.price_medium} />
              </div>
            </div>

            <div>
              <Label>Preço único (bebidas/sobremesas)</Label>
              <Input type="number" step="0.01" name="price" defaultValue={editingItem?.price} />
            </div>

            <Button type="submit" className="w-full">
              {editingItem ? 'Atualizar' : 'Criar'} Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}