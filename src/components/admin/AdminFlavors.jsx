import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import ImageUploader from '../ui/ImageUploader';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminFlavors() {
  const { flavors, addItem, updateItem, deleteItem } = useMenu();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleAddNew = () => {
    setEditingId('NEW');
    setFormData({
      id: `sabor-${Date.now()}`,
      name: '',
      price: 0,
      description: '',
      image: '',
      category: 'tradicional'
    });
  };

  const handleEdit = (flavor) => {
    setEditingId(flavor.id);
    setFormData({ ...flavor });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.image) {
      alert('Nome e Imagem são obrigatórios!');
      return;
    }

    // Force price to be a number
    const dataToSave = { ...formData, price: Number(formData.price) };

    if (editingId === 'NEW') {
      addItem('flavors', dataToSave);
    } else {
      updateItem('flavors', editingId, dataToSave);
    }
    
    setEditingId(null);
    setFormData(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este sabor? Essa ação não pode ser desfeita.')) {
      deleteItem('flavors', id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Sabores</h2>
          <p className="text-zinc-400 text-sm mt-1">Adicione, edite ou remova sabores do cardápio.</p>
        </div>
        
        {!editingId && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Sabor
          </button>
        )}
      </div>

      {editingId ? (
        <div className="glass-card bg-surface-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            {editingId === 'NEW' ? 'Criar Novo Sabor' : 'Editar Sabor'}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Nome do Sabor</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                  placeholder="Ex: Frango com Catupiry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição / Ingredientes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 min-h-[100px] resize-none"
                  placeholder="Ex: Frango desfiado, catupiry original e azeitonas..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Acréscimo de Valor (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 appearance-none"
                  >
                    <option value="tradicional">Tradicional</option>
                    <option value="especial">Especial</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <ImageUploader
                value={formData.image}
                onChange={(base64) => setFormData({...formData, image: base64})}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/5">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-colors"
            >
              <Save className="w-5 h-5" />
              Salvar Sabor
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flavors.map((flavor) => (
            <div key={flavor.id} className="glass-card bg-surface-900 border border-white/10 rounded-2xl p-5 flex flex-col group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0" />
              
              <div className="relative z-10 flex gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-black/40 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                  {flavor.image ? (
                    <img src={flavor.image} alt={flavor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-600 text-xs">Sem foto</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md">
                      {flavor.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white leading-tight">{flavor.name}</h4>
                  <p className="text-emerald-400 font-bold mt-1">
                    {flavor.price === 0 ? 'Sem acréscimo' : `+ ${formatCurrency(flavor.price)}`}
                  </p>
                </div>
              </div>
              
              <p className="relative z-10 text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                {flavor.description || 'Sem descrição'}
              </p>

              <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleEdit(flavor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(flavor.id)}
                  className="flex items-center justify-center p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
