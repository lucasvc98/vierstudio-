import React, { useState, useEffect } from 'react';
import { X, Upload, Folder, Search, Image as ImageIcon, Trash2, Check, FolderPlus, Grid, List } from 'lucide-react';
import { MediaAsset } from '../../types/email';
import { compressImageFile } from '../../utils/imageOptimizer';
import { INITIAL_MEDIA_ASSETS } from '../../data/initialMedia';

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, alt?: string) => void;
}

export const FileManagerModal: React.FC<FileManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage
}) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<string[]>(['Todos', 'Geral', 'Banners', 'Produtos', 'Logos', 'Equipe']);
  const [selectedFolder, setSelectedFolder] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getStoredCustomAssets = (): MediaAsset[] => {
    try {
      const raw = localStorage.getItem('vierstudio_custom_media');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveStoredCustomAssets = (item: MediaAsset) => {
    try {
      const current = getStoredCustomAssets().filter(a => a.id !== item.id);
      localStorage.setItem('vierstudio_custom_media', JSON.stringify([item, ...current].slice(0, 30)));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const fetchAssets = async () => {
    const custom = getStoredCustomAssets();
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.assets) && data.assets.length > 0) {
          const mergedMap = new Map<string, MediaAsset>();
          custom.forEach(a => mergedMap.set(a.id, a));
          data.assets.forEach((a: MediaAsset) => mergedMap.set(a.id, a));
          INITIAL_MEDIA_ASSETS.forEach(a => {
            if (!mergedMap.has(a.id)) mergedMap.set(a.id, a);
          });
          const mergedList = Array.from(mergedMap.values());
          setAssets(mergedList);
          if (data.folders) {
            setFolders(['Todos', ...data.folders]);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch server media, using local fallback', err);
    }

    // Fallback: merge INITIAL_MEDIA_ASSETS with custom uploaded assets
    const mergedMap = new Map<string, MediaAsset>();
    custom.forEach(a => mergedMap.set(a.id, a));
    INITIAL_MEDIA_ASSETS.forEach(a => {
      if (!mergedMap.has(a.id)) mergedMap.set(a.id, a);
    });
    setAssets(Array.from(mergedMap.values()));
  };

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    try {
      // Otimização e compressão inteligente: reduz de vários MBs para ~150KB (1200px máx)
      const optimized = await compressImageFile(file, 1200, 0.85);

      const newAsset: MediaAsset = {
        id: `media-${Date.now()}`,
        name: file.name,
        folder: selectedFolder === 'Todos' ? 'Banners' : selectedFolder,
        url: optimized.dataUrl,
        sizeBytes: optimized.sizeBytes,
        mimeType: file.type || 'image/jpeg',
        altText: file.name.replace(/\.[^/.]+$/, ''),
        width: optimized.width,
        height: optimized.height,
        createdAt: new Date().toISOString()
      };

      // 1. Atualiza imediatamente na tela e no localStorage
      setAssets(prev => [newAsset, ...prev]);
      setSelectedAsset(newAsset);
      saveStoredCustomAssets(newAsset);

      // 2. Tenta persistir no servidor em segundo plano
      try {
        await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAsset)
        });
      } catch (err) {
        console.warn('Server sync background notice:', err);
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Não foi possível processar a imagem. Tente outro arquivo.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch('/api/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: newFolderName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFolders(['Todos', ...data.folders]);
        setSelectedFolder(newFolderName.trim());
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente remover esta imagem?')) return;
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAsset?.id === id) setSelectedAsset(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAssets = assets.filter(item => {
    const matchesFolder = selectedFolder === 'Todos' || item.folder === selectedFolder;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gerenciador de Imagens & Arquivos</h2>
              <p className="text-xs text-slate-500">Faça upload ou escolha imagens para seu template de e-mail</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Enviando...' : 'Fazer Upload'}</span>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp, image/gif" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>

            <button
              onClick={() => setIsCreatingFolder(!isCreatingFolder)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-slate-500" />
              <span>Nova Pasta</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar arquivos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Folder Creator Input (Collapsible) */}
        {isCreatingFolder && (
          <div className="px-6 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-600" />
            <input 
              type="text"
              placeholder="Nome da nova pasta..."
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            />
            <button 
              onClick={handleCreateFolder}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
            >
              Criar
            </button>
            <button 
              onClick={() => setIsCreatingFolder(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Folders Column */}
          <div className="w-52 border-r border-slate-200 p-3 bg-slate-50/50 flex flex-col gap-1 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">Pastas</div>
            {folders.map(f => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  selectedFolder === f 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className={`w-3.5 h-3.5 ${selectedFolder === f ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{f}</span>
                </div>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/50">
                  {f === 'Todos' ? assets.length : assets.filter(a => a.folder === f).length}
                </span>
              </button>
            ))}
          </div>

          {/* Files Gallery */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <ImageIcon className="w-12 h-12 stroke-[1.5] text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Nenhum arquivo encontrado nesta pasta</p>
                <p className="text-xs text-slate-400 mt-1">Faça upload de uma imagem PNG, JPG ou WebP</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAssets.map(asset => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      onDoubleClick={() => {
                        onSelectImage(asset.url, asset.altText || asset.name);
                        onClose();
                      }}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white'
                      }`}
                    >
                      <div className="aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center relative">
                        <img 
                          src={asset.url} 
                          alt={asset.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                        <button
                          onClick={(e) => handleDelete(asset.id, e)}
                          className="absolute top-2 left-2 p-1.5 rounded-md bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                          title="Remover imagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-slate-800 truncate" title={asset.name}>{asset.name}</p>
                        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                          <span>{(asset.sizeBytes / 1024).toFixed(0)} KB</span>
                          <span className="capitalize">{asset.folder}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {filteredAssets.map(asset => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={asset.url} alt={asset.name} className="w-12 h-10 object-cover rounded-md border border-slate-200" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{asset.name}</p>
                          <p className="text-[11px] text-slate-400">{(asset.sizeBytes / 1024).toFixed(0)} KB • Pasta: {asset.folder}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleDelete(asset.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Preview Details Column */}
          {selectedAsset && (
            <div className="w-64 border-l border-slate-200 p-4 bg-slate-50/40 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Detalhes do Arquivo</h3>
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-white mb-3 aspect-video">
                  <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Nome</span>
                    <span className="font-medium text-slate-700 break-all">{selectedAsset.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Tamanho</span>
                    <span className="font-medium text-slate-700">{(selectedAsset.sizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Pasta</span>
                    <span className="font-medium text-slate-700">{selectedAsset.folder}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Dimensões Recomendadas</span>
                    <span className="font-medium text-slate-700">{selectedAsset.width || 800} x {selectedAsset.height || 600} px</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    onSelectImage(selectedAsset.url, selectedAsset.altText || selectedAsset.name);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Inserir no E-mail
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
