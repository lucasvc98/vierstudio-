import React, { useState } from 'react';
import { 
  Type, Heading, Image as ImageIcon, Sparkles, Square, Minus, MoveVertical, 
  Share2, Video, Code2, ShoppingBag, Tag, Menu, Layout, FileText, UserCheck, 
  Columns, Bookmark, Palette, Plus, Trash2, ArrowRight, LayoutGrid, Calendar, Target
} from 'lucide-react';
import { EmailBlockType, EmailRow, GlobalEmailSettings, SavedBlockItem } from '../../types/email';

interface LeftSidebarProps {
  onAddBlock: (type: EmailBlockType) => void;
  onAddRow: (layout: EmailRow['layout']) => void;
  onAddShowcaseRow?: (count?: number) => void;
  onAddSavedBlock: (blockItem: SavedBlockItem) => void;
  savedBlocks: SavedBlockItem[];
  onDeleteSavedBlock: (id: string) => void;
  globalSettings: GlobalEmailSettings;
  onUpdateGlobalSettings: (settings: Partial<GlobalEmailSettings>) => void;
  preheader: string;
  onUpdatePreheader: (text: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onAddBlock,
  onAddRow,
  onAddShowcaseRow,
  onAddSavedBlock,
  savedBlocks,
  onDeleteSavedBlock,
  globalSettings,
  onUpdateGlobalSettings,
  preheader,
  onUpdatePreheader
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'structure' | 'saved' | 'design'>('content');

  // Drag start handler for elements
  const handleDragStart = (e: React.DragEvent, type: EmailBlockType) => {
    e.dataTransfer.setData('application/vierstudio-block', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragRowStart = (e: React.DragEvent, layout: EmailRow['layout']) => {
    e.dataTransfer.setData('application/vierstudio-row', layout);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const contentElements: { type: EmailBlockType; label: string; icon: any; category: string }[] = [
    { type: 'heading', label: 'Título', icon: Heading, category: 'Tipografia' },
    { type: 'text', label: 'Texto', icon: Type, category: 'Tipografia' },
    { type: 'button', label: 'Botão CTA', icon: Square, category: 'Ações' },
    { type: 'image', label: 'Imagem', icon: ImageIcon, category: 'Mídia' },
    { type: 'logo', label: 'Logotipo', icon: Sparkles, category: 'Mídia' },
    { type: 'divider', label: 'Divisor', icon: Minus, category: 'Estrutura' },
    { type: 'spacer', label: 'Espaçamento', icon: MoveVertical, category: 'Estrutura' },
    { type: 'social', label: 'Redes Sociais', icon: Share2, category: 'Redes' },
    { type: 'video', label: 'Vídeo Play', icon: Video, category: 'Mídia' },
    { type: 'coupon', label: 'Cupom de Desconto', icon: Tag, category: 'Conversão' },
    { type: 'product', label: 'Card de Produto', icon: ShoppingBag, category: 'Conversão' },
    { type: 'hero', label: 'Banner Promocional', icon: Layout, category: 'Blocos' },
    { type: 'header', label: 'Barra de Topo', icon: Sparkles, category: 'Blocos' },
    { type: 'topic-card', label: 'Card de Tópico', icon: Target, category: 'Blocos' },
    { type: 'schedule-box', label: 'Box de Evento', icon: Calendar, category: 'Blocos' },
    { type: 'nav', label: 'Menu de Navegação', icon: Menu, category: 'Navegação' },
    { type: 'signature', label: 'Assinatura Corp.', icon: UserCheck, category: 'Contato' },
    { type: 'footer', label: 'Rodapé Legal', icon: FileText, category: 'Legal' },
    { type: 'html', label: 'HTML Personalizado', icon: Code2, category: 'Avançado' }
  ];

  const columnStructures: { layout: EmailRow['layout']; label: string; desc: string; preview: number[] }[] = [
    { layout: '1-col', label: '1 Coluna', desc: '100% de largura total', preview: [100] },
    { layout: '2-col-equal', label: '2 Colunas Iguais', desc: '50% / 50%', preview: [50, 50] },
    { layout: '2-col-30-70', label: '2 Colunas 30 / 70', desc: 'Barra lateral + Conteúdo', preview: [30, 70] },
    { layout: '2-col-70-30', label: '2 Colunas 70 / 30', desc: 'Conteúdo + Barra lateral', preview: [70, 30] },
    { layout: '3-col', label: '3 Colunas', desc: '33% / 33% / 33%', preview: [33, 33, 33] },
    { layout: '4-col', label: '4 Colunas', desc: '25% / 25% / 25% / 25%', preview: [25, 25, 25, 25] },
  ];

  const colorPalettes = [
    { name: 'Modern Violet', body: '#f4f5f8', content: '#ffffff', button: '#6366f1', text: '#334155', heading: '#0f172a' },
    { name: 'Classic Navy', body: '#0f172a', content: '#ffffff', button: '#2563eb', text: '#334155', heading: '#1e293b' },
    { name: 'Vibrant Sunset', body: '#fff1f2', content: '#ffffff', button: '#e11d48', text: '#475569', heading: '#881337' },
    { name: 'Emerald Tech', body: '#f0fdf4', content: '#ffffff', button: '#059669', text: '#334155', heading: '#064e3b' },
    { name: 'Minimal Charcoal', body: '#f8fafc', content: '#ffffff', button: '#18181b', text: '#27272a', heading: '#09090b' },
  ];

  return (
    <aside className="w-80 h-full bg-white border-r border-slate-200 flex flex-col select-none z-10 shrink-0">
      
      {/* Sidebar Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/80 p-1 gap-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('content')}
          className={`py-2 px-1 text-center rounded-lg transition-all ${
            activeTab === 'content'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Conteúdo
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`py-2 px-1 text-center rounded-lg transition-all ${
            activeTab === 'structure'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Estrutura
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`py-2 px-1 text-center rounded-lg transition-all ${
            activeTab === 'saved'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Salvos
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`py-2 px-1 text-center rounded-lg transition-all ${
            activeTab === 'design'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Design
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-20">
        
        {/* ================= TAB 1: CONTEÚDO ================= */}
        {activeTab === 'content' && (
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Arraste ou clique para adicionar
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {contentElements.map(item => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={e => handleDragStart(e, item.type)}
                    onClick={() => onAddBlock(item.type)}
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50/70 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:shadow-xs group text-center"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-200 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 mb-2 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-900 leading-tight">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: ESTRUTURA ================= */}
        {activeTab === 'structure' && (
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Layouts de Colunas
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Insira novas seções de linhas e colunas para posicionar seus blocos com total alinhamento.
            </p>

            {/* Vitrine de Produtos com Seleção de Janelas */}
            <div
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('application/vierstudio-showcase-row', '3');
                e.dataTransfer.setData('application/vierstudio-row', '3-col');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onAddShowcaseRow ? onAddShowcaseRow(3) : onAddRow('3-col')}
              className="mb-3.5 p-3.5 border-2 border-indigo-200 hover:border-indigo-500 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 rounded-2xl cursor-pointer transition-all hover:shadow-sm group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-indigo-950 group-hover:text-indigo-700 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                  Vitrine de Produtos (1 a 4 Janelas)
                </span>
                <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  1 a 4 Janelas
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Card com imagens, títulos, descrições e botões. Selecione a quantidade de janelas na lateral.
              </p>
              <div className="flex gap-1.5 h-7">
                <div className="flex-1 bg-white border border-indigo-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-2xs">
                  Janela 1
                </div>
                <div className="flex-1 bg-white border border-indigo-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-2xs">
                  Janela 2
                </div>
                <div className="flex-1 bg-white border border-indigo-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-2xs">
                  Janela 3
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {columnStructures.map(col => (
                <div
                  key={col.layout}
                  draggable
                  onDragStart={e => handleDragRowStart(e, col.layout)}
                  onClick={() => onAddRow(col.layout)}
                  className="p-3 border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 rounded-xl cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">{col.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{col.desc}</span>
                  </div>

                  {/* Visual column split preview */}
                  <div className="flex gap-1.5 h-6 w-full">
                    {col.preview.map((pct, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${pct}%` }}
                        className="bg-slate-100 group-hover:bg-indigo-100 border border-slate-200 group-hover:border-indigo-300 rounded text-[10px] text-slate-400 group-hover:text-indigo-600 flex items-center justify-center font-mono"
                      >
                        {pct}%
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BLOCOS SALVOS ================= */}
        {activeTab === 'saved' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Biblioteca de Blocos
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {savedBlocks.length} disponíveis
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Modelos pré-construídos e blocos que você salvou no editor.
            </p>

            <div className="space-y-2.5">
              {savedBlocks.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddSavedBlock(item)}
                      title="Adicionar ao Canvas"
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSavedBlock(item.id)}
                      title="Excluir da biblioteca"
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: DESIGN GLOBAL ================= */}
        {activeTab === 'design' && (
          <div className="space-y-4">
            
            {/* Preheader field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pré-Cabeçalho (Preheader)
              </label>
              <textarea
                rows={2}
                value={preheader}
                onChange={e => onUpdatePreheader(e.target.value)}
                placeholder="Texto curto exibido na caixa de entrada logo após o assunto..."
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Oculte no e-mail mas mostre no preview da caixa de entrada do Gmail/Outlook.
              </span>
            </div>

            {/* Container Width */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>Largura do E-mail</span>
                <span className="font-mono text-indigo-600">{globalSettings.containerWidth} px</span>
              </div>
              <input
                type="range"
                min="480"
                max="800"
                step="20"
                value={globalSettings.containerWidth}
                onChange={e => onUpdateGlobalSettings({ containerWidth: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>480px (Compacto)</span>
                <span>600px (Padrão de Ouro)</span>
                <span>800px (Largo)</span>
              </div>
            </div>

            {/* Background Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fundo Externo</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={globalSettings.bodyBgColor}
                    onChange={e => onUpdateGlobalSettings({ bodyBgColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={globalSettings.bodyBgColor}
                    onChange={e => onUpdateGlobalSettings({ bodyBgColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fundo Conteúdo</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={globalSettings.contentBgColor}
                    onChange={e => onUpdateGlobalSettings({ contentBgColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={globalSettings.contentBgColor}
                    onChange={e => onUpdateGlobalSettings({ contentBgColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipografia Padrão</label>
              <select
                value={globalSettings.defaultFontFamily}
                onChange={e => onUpdateGlobalSettings({ defaultFontFamily: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="Arial, Helvetica, sans-serif">Arial / Helvetica (Universal)</option>
                <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Moderna)</option>
                <option value="'Segoe UI', Roboto, sans-serif">Segoe UI / Roboto (Sistema)</option>
                <option value="Georgia, serif">Georgia (Elegante Serifa)</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS (Corporativa)</option>
                <option value="Verdana, Geneva, sans-serif">Verdana (Alta Legibilidade)</option>
              </select>
            </div>

            {/* Default Text and Link Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor do Texto</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={globalSettings.defaultTextColor}
                    onChange={e => onUpdateGlobalSettings({ defaultTextColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={globalSettings.defaultTextColor}
                    onChange={e => onUpdateGlobalSettings({ defaultTextColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor dos Links</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={globalSettings.defaultLinkColor}
                    onChange={e => onUpdateGlobalSettings({ defaultLinkColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={globalSettings.defaultLinkColor}
                    onChange={e => onUpdateGlobalSettings({ defaultLinkColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Container Rounded Corners */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Arredondamento do E-mail</span>
                <span className="font-mono text-indigo-600">{globalSettings.containerRadius} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={globalSettings.containerRadius}
                onChange={e => onUpdateGlobalSettings({ containerRadius: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Preset Color Palettes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Paletas Rápidas</label>
              <div className="space-y-1.5">
                {colorPalettes.map(pal => (
                  <button
                    key={pal.name}
                    onClick={() => {
                      onUpdateGlobalSettings({
                        bodyBgColor: pal.body,
                        contentBgColor: pal.content,
                        defaultButtonBg: pal.button,
                        defaultTextColor: pal.text,
                        defaultHeadingColor: pal.heading,
                        defaultLinkColor: pal.button
                      });
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white text-xs text-left transition-colors"
                  >
                    <span className="font-medium text-slate-700">{pal.name}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: pal.body }} />
                      <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: pal.content }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.button }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </aside>
  );
};
