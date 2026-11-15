import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FolderOpen, 
  MoreVertical, 
  Copy, 
  Trash2, 
  ExternalLink, 
  FolderPlus, 
  Eye, 
  Globe, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Users, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layout,
  Target,
  ShoppingBag,
  Video,
  Calendar,
  CheckCircle,
  Percent,
  Rocket,
  BookOpen,
  Package,
  Briefcase,
  Building,
  PlusSquare,
  Wand2
} from 'lucide-react';
import { PageDocument, PageTemplateModel, PageCategoryType } from '../../types/page';
import { PAGE_CATEGORIES } from '../../utils/pageDefaults';
import { INITIAL_PAGE_TEMPLATES } from '../../data/initialPageTemplates';
import { UserProfile } from '../../types/email';

interface PageDashboardViewProps {
  pages: PageDocument[];
  folders: string[];
  activeModule: 'emails' | 'pages' | 'boards';
  onChangeModule: (mod: 'emails' | 'pages' | 'boards') => void;
  onOpenPage: (page: PageDocument) => void;
  onCreateNewPage: (category?: PageCategoryType) => void;
  onOpenAiCreator: () => void;
  onSelectTemplate: (template: PageTemplateModel) => void;
  onDuplicatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onTogglePublishPage: (id: string) => void;
  onMovePage: (id: string, folder: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (name: string) => Promise<void>;
  onOpenMediaManager: () => void;
  onOpenLeadsModal: () => void;
  user: UserProfile;
}

export const PageDashboardView: React.FC<PageDashboardViewProps> = ({
  pages,
  folders,
  activeModule,
  onChangeModule,
  onOpenPage,
  onCreateNewPage,
  onOpenAiCreator,
  onSelectTemplate,
  onDuplicatePage,
  onDeletePage,
  onTogglePublishPage,
  onMovePage,
  onCreateFolder,
  onDeleteFolder,
  onOpenMediaManager,
  onOpenLeadsModal,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'my-pages' | 'ready-templates' | 'published' | 'drafts'>('my-pages');
  const [selectedCategory, setSelectedCategory] = useState<PageCategoryType | 'all'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Handle folder submission
  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim());
    setSelectedFolder(newFolderName.trim());
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  // Filter pages
  const filteredPages = pages.filter(p => {
    const pageFolder = p.folder || 'Geral';
    const matchesFolder = selectedFolder === 'all' || pageFolder === selectedFolder;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'published') return matchesFolder && matchesCategory && matchesSearch && p.status === 'published';
    if (activeTab === 'drafts') return matchesFolder && matchesCategory && matchesSearch && p.status === 'draft';
    return matchesFolder && matchesCategory && matchesSearch;
  });

  // Filter templates
  const filteredTemplates = INITIAL_PAGE_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalPublished = pages.filter(p => p.status === 'published').length;
  const totalViews = pages.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalConversions = pages.reduce((acc, p) => acc + (p.conversionsCount || 0), 0);
  const avgConversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
        
        {/* Brand Logo & Product Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-slate-950 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="vierstudio Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                vierstudio
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase">
                  Page Builder
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Construtor Profissional de Landing Pages</p>
            </div>
          </div>

          {/* Central Top Global Navigation Switcher: E-mails | Landing Pages | Mapas Mentais (Miro) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onChangeModule('emails')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeModule === 'emails' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>E-mails</span>
            </button>
            <button
              onClick={() => onChangeModule('pages')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeModule === 'pages' 
                  ? 'bg-white text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Landing Pages</span>
            </button>
            <button
              onClick={() => onChangeModule('boards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeModule === 'boards' 
                  ? 'bg-amber-400 text-slate-950 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Mapas Mentais (Miro)</span>
            </button>
          </nav>
        </div>

        {/* Search Input */}
        <div className="hidden lg:flex items-center relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar páginas ou modelos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Actions & User */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLeadsModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
            title="Visualizar contatos capturados pelos formulários"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Ver Leads ({totalConversions})</span>
          </button>

          <button
            onClick={onOpenMediaManager}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <span>Biblioteca</span>
          </button>

          <button
            onClick={onOpenAiCreator}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:opacity-95 rounded-xl shadow-sm transition-all cursor-pointer"
            title="Criar uma landing page completa preenchendo um briefing com IA"
          >
            <Wand2 className="w-4 h-4" />
            <span>Criar com IA</span>
          </button>

