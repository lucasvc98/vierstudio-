import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Layout, 
  Workflow, 
  GitBranch, 
  ListOrdered, 
  Users, 
  Lightbulb, 
  Compass, 
  Plus, 
  ArrowRight,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { BoardTemplateModel } from '../../types/board';
import { INITIAL_BOARD_TEMPLATES } from '../../data/initialBoards';

interface BoardTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: BoardTemplateModel) => void;
  onStartBlank: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos os templates', icon: Layout },
  { id: 'miroverse', label: 'Miroverse & Comunidade', icon: Sparkles },
  { id: 'marketing', label: 'Templates de Marketing', icon: Compass },
  { id: 'meetings', label: 'Reuniões e workshops', icon: Users },
  { id: 'brainstorm', label: 'Ideação e brainstorming', icon: Lightbulb },
  { id: 'flows', label: 'Fluxos de trabalho ágeis', icon: Workflow },
  { id: 'strategy', label: 'Estratégia e planejamento', icon: ListOrdered },
  { id: 'diagrams', label: 'Mapas e Diagramas', icon: GitBranch }
];

export const BoardTemplatesModal: React.FC<BoardTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onStartBlank
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');
  const [showOnCreate, setShowOnCreate] = useState(true);

  const filteredTemplates = useMemo(() => {
    return INITIAL_BOARD_TEMPLATES.filter(tmpl => {
      const matchSearch = tmpl.name.toLowerCase().includes(search.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(search.toLowerCase()) ||
        (tmpl.badge && tmpl.badge.toLowerCase().includes(search.toLowerCase()));
      
      if (!matchSearch) return false;
      if (selectedCat === 'all') return true;
      if (selectedCat === 'miroverse') return tmpl.category === 'brainstorm' || tmpl.badge === 'AI Sidekick';
      if (selectedCat === 'marketing') return tmpl.name.toLowerCase().includes('marketing') || tmpl.name.toLowerCase().includes('vendas');
      if (selectedCat === 'meetings') return tmpl.category === 'retro' || tmpl.category === 'strategy';
      if (selectedCat === 'brainstorm') return tmpl.category === 'brainstorm' || tmpl.category === 'mindmap';
      if (selectedCat === 'flows') return tmpl.category === 'flowchart' || tmpl.category === 'kanban';
      if (selectedCat === 'strategy') return tmpl.category === 'strategy' || tmpl.category === 'retro';
      if (selectedCat === 'diagrams') return tmpl.category === 'flowchart' || tmpl.category === 'mindmap';
      return true;
    });
  }, [search, selectedCat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-sm">
              M
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Galeria de Templates</h2>
              <p className="text-xs text-slate-500">Comece rapidamente com fluxos, retrospectivas ou mapas mentais</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={showOnCreate} 
                onChange={e => setShowOnCreate(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Mostrar ao criar um board</span>
            </label>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-4 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquise por nome, categoria ou objetivo (ex: Fluxo, Retrospectiva, Lançamento)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={onStartBlank}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Board em branco
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Category Sidebar (Like Miro Image 4) */}
          <div className="w-64 border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-1 overflow-y-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
              Categorias Miro
            </span>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-200/80">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Miro AI Assist
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Você também pode criar mapas mentais e fluxos complexos direto com IA a partir de qualquer briefing!
              </p>
            </div>
          </div>

          {/* Right Cards Grid */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'recommended'
                      ? 'bg-white shadow-xs text-slate-900 border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Para você
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white shadow-xs text-slate-900 border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Ver todos ({INITIAL_BOARD_TEMPLATES.length})
                </button>
              </div>

              <span className="text-xs text-slate-400">
                {filteredTemplates.length} modelo{filteredTemplates.length === 1 ? '' : 's'} disponível{filteredTemplates.length === 1 ? '' : 'is'}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Blank board card */}
              <div
                onClick={onStartBlank}
                className="group border border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 flex flex-col justify-between bg-white hover:bg-blue-50/20 transition-all cursor-pointer shadow-xs hover:shadow-md min-h-[220px]"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors mb-3">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Board em branco
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Comece do zero com tela infinita, notas adesivas coloridas e assistente IA.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Criar novo board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Template Cards */}
              {filteredTemplates.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => onSelectTemplate(tmpl)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-4 flex flex-col justify-between transition-all cursor-pointer shadow-xs hover:shadow-md min-h-[220px]"
                >
                  <div>
                    {/* Visual miniature mockup */}
                    <div className="h-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/80 mb-3 overflow-hidden relative border border-slate-200/60 p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        {tmpl.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            {tmpl.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono ml-auto">
                          {(tmpl.board || tmpl.document)?.items?.length || 0} nós
                        </span>
                      </div>

                      {/* Schematic mini shapes inside mockup */}
                      <div className="flex items-center justify-center gap-2 py-2">
                        {tmpl.category === 'flowchart' ? (
                          <div className="flex items-center gap-1.5 opacity-80">
                            <div className="w-8 h-5 rounded bg-blue-400" />
                            <div className="w-4 h-0.5 bg-slate-400" />
                            <div className="w-6 h-6 rotate-45 bg-amber-400" />
                            <div className="w-4 h-0.5 bg-slate-400" />
                            <div className="w-8 h-5 rounded bg-emerald-400" />
                          </div>
                        ) : tmpl.category === 'retro' ? (
                          <div className="grid grid-cols-2 gap-1.5 opacity-80 w-24">
                            <div className="h-5 rounded bg-rose-300" />
                            <div className="h-5 rounded bg-emerald-300" />
                            <div className="h-5 rounded bg-amber-300" />
                            <div className="h-5 rounded bg-sky-300" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 opacity-80">
                            <div className="w-10 h-7 rounded-lg bg-amber-300 shadow-xs" />
                            <div className="w-10 h-7 rounded-lg bg-pink-300 shadow-xs" />
                            <div className="w-10 h-7 rounded-lg bg-sky-300 shadow-xs" />
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        vierstudio • Miro Standard
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tmpl.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {tmpl.category}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Usar Modelo</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
