import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, UserPlus, Pencil, Trash2, Shield, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  user_email: '',
  phone: '',
  role_title: '',
  address: '',
  notes: '',
  default_password: '',
  system_role: 'user',
};

export default function UserManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') {
        setCurrentUser(u ?? null);
        setAccessDenied(true);
      } else {
        setCurrentUser(u);
      }
    }).catch(() => {
      setCurrentUser(null);
      setAccessDenied(true);
    });
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ['staff-profiles'],
    queryFn: () => base44.entities.StaffProfile.list(),
  });

  const { data: systemUsers = [] } = useQuery({
    queryKey: ['system-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StaffProfile.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['staff-profiles']); toast.success('Usuário cadastrado!'); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StaffProfile.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['staff-profiles']); toast.success('Atualizado!'); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StaffProfile.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['staff-profiles']); toast.success('Removido!'); },
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowPassword(false); setShowForm(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...emptyForm, ...p }); setShowPassword(false); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.user_email) return toast.error('Nome e email são obrigatórios');

    // Se novo, convidar no sistema também
    if (!editing) {
      setInviteLoading(true);
      try {
        await base44.users.inviteUser(form.user_email, form.system_role);
      } catch (err) {
        // ignora se já existir
      }
      setInviteLoading(false);
      createMutation.mutate(form);
    } else {
      updateMutation.mutate({ id: editing.id, data: form });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Remover este usuário do cadastro?')) deleteMutation.mutate(id);
  };

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  if (accessDenied) {
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
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('AdminHome')}>
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gestão de Usuários</h1>
              <p className="text-xs text-slate-500">Área exclusiva para administradores</p>
            </div>
          </div>
          <Button onClick={openNew} className="bg-slate-900 hover:bg-slate-800">
            <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {profiles.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum usuário cadastrado</p>
            <p className="text-sm mt-1">Clique em "Novo Usuário" para começar</p>
          </div>
        )}

        {profiles.map(profile => {
          const sysUser = systemUsers.find(u => u.email === profile.user_email);
          return (
            <Card key={profile.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-semibold text-slate-600">
                    {profile.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{profile.name}</p>
                      <Badge className={profile.system_role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                        {profile.system_role === 'admin' ? 'Admin' : 'Funcionário'}
                      </Badge>
                      {profile.role_title && (
                        <Badge variant="outline" className="text-slate-500">{profile.role_title}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{profile.user_email}</p>
                    {profile.phone && <p className="text-sm text-slate-500">📞 {profile.phone}</p>}
                    {profile.address && <p className="text-xs text-slate-400 mt-1">📍 {profile.address}</p>}
                    {profile.notes && <p className="text-xs text-slate-400 mt-1 italic">"{profile.notes}"</p>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(profile)}>
                    <Pencil className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dialog Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nome Completo *</Label>
                <Input value={form.name} onChange={f('name')} placeholder="João da Silva" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Email *</Label>
                <Input type="email" value={form.user_email} onChange={f('user_email')} placeholder="joao@email.com" disabled={!!editing} />
                {!editing && <p className="text-xs text-slate-400">Um convite será enviado para este email</p>}
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={f('phone')} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-1">
                <Label>Função</Label>
                <Input value={form.role_title} onChange={f('role_title')} placeholder="Cozinheiro, Entregador..." />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={f('address')} placeholder="Rua, número, bairro, cidade" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Observações</Label>
                <Input value={form.notes} onChange={f('notes')} placeholder="Informações adicionais..." />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Senha Padrão</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.default_password}
                    onChange={f('default_password')}
                    placeholder="Defina uma senha inicial"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">Armazenada para referência. O usuário deve alterar após o primeiro acesso.</p>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Papel no Sistema</Label>
                <select
                  value={form.system_role}
                  onChange={f('system_role')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="user">Funcionário (acesso restrito)</option>
                  <option value="admin">Administrador (acesso total)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-slate-900" disabled={createMutation.isPending || updateMutation.isPending || inviteLoading}>
                {editing ? 'Salvar Alterações' : 'Cadastrar e Convidar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}