          <button
            onClick={() => onCreateNewPage('lead-capture')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Criar Nova Página</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User profile avatar badge */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs border-2 border-white">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-medium capitalize">Plano {user.plan}</div>
            </div>
          </div>
        </div>

      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 flex flex-col gap-6">

        {/* Top Summary Cards (Stats) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Páginas Publicadas</div>
              <div className="text-lg font-extrabold text-slate-900">{totalPublished} <span className="text-xs text-slate-400 font-normal">/ {pages.length} total</span></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Visualizações Totais</div>
              <div className="text-lg font-extrabold text-slate-900">{totalViews.toLocaleString('pt-BR')}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Leads Capturados</div>
              <div className="text-lg font-extrabold text-emerald-600">{totalConversions.toLocaleString('pt-BR')}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Taxa Média de Conversão</div>
              <div className="text-lg font-extrabold text-slate-900">{avgConversionRate}%</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Meus Projetos, Modelos Prontos, Publicadas, Rascunhos) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('my-pages')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'my-pages'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Minhas Páginas ({pages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ready-templates')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ready-templates'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Modelos Prontos ({INITIAL_PAGE_TEMPLATES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('published')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'published'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Publicadas ({totalPublished})</span>
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'drafts'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Rascunhos</span>
            </button>
          </div>

          {/* Folder Pills Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" /> Pasta:
            </span>
            <button
              onClick={() => setSelectedFolder('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedFolder === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todas
            </button>
            {folders.map(f => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  selectedFolder === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{f}</span>
              </button>
            ))}

            {isCreatingFolder ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Nome da pasta..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateFolderSubmit()}
                  autoFocus
                  className="text-xs px-2 py-0.5 border border-indigo-300 rounded-md outline-none bg-white w-28"
                />
                <button
                  onClick={handleCreateFolderSubmit}
                  className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-1 rounded-md"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="text-xs p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                title="Criar nova pasta"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Klickpages-style Horizontal Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {PAGE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* SECTION 1: MY PAGES TAB */}
        {activeTab !== 'ready-templates' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Create Page with AI Card */}
            <div
              onClick={onOpenAiCreator}
              className="group relative overflow-hidden border-2 border-indigo-300 hover:border-indigo-500 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] shadow-2xs hover:shadow-md"
            >
              <span className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Novo • IA
              </span>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white group-hover:scale-110 flex items-center justify-center transition-transform shadow-md mb-4">
                <Wand2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-1.5">Criar Página com IA</h3>
              <p className="text-xs text-slate-600 max-w-[220px] leading-relaxed">
                Preencha o briefing com produto, logo, fotos, preços, planos e paleta — a IA cria a LP inteira para você.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preencher Briefing</span>
              </span>
            </div>

            {/* Create Blank Page Card */}
            <div
              onClick={() => onCreateNewPage(selectedCategory === 'all' ? 'blank' : selectedCategory)}
              className="group border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 flex items-center justify-center transition-transform shadow-xs mb-4">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Nova Página em Branco</h3>
              <p className="text-xs text-slate-400 max-w-[200px]">
                Comece do zero com liberdade total de seções, colunas e blocos.
              </p>
            </div>

            {/* List of Pages */}
            {filteredPages.map(page => {
              const isPublished = page.status === 'published';
              const isMenuOpen = activeMenuId === page.id;

              return (
                <div
                  key={page.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
                >
                  {/* Visual Preview Header */}
                  <div 
                    onClick={() => onOpenPage(page)}
                    className="h-44 bg-slate-950 relative overflow-hidden cursor-pointer flex items-center justify-center group-hover:opacity-95"
                  >
                    {page.thumbnailData ? (
                      <img 
                        src={page.thumbnailData} 
                        alt={page.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center gap-2">
                        <Layout className="w-10 h-10 opacity-40" />
                        <span className="text-[11px] font-medium">Prévia da Página</span>
                      </div>
                    )}

                    {/* Status Pill Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {isPublished ? (
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Publicada
                        </span>
                      ) : (
                        <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                          Rascunho
                        </span>
                      )}
                    </div>

                    {/* Folder Pill */}
                    {page.folder && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                        {page.folder}
                      </div>
                    )}

                    {/* Hover Overlay Button */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenPage(page); }}
                        className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg hover:bg-slate-100 transition-colors"
                      >
                        Abrir Editor
                      </button>
                      {isPublished && (
                        <a
                          href={`/p/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
                          title="Abrir URL Pública"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          onClick={() => onOpenPage(page)}
                          className="font-bold text-sm text-slate-900 truncate hover:text-indigo-600 cursor-pointer flex-1"
                          title={page.name}
                        >
                          {page.name}
                        </h4>

                        {/* Three Dots Action Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : page.id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div 
                              className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => { setActiveMenuId(null); onOpenPage(page); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                              >
                                <Layout className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Editar Página</span>
                              </button>

                              <button
                                onClick={() => { setActiveMenuId(null); onTogglePublishPage(page.id); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                              >
                                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isPublished ? 'Despublicar' : 'Publicar Página'}</span>
                              </button>

                              {isPublished && (
                                <a
                                  href={`/p/${page.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => setActiveMenuId(null)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Ver URL Pública</span>
                                </a>
                              )}

                              <button
                                onClick={() => { setActiveMenuId(null); onDuplicatePage(page.id); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Duplicar</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1" />

                              <button
                                onClick={() => { setActiveMenuId(null); onDeletePage(page.id); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir Página</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                        /p/{page.slug}
                      </div>
                    </div>

                    {/* Stats & Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span title="Visualizações" className="flex items-center gap-1 font-semibold text-slate-700">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {page.viewsCount || 0}
                        </span>
                        <span title="Conversões" className="flex items-center gap-1 font-semibold text-emerald-600">
                          <Users className="w-3 h-3" />
                          {page.conversionsCount || 0}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {page.sections.length} {page.sections.length === 1 ? 'seção' : 'seções'}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SECTION 2: READY TEMPLATES GALLERY */}
        {activeTab === 'ready-templates' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(tmpl => (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg transition-all overflow-hidden flex flex-col group relative"
              >
                {/* Visual Cover */}
                <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={tmpl.thumbnailUrl} 
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {tmpl.badge && (
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                      {tmpl.badge}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {tmpl.categoryLabel}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {tmpl.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">100% Editável</span>
                    <button
                      onClick={() => onSelectTemplate(tmpl)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Usar Modelo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
