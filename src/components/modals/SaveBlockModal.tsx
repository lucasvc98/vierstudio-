import React, { useState } from 'react';
import { X, BookmarkPlus, Check } from 'lucide-react';
import { EmailBlock, EmailRow, SavedBlockItem } from '../../types/email';

interface SaveBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: EmailBlock | EmailRow | null;
  isRow: boolean;
  onSaved: (block: SavedBlockItem) => void;
}

export const SaveBlockModal: React.FC<SaveBlockModalProps> = ({
  isOpen,
  onClose,
  target,
  isRow,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SavedBlockItem['category']>('custom');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !target) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const newSavedItem: SavedBlockItem = {
      id: `saved-${Date.now()}`,
      name: name.trim(),
      category,
      icon: isRow ? 'layout' : 'box',
      isRow,
      block: JSON.parse(JSON.stringify(target))
    };

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSavedItem)
      });
      const data = await res.json();
      if (data.success) {
        onSaved(data.block);
        onClose();
        setName('');
      }
    } catch (err) {
      console.error('Failed to save reusable block', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Salvar como Bloco Reutilizável</h2>
              <p className="text-xs text-slate-500">Salve para usar novamente em outros e-mails</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Bloco</label>
            <input 
              type="text"
              placeholder="Ex: Meu Cabeçalho Padrão, Banner Promo..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="header">Cabeçalhos (Headers)</option>
              <option value="hero">Banners Hero & Destaques</option>
              <option value="cta">Chamadas de Ação (CTAs) & Cupons</option>
              <option value="product">Produtos & Vitrines</option>
              <option value="footer">Rodapés & Assinaturas</option>
              <option value="custom">Personalizados</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors shadow-xs"
            >
              {isSaving ? 'Salvando...' : 'Salvar Bloco'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
