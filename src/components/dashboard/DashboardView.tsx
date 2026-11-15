import React, { useState } from 'react';
import { 
  Plus, Search, LayoutTemplate, Clock, Star, 
  FolderOpen, Settings, MoreVertical, Edit3, Copy, 
  Trash2, ShieldCheck, Download, Sparkles, Filter, 
  ShoppingBag, Briefcase, HeartHandshake, Tag, ExternalLink,
  Folder, FolderPlus, X, FileCode, UploadCloud, Globe, Mail
} from 'lucide-react';
import { EmailDocument, TemplateModel, UserProfile } from '../../types/email';
import { INITIAL_TEMPLATES } from '../../data/initialTemplates';
import { MoveToFolderModal } from '../modals/MoveToFolderModal';

interface DashboardViewProps {
  projects: EmailDocument[];
  folders: string[];
  activeModule?: 'emails' | 'pages' | 'boards';
  onChangeModule?: (mod: 'emails' | 'pages' | 'boards') => void;
  onOpenProject: (project: EmailDocument) => void;
  onCreateNewProject: () => void;
  onOpenImportModal: () => void;
  onSelectTemplate: (template: TemplateModel) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onMoveProject: (id: string, folder: string) => void;
  onCreateFolder: (name: string) => Promise<string | void>;
  onDeleteFolder: (name: string) => void;
  onOpenMediaManager: () => void;
  user: UserProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  folders,
  onOpenProject,
  onCreateNewProject,
  onOpenImportModal,
  onSelectTemplate,
  onDuplicateProject,
  onDeleteProject,
  onMoveProject,
  onCreateFolder,
  onDeleteFolder,
  onOpenMediaManager,
  activeModule = 'emails',
  onChangeModule,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'my-templates' | 'ready-models' | 'drafts' | 'favorites' | 'saas-plans'>('my-templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [moveModalProject, setMoveModalProject] = useState<EmailDocument | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim());
    setSelectedFolder(newFolderName.trim());
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  // Filter projects with folder filter
  const filteredProjects = projects.filter(p => {
    const projectFolder = p.folder || 'Geral';
    const matchesFolder = selectedFolder === 'all' || projectFolder === selectedFolder;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'drafts') return matchesFolder && matchesSearch && p.status === 'draft';
    if (activeTab === 'favorites') return matchesFolder && matchesSearch && p.status === 'favorite';
    return matchesFolder && matchesSearch;
  });

