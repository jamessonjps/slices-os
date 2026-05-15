import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Plus, Edit2, Trash2, Pizza, Coffee, IceCream,
  Check, X, ChevronDown, ChevronRight, Search, Eye, EyeOff, Slice
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { menuService } from '@/services/menuService';

// ─── Categorias Padr\u00e3o ──────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { value: 'pizza_tradicional', label: 'Pizzas Tradicionais', icon: 'Pizza', type: 'pizza' },
  { value: 'pizza_especial', label: 'Pizzas Especiais', icon: 'Pizza', type: 'pizza' },
  { value: 'pizza_doce', label: 'Pizzas Doces', icon: 'Pizza', type: 'pizza' },
  { value: 'pizza_6_fatias', label: 'Pizzas 6 Fatias', icon: 'Slice', type: 'pizza' },
  { value: 'bebida', label: 'Bebidas', icon: 'Coffee', type: 'drink' },
  { value: 'sobremesa', label: 'Sobremesas', icon: 'IceCream', type: 'dessert' },
];

const ICON_MAP = { Pizza, Coffee, IceCream, Slice };
const getIcon = (name) => ICON_MAP[name] || Pizza;

const loadCategories = () => {
  try {
    const saved = localStorage.getItem('sliceos_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
};

const PIZZA_CATEGORIES = ['pizza_tradicional', 'pizza_especial', 'pizza_doce', 'pizza_6_fatias'];

// ─── Schema Zod ───────────────────────────────────────────────
const menuItemSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional().default(''),
  category: z.string().min(1, 'Selecione uma categoria'),
  type: z.string().min(1, 'Selecione um tipo'),
  available: z.boolean().default(true),
  allow_half_half: z.boolean().default(false),
  prep_time: z.coerce.number().min(1).max(120).default(30),
  price: z.coerce.number().min(0).nullable().optional(),
  price_small: z.coerce.number().min(0).nullable().optional(),
  price_medium: z.coerce.number().min(0).nullable().optional(),
  price_large: z.coerce.number().min(0).nullable().optional(),
});

