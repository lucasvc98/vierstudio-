import React, { useState, useEffect } from 'react';
import { 
  BoardDocument, 
  BoardTemplateModel 
} from '../../types/board';
import { INITIAL_BOARD_TEMPLATES, createBlankBoard } from '../../data/initialBoards';
import { BoardTemplatesModal } from '../modals/BoardTemplatesModal';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Home, 
  Star, 
  Compass, 
  Folder, 
  MoreVertical, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Bell, 
  Gift, 
  UserPlus, 
  Layers, 
  Workflow, 
  Layout, 
  ArrowRight,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';

interface BoardDashboardViewProps {
  onOpenBoard: (board: BoardDocument) => void;
  activeModule: 'emails' | 'pages' | 'boards';
  onSwitchModule: (module: 'emails' | 'pages' | 'boards') => void;
}

export const BoardDashboardView: React.FC<BoardDashboardViewProps> = ({
  onOpenBoard,
  activeModule,
  onSwitchModule
}) => {
  const [boards, setBoards] = useState<BoardDocument[]>([]);
  const [folders, setFolders] = useState<string[]>(['Geral', 'Modelos Prontos', 'Projetos', 'Estratégia 2026']);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  // Fetch boards
  const loadBoards = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/boards');
      const data = await res.json();
      if (data.success && Array.isArray(data.boards)) {
        setBoards(data.boards);
      }
    } catch (err) {
      console.error('Erro ao carregar boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch folders
  const loadFolders = async () => {
    try {
      const res = await fetch('/api/board-folders');
      const data = await res.json();
      if (data.success && Array.isArray(data.folders)) {
        setFolders(data.folders);
      }
    } catch (err) {
      console.error('Erro ao carregar pastas:', err);
    }
  };

  useEffect(() => {
    loadBoards();
    loadFolders();
  }, []);

  const handleCreateBlank = async () => {
    const newBoard = createBlankBoard(`Novo Board #${boards.length + 1}`);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard)
      });
      const data = await res.json();
      if (data.success) {
        setBoards([data.board, ...boards]);
        onOpenBoard(data.board);
      }
    } catch (err) {
      console.error('Erro ao criar board:', err);
      onOpenBoard(newBoard);
    }
  };

  const handleUseTemplate = async (template: BoardTemplateModel) => {
    const now = new Date().toISOString();
    const sourceDoc = template.board || template.document;
    const newBoard: BoardDocument = {
      ...JSON.parse(JSON.stringify(sourceDoc)),
      id: `board-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${template.name} #${boards.length + 1}`,
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard)
      });
      const data = await res.json();
      if (data.success) {
        setBoards([data.board, ...boards]);
        onOpenBoard(data.board);
      }
    } catch (err) {
      console.error('Erro ao salvar template:', err);
      onOpenBoard(newBoard);
    }
  };

  const handleDuplicateBoard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/boards/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBoards([data.board, ...boards]);
      }
    } catch (err) {
      console.error('Erro ao duplicar board:', err);
    }
  };

  const handleDeleteBoard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir este board?')) return;
    try {
      const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBoards(boards.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Erro ao excluir board:', err);
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch('/api/board-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: newFolderName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders);
        setNewFolderName('');
        setShowNewFolderInput(false);
      }
    } catch (err) {
      console.error('Erro ao adicionar pasta:', err);
    }
  };

  const filteredBoards = boards.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedFolder !== 'all') {
      return b.folder === selectedFolder;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-50 font-sans select-none">
      {/* Top Banner (as in Miro Image 1) */}
      {showBanner && (
        <div className="bg-blue-600 text-white text-xs px-6 py-2 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Não perca nenhuma atualização importante. <strong>Ativar notificações em tempo real</strong></span>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top App Bar & Switcher */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          {/* Miro Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-xs">
              M
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              miro
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Beta
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Plano Free
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-2" />

          {/* Module Switcher Tabs: E-mails | Landing Pages | Mapas Mentais (Miro) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onSwitchModule('emails')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeModule === 'emails'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✉️ E-mails
            </button>
            <button
              onClick={() => onSwitchModule('pages')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeModule === 'pages'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🚀 Landing Pages
            </button>
            <button
              onClick={() => onSwitchModule('boards')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeModule === 'boards'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ Mapas Mentais (Miro)
            </button>
          </div>
        </div>

        {/* Right Miro Controls */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Convidar membros</span>
          </button>
          <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
            Fazer upgrade
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            L
          </div>
        </div>
      </div>

      {/* Main Layout (Left Miro Sidebar + Content Area) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Image 1 style) */}
        <div className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Team / Workspace Dropdown */}
            <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500 text-white font-black text-xs flex items-center justify-center">
                  MA
                </div>
                <span className="text-xs font-bold text-slate-800">Marketing</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquise por título..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Nav list */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedFolder('all')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedFolder === 'all'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Página inicial</span>
              </button>
              <button
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Star className="w-4 h-4 text-slate-400" />
                <span>Favoritos</span>
              </button>
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-slate-400" />
                <span>Procurar templates</span>
              </button>
            </div>

            {/* Spaces / Folders section (Image 1 style) */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Espaços & Pastas
                </span>
                <button
                  onClick={() => setShowNewFolderInput(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  title="Novo Espaço"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showNewFolderInput && (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 mb-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="Nome da pasta..."
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg outline-none mb-1.5"
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setShowNewFolderInput(false)}
                      className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-200 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddFolder}
                      className="px-2 py-1 text-[11px] bg-blue-600 text-white font-bold rounded"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              {folders.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedFolder === f
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{f}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Miro AI Inteligente
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Crie fluxos de venda, mapas mentais e retrospectivas completas em segundos com IA.
            </p>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
          <div>
            {/* Center Area: "+ Criar novo" big button (Image 1) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs flex flex-col items-center justify-center text-center mb-8 relative overflow-hidden">
              <button
                onClick={handleCreateBlank}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-102 active:scale-98"
              >
                <Plus className="w-5 h-5" />
                <span>+ Criar novo</span>
              </button>
              <p className="text-xs text-slate-400 mt-3">
                {boards.length === 0
                  ? 'Assim que começar a criar, seus boards vão aparecer aqui.'
                  : `Você possui ${boards.length} board${boards.length === 1 ? '' : 's'} cadastrado${boards.length === 1 ? '' : 's'}.`}
              </p>
            </div>

            {/* Existing Boards Grid */}
            {filteredBoards.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                    Seus Boards & Mapas ({filteredBoards.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBoards.map(b => (
                    <div
                      key={b.id}
                      onClick={() => onOpenBoard(b)}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-4 flex flex-col justify-between transition-all cursor-pointer shadow-xs hover:shadow-md h-52 relative"
                    >
                      {/* Thumbnail representation */}
                      <div className="h-28 rounded-xl bg-slate-100 group-hover:bg-blue-50/40 border border-slate-200/70 p-2 flex items-center justify-center relative overflow-hidden transition-colors">
                        <div className="flex items-center gap-1.5 opacity-70">
                          <div className="w-8 h-8 rounded-lg bg-amber-200 shadow-2xs border border-amber-300" />
                          <div className="w-6 h-0.5 bg-slate-400" />
                          <div className="w-8 h-8 rounded-lg bg-sky-200 shadow-2xs border border-sky-300" />
                        </div>

                        {/* Top-right menu */}
                        <div 
                          className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={e => handleDuplicateBoard(b.id, e)}
                            title="Duplicar board"
                            className="p-1 bg-white/90 hover:bg-white text-slate-600 rounded-md shadow-xs transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleDeleteBoard(b.id, e)}
                            title="Excluir board"
                            className="p-1 bg-white/90 hover:bg-red-50 text-red-500 rounded-md shadow-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                          {b.name}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>{b.items.length} elementos</span>
                          <span>{new Date(b.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section: "ou comece com um template" Carousel (Image 1) */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">ou comece com um template</span>
                <span className="text-xs text-slate-300">•</span>
                <button 
                  onClick={() => setShowTemplatesModal(true)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Templates para Todas as funções</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => setShowTemplatesModal(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Ver todos ({INITIAL_BOARD_TEMPLATES.length})
              </button>
            </div>

            {/* Horizontal Templates Carousel (Image 1) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* Board em branco */}
              <div
                onClick={handleCreateBlank}
                className="group border border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 rounded-2xl p-3 flex flex-col justify-between items-center text-center cursor-pointer transition-all shadow-xs h-36"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors mt-2">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 mb-1">
                  Board em branco
                </span>
              </div>

              {/* Initial template chips */}
              {INITIAL_BOARD_TEMPLATES.slice(0, 6).map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => handleUseTemplate(tmpl)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-3 flex flex-col justify-between cursor-pointer transition-all shadow-xs hover:shadow-md h-36"
                >
                  <div className="h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200/70 p-2 flex items-center justify-center relative overflow-hidden">
                    {tmpl.badge && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-100 text-blue-700">
                        {tmpl.badge}
                      </span>
                    )}
                    <Workflow className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 truncate mb-1">
                    {tmpl.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      <BoardTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleUseTemplate}
        onStartBlank={() => {
          setShowTemplatesModal(false);
          handleCreateBlank();
        }}
      />
    </div>
  );
};