  // Filter ready templates
  const filteredReadyTemplates = INITIAL_TEMPLATES.filter(t => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-slate-950 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="vierstudio Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                vierstudio
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200 uppercase">
                  SaaS Pro
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Editor Profissional de E-mails Marketing</p>
            </div>
          </div>

          {/* Central Top Global Navigation Switcher: E-mails | Landing Pages | Mapas Mentais (Miro) */}
          {onChangeModule && (
            <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onChangeModule('emails')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeModule === 'emails' 
                    ? 'bg-white text-indigo-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>E-mails</span>
              </button>
              <button
                onClick={() => onChangeModule('pages')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeModule === 'boards' 
                    ? 'bg-amber-400 text-slate-950 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Mapas Mentais (Miro)</span>
              </button>
            </nav>
          )}
        </div>

        {/* Search Input */}
        <div className="hidden md:flex items-center relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar modelos ou projetos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* User Info & CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMediaManager}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <span>Biblioteca</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shadow-2xs"
            title="Importar arquivo .html ou colar código para modelar no editor"
          >
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span>Subir HTML</span>
          </button>

          <button
            onClick={onCreateNewProject}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Criar Novo E-mail</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User profile avatar badge */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs border-2 border-white">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-medium capitalize">Plano {user.plan}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-6 pb-28">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('my-templates')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'my-templates' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Meus Templates ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ready-models')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'ready-models' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Modelos Prontos ({INITIAL_TEMPLATES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'drafts' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Rascunhos</span>
            </button>

            <button
              onClick={() => setActiveTab('saas-plans')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'saas-plans' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Planos SaaS</span>
            </button>
          </div>

          {/* Category filter when viewing ready models */}
          {activeTab === 'ready-models' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Categoria:
              </span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'ecommerce', label: 'E-commerce' },
                { id: 'corporativo', label: 'Corporativo' },
                { id: 'relacionamento', label: 'Relacionamento' },
                { id: 'promocional', label: 'Promocional' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    categoryFilter === cat.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= FOLDERS TOOLBAR ================= */}
        {(activeTab === 'my-templates' || activeTab === 'drafts' || activeTab === 'favorites') && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 flex items-center gap-1.5 shrink-0">
                <Folder className="w-4 h-4 text-slate-400" /> Pastas:
              </span>

              <button
                onClick={() => setSelectedFolder('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedFolder === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
                }`}
              >
                <span>Todas</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${selectedFolder === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                  {projects.length}
                </span>
              </button>

              {folders.map(f => {
                const count = projects.filter(p => (p.folder || 'Geral') === f).length;
                const isSelected = selectedFolder === f;
                return (
                  <div
                    key={f}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const projId = e.dataTransfer.getData('application/vier-project-id');
                      if (projId) {
                        onMoveProject(projId, f);
                      }
                    }}
                    onClick={() => setSelectedFolder(f)}
                    title={`Clique para filtrar ou arraste um template para mover para "${f}"`}
                    className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'text-slate-700 hover:bg-indigo-50/50 bg-slate-50/70 border-slate-200/70 hover:border-indigo-300'
                    }`}
                  >
                    <span>{f}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}>
                      {count}
                    </span>

                    {f !== 'Geral' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Deseja realmente excluir a pasta "${f}"? Os templates serão movidos para "Geral".`)) {
                            onDeleteFolder(f);
                            if (selectedFolder === f) setSelectedFolder('all');
                          }
                        }}
                        title="Remover pasta"
                        className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 ${
                          isSelected ? 'hover:bg-indigo-700 text-indigo-200 hover:text-white' : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nova Pasta Action */}
            <div className="flex items-center gap-2 shrink-0 justify-end">
              {isCreatingFolder ? (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-indigo-300 rounded-xl px-2.5 py-1">
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="Nome da pasta..."
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateFolderSubmit()}
                    autoFocus
                    className="text-xs bg-transparent outline-none w-32 sm:w-40"
                  />
                  <button
                    onClick={handleCreateFolderSubmit}
                    disabled={!newFolderName.trim()}
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Nova Pasta</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= SECTION: MEUS TEMPLATES & DRAFTS ================= */}
        {(activeTab === 'my-templates' || activeTab === 'drafts' || activeTab === 'favorites') && (
          <div>
            {filteredProjects.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <LayoutTemplate className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Nenhum projeto encontrado</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Comece criando seu primeiro e-mail a partir de um modelo pronto ou tela em branco.
                </p>
                <button
                  onClick={onCreateNewProject}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Criar Primeiro E-mail
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Create New Card */}
                <div 
                  onClick={onCreateNewProject}
                  className="group border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-900">Novo E-mail em Branco</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Monte sua estrutura do zero com colunas e blocos customizados.</p>
                </div>

                {/* Import HTML Card */}
                <div 
                  onClick={onOpenImportModal}
                  className="group border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/70 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-indigo-200 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-3 shadow-2xs">
                    <FileCode className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-indigo-950 group-hover:text-indigo-900">Subir Template HTML</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Suba modelos de e-mail já existentes (.html) para modelar e editar visualmente.</p>
                  <span className="mt-3 px-3 py-1 bg-white border border-indigo-200 text-indigo-700 text-[11px] font-bold rounded-lg shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Upload ou Código →
                  </span>
                </div>

                {/* Project Cards */}
                {filteredProjects.map(project => {
                  const isMenuOpen = activeMenuId === project.id;
                  return (
                    <div 
                      key={project.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/vier-project-id', project.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`group bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-2xl transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing relative ${
                        isMenuOpen ? 'z-40 ring-2 ring-indigo-500/20 shadow-lg' : 'z-10'
                      }`}
                    >
                      {/* Real Miniature Thumbnail Area */}
                      <div 
                        onClick={() => onOpenProject(project)}
                        className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden rounded-t-2xl border-b border-slate-100"
                      >
                        {project.thumbnailData ? (
                          <img 
                            src={project.thumbnailData} 
                            alt={project.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
                            <LayoutTemplate className="w-10 h-10 text-slate-300 mb-2" />
                            <span className="text-xs font-semibold text-slate-400">{project.rows.length} Seções</span>
                          </div>
                        )}

                        {/* Status & Folder Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-white/90 backdrop-blur-xs text-slate-700 font-bold text-[10px] px-2.5 py-1 rounded-md shadow-2xs uppercase tracking-wider">
                            {project.status || 'Rascunho'}
                          </span>
                          <span className="bg-indigo-600/95 backdrop-blur-xs text-white font-semibold text-[10px] px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1">
                            <Folder className="w-3 h-3" />
                            <span>{project.folder || 'Geral'}</span>
                          </span>
                        </div>

                        {/* Quick Edit Overlay */}
                        <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-4 py-2 bg-white text-indigo-700 text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <Edit3 className="w-3.5 h-3.5" /> Abrir no Editor
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 
                              onClick={() => onOpenProject(project)}
                              className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer line-clamp-1"
                              title={project.name}
                            >
                              {project.name}
                            </h3>

                            {/* Options dropdown button */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(isMenuOpen ? null : project.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isMenuOpen ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                                title="Mais opções"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {isMenuOpen && (
                                <>
                                  {/* Click outside backdrop */}
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} 
                                  />
                                  {/* Dropdown Menu Floating Box */}
                                  <div 
                                    className="absolute right-0 top-8 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => { setActiveMenuId(null); onOpenProject(project); }}
                                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium transition-colors"
                                    >
                                      <Edit3 className="w-4 h-4 text-slate-500" /> Editar E-mail
                                    </button>
                                    <button
                                      onClick={() => { setActiveMenuId(null); setMoveModalProject(project); }}
                                      className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-indigo-700 font-semibold transition-colors"
                                    >
                                      <Folder className="w-4 h-4 text-indigo-600" /> Mover para Pasta...
                                    </button>
                                    <button
                                      onClick={() => { setActiveMenuId(null); onDuplicateProject(project.id); }}
                                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium transition-colors"
                                    >
                                      <Copy className="w-4 h-4 text-slate-500" /> Duplicar Modelo
                                    </button>
                                    <div className="border-t border-slate-100 my-1" />
                                    <button
                                      onClick={() => { setActiveMenuId(null); onDeleteProject(project.id); }}
                                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-semibold transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4 text-rose-500" /> Excluir E-mail
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 mt-1 line-clamp-1" title={project.subject}>
                            {project.subject || 'Sem assunto definido'}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Atualizado há pouco</span>
                          <span className="font-mono">{project.rows.length} seções</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION: MODELOS PRONTOS (TEMPLATES GALLERY) ================= */}
        {activeTab === 'ready-models' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Galeria de Modelos Profissionais</h2>
                <p className="text-xs text-slate-500">
                  Modelos 100% editáveis no canvas, desenhados para máxima conversão e compatibilidade com e-mail marketing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReadyTemplates.map(tmpl => (
                <div 
                  key={tmpl.id}
                  className="group bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg rounded-2xl overflow-hidden transition-all flex flex-col justify-between"
                >
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img 
                      src={tmpl.thumbnailUrl} 
                      alt={tmpl.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    
                    {tmpl.badge && (
                      <span className="absolute top-3 left-3 bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                        {tmpl.badge}
                      </span>
                    )}

                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        onClick={() => onSelectTemplate(tmpl)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                      >
                        Usar este Modelo
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase mb-1">
                        {tmpl.category === 'ecommerce' && <ShoppingBag className="w-3.5 h-3.5" />}
                        {tmpl.category === 'corporativo' && <Briefcase className="w-3.5 h-3.5" />}
                        {tmpl.category === 'relacionamento' && <HeartHandshake className="w-3.5 h-3.5" />}
                        {tmpl.category === 'promocional' && <Tag className="w-3.5 h-3.5" />}
                        <span>{tmpl.categoryLabel}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">{tmpl.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tmpl.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        100% Editável
                      </span>
                      <button
                        onClick={() => onSelectTemplate(tmpl)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Personalizar →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION: PLANOS SAAS ================= */}
        {activeTab === 'saas-plans' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Planos Comerciais vierstudio</h2>
              <p className="text-xs text-slate-500">
                Soluções completas para criadores, agências e corporações com renderização Outlook VML e exportação HTML ilimitada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  id: 'starter',
                  name: 'Starter',
                  price: 'R$ 49',
                  period: '/mês',
                  desc: 'Para autônomos e criadores iniciantes',
                  features: ['Até 5 projetos ativos', 'Editor Drag & Drop completo', 'Exportação HTML compatível', 'Suporte por e-mail']
                },
                {
                  id: 'pro',
                  name: 'Profissional',
                  price: 'R$ 99',
                  period: '/mês',
                  desc: 'Para pequenas empresas e profissionais de marketing',
                  popular: true,
                  features: ['Até 50 projetos ativos', 'Botões Outlook VML bulletproof', 'Todos os modelos profissionais', 'Auditoria contra clipping Gmail', 'Armazenamento de 2 GB de imagens']
                },
                {
                  id: 'enterprise',
                  name: 'Enterprise',
                  price: 'R$ 249',
                  period: '/mês',
                  desc: 'Para agências e times corporativos de alta demanda',
                  features: ['Projetos ilimitados', 'Templates personalizados da marca', 'Armazenamento de 20 GB', 'Múltiplos usuários por conta', 'Simulador de entrega e suporte VIP']
                }
              ].map(plan => (
                <div 
                  key={plan.id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                    plan.popular ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xl' : 'border-slate-200'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                      Mais Escolhido
                    </span>
                  )}

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{plan.desc}</p>
                    <div className="my-4">
                      <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                        plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {user.plan === plan.id ? 'Plano Atual Ativo' : 'Escolher este Plano'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal Mover para Pasta */}
      <MoveToFolderModal
        isOpen={!!moveModalProject}
        onClose={() => setMoveModalProject(null)}
        project={moveModalProject}
        folders={folders}
        onMove={(projId, targetFolder) => onMoveProject(projId, targetFolder)}
        onCreateFolder={onCreateFolder}
      />

    </div>
  );
};