// ─── Componente Principal ─────────────────────────────────────
export default function MenuManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categories, setCategories] = useState(loadCategories);
  const [showCatDialog, setShowCatDialog] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ label: '', type: 'pizza', icon: 'Pizza' });
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => menuService.listMenuItems()
  });

  // ─── Muta\u00e7\u00f5es ────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data) => menuService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item criado com sucesso!');
      closeDialog();
    },
    onError: (err) => toast.error('Erro ao criar: ' + err.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item atualizado!');
      closeDialog();
    },
    onError: (err) => toast.error('Erro ao atualizar: ' + err.message)
  });

  const toggleAvailMutation = useMutation({
    mutationFn: ({ id, current }) => menuService.toggleAvailability(id, current),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
    },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const toggleHalfMutation = useMutation({
    mutationFn: ({ id, current }) => menuService.toggleHalfHalf(id, current),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
    },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => menuService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item removido do card\u00E1pio');
    },
    onError: (err) => toast.error('Erro ao remover: ' + err.message)
  });

  // ─── Agrupamento e Filtro ────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const cat = item.category || 'sem_categoria';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  // Expandir todas as categorias por padr\u00e3o
  useEffect(() => {
    if (items.length > 0 && Object.keys(expandedCategories).length === 0) {
      const initial = {};
      categories.forEach(c => { initial[c.value] = true; });
      setExpandedCategories(initial);
    }
  }, [items]);

  const toggleCategory = (catValue) => {
    setExpandedCategories(prev => ({ ...prev, [catValue]: !prev[catValue] }));
  };

  // ─── Dialog helpers ──────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingItem(null);
    setShowDialog(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
  };

  // ─── Contadores ──────────────────────────────────────────────
  const totalAtivos = items.filter(i => i.available).length;
  const totalInativos = items.filter(i => !i.available).length;

  // ─── Gest\u00e3o de Categorias ──────────────────────────────────────
  const saveCategories = (newCats) => {
    setCategories(newCats);
    localStorage.setItem('sliceos_categories', JSON.stringify(newCats));
  };

  const openCatCreate = () => {
    setEditingCat(null);
    setCatForm({ label: '', type: 'pizza', icon: 'Pizza' });
    setShowCatDialog(true);
  };

  const openCatEdit = (cat) => {
    setEditingCat(cat);
    setCatForm({ label: cat.label, type: cat.type, icon: cat.icon });
    setShowCatDialog(true);
  };

  const handleSaveCat = () => {
    if (!catForm.label.trim()) return toast.error('Nome da categoria obrigat\u00f3rio');
    if (editingCat) {
      const updated = categories.map(c =>
        c.value === editingCat.value ? { ...c, label: catForm.label, type: catForm.type, icon: catForm.icon } : c
      );
      saveCategories(updated);
      toast.success('Categoria atualizada!');
    } else {
      const value = catForm.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      if (categories.some(c => c.value === value)) return toast.error('Categoria j\u00e1 existe');
      saveCategories([...categories, { value, label: catForm.label, type: catForm.type, icon: catForm.icon }]);
      toast.success('Categoria criada!');
    }
    setShowCatDialog(false);
  };

  const handleDeleteCat = (catValue) => {
    const hasItems = items.some(i => i.category === catValue);
    if (hasItems) return toast.error('Remova os itens desta categoria antes de exclu\u00ed-la');
    if (!confirm('Excluir esta categoria?')) return;
    saveCategories(categories.filter(c => c.value !== catValue));
    toast.success('Categoria removida');
  };

  const resetCategories = () => {
    if (confirm('Restaurar categorias padr\u00e3o? Categorias personalizadas ser\u00e3o removidas.')) {
      saveCategories(DEFAULT_CATEGORIES);
      toast.success('Categorias restauradas');
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('AdminHome')}>
                <Button variant="ghost" className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-4">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Gerenciar Cardápio</h1>
                <p className="text-xs text-slate-500">
                  {items.length} itens • {totalAtivos} ativos • {totalInativos} inativos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={openCatCreate} className="text-slate-600 border-slate-300">
                <Plus className="w-4 h-4 mr-1" /> Categoria
              </Button>
              <Button onClick={openCreateDialog} className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Novo Item
              </Button>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Carregando cardápio...</div>
        ) : (
          categories.map(cat => {
            const catItems = groupedItems[cat.value] || [];
            const isExpanded = expandedCategories[cat.value];
            const Icon = getIcon(cat.icon);
            const activeCount = catItems.filter(i => i.available).length;

            return (
              <div key={cat.value} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                  <button
                    onClick={() => toggleCategory(cat.value)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">{cat.label}</h2>
                      <p className="text-xs text-slate-500">
                        {catItems.length} itens {'\u2022'} {activeCount} ativos
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600" onClick={() => openCatEdit(cat)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-500" onClick={() => handleDeleteCat(cat.value)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    {isExpanded
                      ? <ChevronDown className="w-5 h-5 text-slate-400 ml-1" />
                      : <ChevronRight className="w-5 h-5 text-slate-400 ml-1" />
                    }
                  </div>
                </div>

                {/* Items Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {catItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-slate-400 italic">Nenhum item nesta categoria</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                              <th className="text-left px-5 py-3 font-semibold">Nome</th>
                              <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Descrição</th>
                              <th className="text-right px-3 py-3 font-semibold">Preço(s)</th>
                              <th className="text-center px-3 py-3 font-semibold">Status</th>
                              {cat.type === 'pizza' && (
                                <th className="text-center px-3 py-3 font-semibold">Meio a Meio</th>
                              )}
                              <th className="text-center px-3 py-3 font-semibold">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {catItems.map(item => (
                              <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${!item.available ? 'opacity-50' : ''}`}>
                                {/* Nome */}
                                <td className="px-5 py-3">
                                  <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                </td>

                                {/* Descrição */}
                                <td className="px-3 py-3 hidden md:table-cell">
                                  <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">
                                    {item.description || '—'}
                                  </p>
                                </td>

                                {/* Preços */}
                                <td className="px-3 py-3 text-right">
                                  {item.type === 'pizza' ? (
                                    <div className="space-y-0.5">
                                      {item.price_small != null && (
                                        <p className="text-[11px] text-slate-500">P: R$ {item.price_small?.toFixed(2)}</p>
                                      )}
                                      {item.price_medium != null && (
                                        <p className="text-sm font-bold text-slate-900">M: R$ {item.price_medium?.toFixed(2)}</p>
                                      )}
                                      {item.price_large != null && (
                                        <p className="text-[11px] text-slate-500">G: R$ {item.price_large?.toFixed(2)}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm font-bold text-slate-900">R$ {item.price?.toFixed(2)}</p>
                                  )}
                                </td>

                                {/* Disponível */}
                                <td className="px-3 py-3 text-center">
                                  <button
                                    onClick={() => toggleAvailMutation.mutate({ id: item.id, current: item.available })}
                                    className="inline-flex items-center"
                                  >
                                    {item.available ? (
                                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer text-[10px] gap-1">
                                        <Eye className="w-3 h-3" /> Ativo
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer text-[10px] gap-1">
                                        <EyeOff className="w-3 h-3" /> Oculto
                                      </Badge>
                                    )}
                                  </button>
                                </td>

                                {/* Meio a Meio */}
                                {cat.type === 'pizza' && (
                                  <td className="px-3 py-3 text-center">
                                    <Switch
                                      checked={item.allow_half_half || false}
                                      onCheckedChange={() => toggleHalfMutation.mutate({ id: item.id, current: item.allow_half_half })}
                                      className="data-[state=checked]:bg-emerald-600"
                                    />
                                  </td>
                                )}

                                {/* Ações */}
                                <td className="px-3 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                                      onClick={() => openEditDialog(item)}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                      onClick={() => {
                                        if (confirm('Remover este item do cardápio? (Ele será marcado como inativo)')) {
                                          deleteMutation.mutate(item.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Dialog Categorias */}
      <Dialog open={showCatDialog} onOpenChange={setShowCatDialog}>
        <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-200">Nome da Categoria</Label>
              <Input
                value={catForm.label}
                onChange={(e) => setCatForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Ex: Pizzas Premium"
                className="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-200">Tipo de Produto</Label>
              <Select value={catForm.type} onValueChange={(v) => setCatForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pizza">Pizza</SelectItem>
                  <SelectItem value="drink">Bebida</SelectItem>
                  <SelectItem value="dessert">Sobremesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-200">{'\u00CDcone'}</Label>
              <div className="flex gap-2">
                {Object.entries(ICON_MAP).map(([name, IconComp]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCatForm(f => ({ ...f, icon: name }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                      catForm.icon === name 
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' 
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveCat} className="flex-1 bg-slate-900 hover:bg-slate-800">
                {editingCat ? 'Salvar' : 'Criar Categoria'}
              </Button>
              {!editingCat && (
                <Button variant="outline" onClick={resetCategories} className="text-xs text-slate-500">
                  Restaurar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Criar/Editar */}
      <MenuItemDialog
        open={showDialog}
        onClose={closeDialog}
        editingItem={editingItem}
        categories={categories}
        onSubmit={(data) => {
          if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

// ─── Modal Formulário ──────────────────────────────────────────
function MenuItemDialog({ open, onClose, editingItem, onSubmit, isLoading, categories }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'pizza_tradicional',
      type: 'pizza',
      available: true,
      allow_half_half: false,
      prep_time: 30,
      price: null,
      price_small: null,
      price_medium: null,
      price_large: null,
    }
  });

  const watchCategory = watch('category');
  const watchType = watch('type');
  const isPizza = watchType === 'pizza';

  // Sync type quando a categoria muda
  useEffect(() => {
    const catInfo = categories.find(c => c.value === watchCategory);
    if (catInfo) {
      setValue('type', catInfo.type);
      // Auto-ligar allow_half_half para tradicionais e especiais
      if (['pizza_tradicional', 'pizza_especial'].includes(watchCategory)) {
        setValue('allow_half_half', editingItem?.allow_half_half ?? true);
      } else {
        setValue('allow_half_half', false);
      }
    }
  }, [watchCategory, setValue]);

  // Carregar dados ao editar
  useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          name: editingItem.name || '',
          description: editingItem.description || '',
          category: editingItem.category || 'pizza_tradicional',
          type: editingItem.type || 'pizza',
          available: editingItem.available ?? true,
          allow_half_half: editingItem.allow_half_half ?? false,
          prep_time: editingItem.prep_time || 30,
          price: editingItem.price ?? null,
          price_small: editingItem.price_small ?? null,
          price_medium: editingItem.price_medium ?? null,
          price_large: editingItem.price_large ?? null,
        });
      } else {
        reset({
          name: '',
          description: '',
          category: 'pizza_tradicional',
          type: 'pizza',
          available: true,
          allow_half_half: true,
          prep_time: 30,
          price: null,
          price_small: null,
          price_medium: null,
          price_large: null,
        });
      }
    }
  }, [open, editingItem, reset]);

  const onFormSubmit = (data) => {
    // Limpar campos de pre\u00e7o irrelevantes
    if (data.type === 'pizza') {
      data.price = null;
    } else {
      data.price_small = null;
      data.price_medium = null;
      data.price_large = null;
      data.allow_half_half = false;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900 dark:text-white">
            {editingItem ? 'Editar Item' : 'Novo Item do Cardápio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 pt-2">
          {/* Nome e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-200">Nome do Item *</Label>
              <Input {...register('name')} placeholder="Ex: Calabresa" className="dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-200">Categoria *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-200">Descrição / Ingredientes</Label>
            <Textarea
              {...register('description')}
              placeholder="Ex: Molho de tomate, mussarela, calabresa, cebola, orégano e azeitona."
              rows={2}
              className="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Preços Dinâmicos */}
          {isPizza ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Preços por Tamanho</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase text-amber-600 dark:text-amber-400">P (6 fatias)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('price_small', { setValueAs: v => v === '' ? null : parseFloat(v) })}
                    placeholder="0.00"
                    className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase text-amber-600 dark:text-amber-400">M (8 fatias)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('price_medium', { setValueAs: v => v === '' ? null : parseFloat(v) })}
                    placeholder="0.00"
                    className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase text-amber-600 dark:text-amber-400">G (12 fatias)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('price_large', { setValueAs: v => v === '' ? null : parseFloat(v) })}
                    placeholder="0.00"
                    className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">Preço Unitário</p>
              <Input
                type="number"
                step="0.01"
                {...register('price', { setValueAs: v => v === '' ? null : parseFloat(v) })}
                placeholder="0.00"
                className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white max-w-[200px]"
              />
            </div>
          )}

          {/* Tempo de Preparo */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 dark:text-slate-200">Tempo de Preparo (min)</Label>
            <Input
              type="number"
              {...register('prep_time')}
              className="max-w-[120px] dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Toggles */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Configurações</p>

            {/* Disponibilidade */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Disponível no Cardápio</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Se desligado, o item não aparece para o cliente</p>
              </div>
              <Controller
                name="available"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                )}
              />
            </div>

            {/* Meio a Meio - só para pizzas */}
            {isPizza && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Permite Meio a Meio</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Se ligado, aparece como opção de segundo sabor</p>
                </div>
                <Controller
                  name="allow_half_half"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* Botão Submit */}
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Criar Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
