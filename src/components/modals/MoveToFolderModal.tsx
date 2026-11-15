import React, { useState } from 'react';
import { X, Folder, FolderPlus, Check, ArrowRight } from 'lucide-react';
import { EmailDocument } from '../../types/email';

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: EmailDocument | null;
  folders: string[];
  onMove: (projectId: string, targetFolder: string) => void;
  onCreateFolder: (folderName: string) => Promise<string | void>;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  isOpen,
  onClose,
  project,
  folders,
  onMove,
  onCreateFolder
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>(project?.folder || 'Geral');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const handleConfirmMove = async () => {
    setIsSubmitting(true);
    try {
      let finalFolder = selectedFolder;
      if (isCreatingNew && newFolderName.trim()) {
        const created = await onCreateFolder(newFolderName.trim());
        finalFolder = created || newFolderName.trim();
      }
      onMove(project.id, finalFolder);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mover E-mail para Pasta</h2>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {project.name}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <label className="block text-xs font-semibold text-slate-700">
            Selecione a pasta de destino:
          </label>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {folders.map(folder => {
              const isSelected = (!isCreatingNew && selectedFolder === folder);
              return (
                <div
                  key={folder}
                  onClick={() => { setSelectedFolder(folder); setIsCreatingNew(false); }}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{folder}</span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Create new folder toggle */}
          <div className="pt-2 border-t border-slate-100">
            {isCreatingNew ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Nome da nova pasta..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  autoFocus
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={e => e.key === 'Enter' && handleConfirmMove()}
                />
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Criar Nova Pasta</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmMove}
            disabled={isSubmitting || (isCreatingNew && !newFolderName.trim())}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors shadow-xs"
          >
            <span>Mover E-mail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
