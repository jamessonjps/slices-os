import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Package, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Stock() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('name')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast.success('Produto adicionado');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast.success('Produto atualizado');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produto removido');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      category: formData.get('category'),
      quantity: parseFloat(formData.get('quantity')),
      unit: formData.get('unit'),
      min_quantity: parseFloat(formData.get('min_quantity')) || 0,
      price: parseFloat(formData.get('price')) || 0
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const lowStockProducts = products.filter(p => p.quantity <= (p.min_quantity || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('AdminHome')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
                <p className="text-sm text-slate-500">{products.length} produtos</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => setEditingProduct(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input name="name" defaultValue={editingProduct?.name} required />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select name="category" defaultValue={editingProduct?.category || 'ingrediente'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ingrediente">Ingrediente</SelectItem>
                        <SelectItem value="bebida">Bebida</SelectItem>
                        <SelectItem value="embalagem">Embalagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantidade</Label>
                      <Input name="quantity" type="number" step="0.01" defaultValue={editingProduct?.quantity} required />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <Select name="unit" defaultValue={editingProduct?.unit || 'kg'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="unidade">unidade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Estoque Mínimo</Label>
                      <Input name="min_quantity" type="number" step="0.01" defaultValue={editingProduct?.min_quantity} />
                    </div>
                    <div>
                      <Label>Preço Unitário</Label>
                      <Input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
                    {editingProduct ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Estoque Baixo</h3>
            </div>
            <p className="text-sm text-red-700">
              {lowStockProducts.length} produto(s) com estoque abaixo do mínimo
            </p>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum produto cadastrado</p>
            </div>
          ) : (
            products.map(product => {
              const isLowStock = product.quantity <= (product.min_quantity || 0);
              
              return (
                <Card key={product.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{product.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        {isLowStock && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Baixo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {product.quantity} {product.unit}
                        {product.min_quantity > 0 && (
                          <span className="text-slate-400"> (mín: {product.min_quantity})</span>
                        )}
                      </p>
                      {product.price > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          R$ {product.price.toFixed(2)} / {product.unit}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Remover este produto?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}