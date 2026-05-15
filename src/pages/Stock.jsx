import React, { useState } from 'react';
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
import { productService } from '@/services/productService';

export default function Stock() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formCategory, setFormCategory] = useState('ingrediente');
  const [formUnit, setFormUnit] = useState('kg');
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.listProducts()
  });

  const createMutation = useMutation({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsDialogOpen(false);
      toast.success('Produto adicionado');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsDialogOpen(false);
      toast.success('Produto atualizado');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
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
      category: formCategory,
      quantity: parseFloat(formData.get('quantity')),
      unit: formUnit,
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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('AdminHome')}>
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Estoque</h1>
              <p className="text-xs text-slate-500">{products.length} itens cadastrados</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => {
                setEditingProduct(null);
                setFormCategory('ingrediente');
                setFormUnit('kg');
              }}>
                <Plus className="w-4 h-4 mr-2" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nome *</Label>
                  <Input name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingrediente">Ingrediente</SelectItem>
                      <SelectItem value="bebida">Bebida</SelectItem>
                      <SelectItem value="embalagem">Embalagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade *</Label>
                    <Input name="quantity" type="number" step="0.01" defaultValue={editingProduct?.quantity} required />
                  </div>
                  <div>
                    <Label>Unidade</Label>
                    <Select value={formUnit} onValueChange={setFormUnit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Label>Preço Unitário (R$)</Label>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="font-semibold text-red-900 text-sm">Atenção: Estoque Baixo</h3>
            </div>
            <p className="text-xs text-red-700">
              {lowStockProducts.length} itens estão abaixo do nível mínimo de segurança.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum produto em estoque</p>
            </div>
          ) : (
            products.map(product => {
              const isLowStock = product.quantity <= (product.min_quantity || 0);
              return (
                <Card key={product.id} className={`p-4 ${isLowStock ? 'border-red-200 bg-red-50/10' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                        <Badge variant="secondary" className="text-[10px] uppercase">{product.category}</Badge>
                      </div>
                      <p className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                        {product.quantity} <span className="text-sm font-normal">{product.unit}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                        Mínimo: {product.min_quantity} {product.unit} • Custo: R$ {product.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setEditingProduct(product);
                        setFormCategory(product.category || 'ingrediente');
                        setFormUnit(product.unit || 'kg');
                        setIsDialogOpen(true);
                      }}>
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => {
                        if (confirm('Remover este produto?')) deleteMutation.mutate(product.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
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
