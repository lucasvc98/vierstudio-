import React, { useState } from 'react';
import { 
  ArrowLeft, Monitor, Smartphone, Undo2, Redo2, 
  Save, Download, Check, Sparkles, Send, Eye, Code, ChevronDown,
  Folder
} from 'lucide-react';
import { EmailDocument } from '../../types/email';

interface EditorTopBarProps {
  document: EmailDocument;
  folders?: string[];
  onUpdateFolder?: (folder: string) => void;
  onUpdateDocumentName: (name: string) => void;
  onBackToDashboard: () => void;
  onSave: () => void;
  onExport: () => void;
  onOpenTester: () => void;
  onOpenPreviewWindow: () => void;
  deviceView: 'desktop' | 'mobile';
  onChangeDeviceView: (mode: 'desktop' | 'mobile') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  document: doc,
  folders,
  onUpdateFolder,
  onUpdateDocumentName,
  onBackToDashboard,
  onSave,
  onExport,
  onOpenTester,
  onOpenPreviewWindow,
  deviceView,
  onChangeDeviceView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSaving,
  lastSavedAt
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(doc.name);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== doc.name) {
      onUpdateDocumentName(titleValue.trim());
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shrink-0 select-none">
      
      {/* Left: Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          title="Voltar aos Meus Templates"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Painel</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
          <img src="/logo.png" alt="vierstudio" className="w-full h-full object-cover" />
        </div>

        {/* Project Name editable */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className="text-sm font-bold text-slate-900 bg-indigo-50/50 px-2 py-0.5 border border-indigo-300 rounded-md outline-none"
          />
        ) : (
          <div 
            onClick={() => { setTitleValue(doc.name); setIsEditingTitle(true); }}
            className="group flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Clique para renomear este e-mail"
          >
            <span className="text-sm font-bold text-slate-900 max-w-[200px] sm:max-w-xs truncate">
              {doc.name}
            </span>
            <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              (editar)
            </span>
          </div>
        )}

        {/* Folder Selector Badge */}
        {folders && onUpdateFolder && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg text-xs text-slate-700 font-semibold border border-slate-200/80 transition-colors">
            <Folder className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={doc.folder || 'Geral'}
              onChange={(e) => onUpdateFolder(e.target.value)}
              className="bg-transparent border-0 outline-none cursor-pointer text-slate-800 font-semibold text-xs pr-1"
            >
              {folders.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        {/* Auto-save status */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400">
          <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
          <span>{isSaving ? 'Salvando...' : 'Salvo automaticamente'}</span>
        </div>
      </div>

      {/* Center: Device Switcher & History */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50/70">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Desfazer (Ctrl+Z)"
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Refazer (Ctrl+Y)"
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50/70">
          <button
            onClick={() => onChangeDeviceView('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              deviceView === 'desktop'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => onChangeDeviceView('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              deviceView === 'mobile'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile (375px)</span>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        
        {/* Pre-flight Email Validator Button */}
        <button
          onClick={onOpenTester}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title="Verificar erros de responsividade, imagens quebradas e clipping do Gmail"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Auditar & Testar</span>
        </button>

        {/* Save button */}
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Salvar</span>
        </button>

        {/* Main Export HTML Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar HTML</span>
        </button>

      </div>

    </header>
  );
};
