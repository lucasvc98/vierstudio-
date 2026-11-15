import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Undo2, 
  Redo2, 
  Eye, 
  Code, 
  Share2, 
  Save, 
  Check, 
  Globe, 
  Settings, 
  ExternalLink,
  Sliders,
  Sparkles
} from 'lucide-react';
import { PageDocument, PageDeviceView } from '../../../types/page';

interface PageEditorTopBarProps {
  page: PageDocument;
  folders: string[];
  deviceView: PageDeviceView;
  onChangeDeviceView: (view: PageDeviceView) => void;
  onBackToDashboard: () => void;
  onUpdateName: (name: string) => void;
  onUpdateSlug: (slug: string) => void;
  onSave: () => void;
  onOpenCodeModal: () => void;
  onOpenSeoModal: () => void;
  onOpenPublishModal: () => void;
  onOpenPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

export const PageEditorTopBar: React.FC<PageEditorTopBarProps> = ({
  page,
  folders,
  deviceView,
  onChangeDeviceView,
  onBackToDashboard,
  onUpdateName,
  onUpdateSlug,
  onSave,
  onOpenCodeModal,
  onOpenSeoModal,
  onOpenPublishModal,
  onOpenPreview,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSaving,
  lastSavedAt
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(page.name);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== page.name) {
      onUpdateName(titleValue.trim());
    } else {
      setTitleValue(page.name);
    }
  };

  const isPublished = page.status === 'published';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0 select-none">
      
      {/* Left: Back Button, Brand & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          title="Voltar ao Painel de Páginas"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Painel</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
          <img src="/logo.png" alt="vierstudio" className="w-full h-full object-cover" />
        </div>

        {/* Title editing */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className="text-xs sm:text-sm font-bold text-slate-900 bg-indigo-50/50 px-2 py-0.5 border border-indigo-300 rounded-md outline-none max-w-xs"
          />
        ) : (
          <div 
            onClick={() => { setTitleValue(page.name); setIsEditingTitle(true); }}
            className="group flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Clique para renomear esta landing page"
          >
            <span className="text-xs sm:text-sm font-bold text-slate-900 max-w-[140px] sm:max-w-xs truncate">
              {page.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              /p/{page.slug}
            </span>
          </div>
        )}

        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5">
          {isPublished ? (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Rascunho
            </span>
          )}

          {isSaving ? (
            <span className="text-[11px] text-indigo-600 flex items-center gap-1 ml-1 animate-pulse">
              Salvando...
            </span>
          ) : lastSavedAt ? (
            <span className="text-[10px] text-slate-400 ml-1">
              Salvo às {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
        </div>
      </div>

      {/* Center: Device Switcher (Desktop, Tablet, Mobile) & Undo/Redo */}
      <div className="flex items-center gap-2">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo ? 'text-slate-700 hover:bg-white hover:shadow-2xs' : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo ? 'text-slate-700 hover:bg-white hover:shadow-2xs' : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Device Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onChangeDeviceView('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              deviceView === 'desktop'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Visualização Desktop (100% / 1200px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>

          <button
            onClick={() => onChangeDeviceView('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              deviceView === 'tablet'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Visualização Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>

          <button
            onClick={() => onChangeDeviceView('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              deviceView === 'mobile'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Visualização Celular (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

      </div>

      {/* Right: Actions (Ver Código, SEO/Tracking, Pré-visualizar, Publicar) */}
      <div className="flex items-center gap-2">
        
        {/* Ver Código */}
        <button
          onClick={onOpenCodeModal}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Ver código HTML, CSS, JavaScript e Scripts gerados"
        >
          <Code className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Ver Código</span>
        </button>

        {/* SEO & Tracking */}
        <button
          onClick={onOpenSeoModal}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Configurações de SEO, Meta Pixel, GTM e Scripts"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">SEO & Tracking</span>
        </button>

        {/* Pré-visualizar */}
        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Abrir pré-visualização em nova aba"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">Prévia</span>
        </button>

        {/* Salvar */}
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salvar</span>
        </button>

        {/* Publicar CTA */}
        <button
          onClick={onOpenPublishModal}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all ${
            isPublished
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isPublished ? 'Publicada' : 'Publicar'}</span>
        </button>

      </div>

    </header>
  );
};
