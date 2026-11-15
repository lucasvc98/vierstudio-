import React, { useState } from 'react';
import { 
  Layout, 
  Type, 
  Heading, 
  Image as ImageIcon, 
  Video, 
  Square, 
  SplitSquareVertical, 
  Minus, 
  FormInput, 
  MessageCircle, 
  Clock, 
  CreditCard, 
  HelpCircle, 
  Quote, 
  ShieldCheck, 
  Code, 
  Sliders, 
  Sparkles, 
  Plus, 
  Columns, 
  Grid,
  ChevronDown,
  Layers,
  Palette
} from 'lucide-react';
import { PageElementType, PageContainerLayout, PageGlobalSettings } from '../../../types/page';

interface PageLeftSidebarProps {
  onAddElement: (type: PageElementType) => void;
  onAddSection: (name?: string, fullWidth?: boolean) => void;
  onAddPresetBlock: (blockType: string) => void;
  globalSettings: PageGlobalSettings;
  onUpdateGlobalSettings: (settings: Partial<PageGlobalSettings>) => void;
}

export const PageLeftSidebar: React.FC<PageLeftSidebarProps> = ({
  onAddElement,
  onAddSection,
  onAddPresetBlock,
  globalSettings,
  onUpdateGlobalSettings
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'sections' | 'global'>('elements');

  // Drag start handler for elements
  const handleDragStart = (e: React.DragEvent, type: PageElementType) => {
    e.dataTransfer.setData('application/vierstudio-page-element', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragSectionStart = (e: React.DragEvent, presetType: string) => {
    e.dataTransfer.setData('application/vierstudio-page-preset', presetType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const structureElements: { type: PageElementType; label: string; icon: any }[] = [
    { type: 'spacer', label: 'Espaçador', icon: SplitSquareVertical },
    { type: 'divider', label: 'Divisor', icon: Minus },
    { type: 'accordion', label: 'Accordion / FAQ', icon: HelpCircle }
  ];

  const contentElements: { type: PageElementType; label: string; icon: any }[] = [
    { type: 'heading', label: 'Título', icon: Heading },
    { type: 'paragraph', label: 'Parágrafo', icon: Type },
    { type: 'image', label: 'Imagem', icon: ImageIcon },
    { type: 'video', label: 'Vídeo (YouTube)', icon: Video },
    { type: 'button', label: 'Botão CTA', icon: Square },
    { type: 'testimonial', label: 'Depoimento', icon: Quote },
    { type: 'html-embed', label: 'Código HTML Embed', icon: Code }
  ];

  const marketingElements: { type: PageElementType; label: string; icon: any }[] = [
    { type: 'form', label: 'Formulário Completo', icon: FormInput },
    { type: 'whatsapp-button', label: 'Botão de WhatsApp', icon: MessageCircle },
    { type: 'countdown', label: 'Contagem Regressiva', icon: Clock },
    { type: 'pricing-table', label: 'Tabela de Preços', icon: CreditCard },
    { type: 'trust-badges', label: 'Selos de Confiança', icon: ShieldCheck }
  ];

  const presetSections = [
    { id: 'hero-sales', label: 'Hero com Vídeo e CTA', desc: 'Abertura de alta conversão para produtos' },
    { id: 'hero-lead', label: 'Captura com Formulário', desc: 'Duas colunas com texto e campos' },
    { id: 'benefits-grid', label: 'Grade de Benefícios (3 Cols)', desc: 'Destaque os principais diferenciais' },
    { id: 'pricing-section', label: 'Oferta com Preço & Garantia', desc: 'Tabela com ancoragem e botão' },
    { id: 'faq-section', label: 'Perguntas Frequentes (FAQ)', desc: 'Sanfona com respostas completas' },
    { id: 'whatsapp-fixed', label: 'Botão Flutuante WhatsApp', desc: 'Acesso rápido para dúvidas no chat' }
  ];

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full select-none shadow-2xs z-20">
      
      {/* Top Sidebar Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 px-3 pt-3">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'elements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Elementos</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'sections'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Seções</span>
        </button>

        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'global'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Design</span>
        </button>
      </div>

      {/* Tab 1: Draggable Elements */}
      {activeTab === 'elements' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Quick Add Section Button */}
          <button
            onClick={() => onAddSection('Nova Seção', false)}
            className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar Nova Seção</span>
          </button>

          {/* Marketing & Conversion (Highlighted) */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Marketing & Conversão</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {marketingElements.map(el => {
                const Icon = el.icon;
                return (
                  <div
                    key={el.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, el.type)}
                    onClick={() => onAddElement(el.type)}
                    className="p-3 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-400 rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col items-center text-center group shadow-2xs hover:shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 flex items-center justify-center mb-1.5 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      {el.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Content */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Conteúdo
            </div>
            <div className="grid grid-cols-2 gap-2">
              {contentElements.map(el => {
                const Icon = el.icon;
                return (
                  <div
                    key={el.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, el.type)}
                    onClick={() => onAddElement(el.type)}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col items-center text-center group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center mb-1.5 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">
                      {el.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structure & Layout */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Estrutura & Espaçamento
            </div>
            <div className="grid grid-cols-2 gap-2">
              {structureElements.map(el => {
                const Icon = el.icon;
                return (
                  <div
                    key={el.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, el.type)}
                    onClick={() => onAddElement(el.type)}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col items-center text-center group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center mb-1.5 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">
                      {el.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Ready Preset Sections */}
      {activeTab === 'sections' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs text-slate-500 mb-2">
            Clique ou arraste blocos prontos diretamente para a página:
          </div>

          {presetSections.map(sec => (
            <div
              key={sec.id}
              draggable
              onDragStart={(e) => handleDragSectionStart(e, sec.id)}
              onClick={() => onAddPresetBlock(sec.id)}
              className="p-3.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                  {sec.label}
                </span>
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {sec.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Global Design Settings */}
      {activeTab === 'global' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cor Primária (Botões & Destaques)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={globalSettings.primaryColor}
                onChange={e => onUpdateGlobalSettings({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={globalSettings.primaryColor}
                onChange={e => onUpdateGlobalSettings({ primaryColor: e.target.value })}
                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cor Secundária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={globalSettings.secondaryColor}
                onChange={e => onUpdateGlobalSettings({ secondaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={globalSettings.secondaryColor}
                onChange={e => onUpdateGlobalSettings({ secondaryColor: e.target.value })}
                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipografia Global</label>
            <select
              value={globalSettings.fontFamily}
              onChange={e => onUpdateGlobalSettings({ fontFamily: e.target.value })}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white font-medium"
            >
              <option value="Inter, sans-serif">Inter (Moderno & Clean)</option>
              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (SaaS & Tech)</option>
              <option value="Montserrat, sans-serif">Montserrat (Impactante)</option>
              <option value="'Playfair Display', serif">Playfair Display (Elegante & Premium)</option>
              <option value="system-ui, sans-serif">Sistema Nativo</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Largura Máxima do Container ({globalSettings.maxWidth}px)</label>
            <input
              type="range"
              min="960"
              max="1440"
              step="20"
              value={globalSettings.maxWidth}
              onChange={e => onUpdateGlobalSettings({ maxWidth: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cor de Fundo da Página</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={globalSettings.backgroundColor}
                onChange={e => onUpdateGlobalSettings({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={globalSettings.backgroundColor}
                onChange={e => onUpdateGlobalSettings({ backgroundColor: e.target.value })}
                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

    </aside>
  );
};
