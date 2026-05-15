import React, { useState } from 'react';
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
import { menuService } from '@/services/menuService';

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
  const [formCategory, setFormCategory] = useState('pizza_tradicional');
  const [formType, setFormType] = useState('pizza');
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => menuService.listMenuItems()
  });

  const createMutation = useMutation({
    mutationFn: (data) => menuService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item criado');
      setShowDialog(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item atualizado');
      setShowDialog(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => menuService.deleteMenuItem(id),
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
      category: formCategory,
      type: formType,
      description: formData.get('description'),
      available: editingItem?.available ?? true,
      prep_time: parseInt(formData.get('prep_time')) || 30
    };

    if (data.type === 'pizza') {
      data.price_small = parseFloat(formData.get('price_small'));
      data.price_medium = parseFloat(formData.get('price_medium'));
      data.price_large = parseFloat(formData.get('price_large'));
      data.price = null;
    } else {
      data.price = parseFloat(formData.get('price'));
      data.price_small = null;
      data.price_medium = null;
      data.price_large = null;
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
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('AdminHome')}>
              <Button variant="ghost" className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gerenciar Cardápio</h1>
              <p className="text-xs text-slate-500">{items.length} itens cadastrados</p>
            </div>
          </div>
          <Button onClick={() => {
            setEditingItem(null);
            setFormCategory('pizza_tradicional');
            setFormType('pizza');
            setShowDialog(true);
          }} className="bg-slate-900">
            <Plus className="w-4 h-4 mr-2" /> Novo Item
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {categories.map(cat => (
          <div key={cat.value}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 bg-slate-900 rounded-full" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{cat.label}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedItems[cat.value]?.map(item => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                      )}
                    </div>
                    <Badge className={item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {item.available ? 'Ativo' : 'Esgotado'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 mb-4 bg-slate-50 p-2 rounded">
                    {item.type === 'pizza' ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase opacity-50">Pequena</span>
                          <span>R$ {item.price_small?.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase opacity-50">Média</span>
                          <span>R$ {item.price_medium?.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 flex flex-col">
                        <span className="text-[10px] uppercase opacity-50">Preço</span>
                        <span className="font-bold">R$ {item.price?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toggleAvailability(item)}>
                      {item.available ? 'Pausar' : 'Ativar'}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => {
                      setEditingItem(item);
                      setFormCategory(item.category || 'pizza_tradicional');
                      setFormType(item.type || 'pizza');
                      setShowDialog(true);
                    }}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-400" onClick={() => {
                      if (confirm('Remover este item?')) deleteMutation.mutate(item.id);
                    }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {(!groupedItems[cat.value] || groupedItems[cat.value].length === 0) && (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-400 italic">Nenhum item nesta categoria</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item do Cardápio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nome do Item</Label>
                <Input name="name" defaultValue={editingItem?.name} required />
              </div>
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select value={formCategory} onValueChange={setFormCategory} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Descrição / Ingredientes</Label>
              <Textarea name="description" defaultValue={editingItem?.description} placeholder="Ex: Molho de tomate, mussarela..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={formType} onValueChange={setFormType} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pizza">Pizza</SelectItem>
                    <SelectItem value="drink">Bebida</SelectItem>
                    <SelectItem value="dessert">Sobremesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tempo de Preparo (min)</Label>
                <Input type="number" name="prep_time" defaultValue={editingItem?.prep_time || 30} />
              </div>
            </div>

            {formType === 'pizza' ? (
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase">Pequena (6f)</Label>
                  <Input type="number" step="0.01" name="price_small" defaultValue={editingItem?.price_small} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase">Média (8f)</Label>
                  <Input type="number" step="0.01" name="price_medium" defaultValue={editingItem?.price_medium} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase">Família (12f)</Label>
                  <Input type="number" step="0.01" name="price_large" defaultValue={editingItem?.price_large} />
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="space-y-1">
                  <Label>Preço Unitário</Label>
                  <Input type="number" step="0.01" name="price" defaultValue={editingItem?.price} />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-slate-900 h-12">
              {editingItem ? 'Salvar Alterações' : 'Criar Item'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
