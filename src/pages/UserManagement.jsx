import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, UserPlus, Pencil, Trash2, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { useAuth } from '@/lib/AuthContext';

const emptyForm = {
  full_name: '',
  email: '',
  role: 'staff',
  status: 'active'
};

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => userService.createUser(data),
    onSuccess: () => { 
      queryClient.invalidateQueries(['users']); 
      toast.success('Usuário cadastrado!'); 
      closeForm(); 
    },
    onError: (err) => {
      console.error("Erro no cadastro:", err);
      toast.error(`Erro: ${err.message || 'Falha ao cadastrar'}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries(['users']); 
      toast.success('Atualizado!'); 
      closeForm(); 
    },
    onError: () => toast.error('Erro ao atualizar.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => { 
      queryClient.invalidateQueries(['users']); 
      toast.success('Removido!'); 
    },
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (u) => { setEditing(u); setForm({ full_name: u.full_name, email: u.email, role: u.role, status: u.status || 'active' }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) return toast.error('Nome e email são obrigatórios');

    if (!editing) {
      createMutation.mutate(form);
    } else {
      updateMutation.mutate({ id: editing.id, data: form });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Remover este usuário?')) deleteMutation.mutate(id);
  };

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const isAdmin = authUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <p className="text-2xl font-semibold text-slate-900 mb-3">Acesso restrito</p>
          <p className="text-slate-600 mb-6">Você não tem permissão para acessar esta área administrativa.</p>
          <Link to={createPageUrl('AdminHome')}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Voltar para o painel</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('AdminHome')}>
              <Button variant="ghost" className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gestão de Usuários</h1>
              <p className="text-xs text-slate-500">Administração de perfis</p>
            </div>
          </div>
          <Button onClick={openNew} className="bg-slate-900 hover:bg-slate-800">
            <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Carregando...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum usuário cadastrado</p>
          </div>
        ) : (
          users.map(u => (
            <Card key={u.id} className="p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-600 text-lg border border-slate-200">
                      {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    {new Date(u.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{u.full_name}</p>
                      <Badge className={
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                        u.role === 'delivery' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }>
                        {u.role === 'admin' ? 'Administrador' : u.role === 'delivery' ? 'Entregador' : 'Equipe (Staff)'}
                      </Badge>
                      {u.status === 'pending' && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">Aguardando Aprovação</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{u.email}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Desde {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => openEdit(u)}>
                    <Pencil className="w-3 h-3 mr-1.5" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="w-3 h-3 mr-1.5" /> Remover
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Perfil' : 'Cadastrar Perfil'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome Completo *</Label>
              <Input value={form.full_name} onChange={f('full_name')} placeholder="João da Silva" />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={f('email')} placeholder="joao@email.com" />
            </div>
            <div className="space-y-1">
              <Label>Papel no Sistema</Label>
              <select
                value={form.role}
                onChange={f('role')}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="staff">Funcionário (Staff)</option>
                <option value="delivery">Entregador (Delivery)</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status da Conta</Label>
              <select
                value={form.status}
                onChange={f('status')}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="active">Ativo / Aprovado</option>
                <option value="pending">Pendente de Aprovação</option>
                <option value="blocked">Bloqueado / Inativo</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-slate-900" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Salvar Alterações' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
