import React, { useState, useEffect, useRef } from 'react';
import { EmailDocument, EmailBlock, EmailRow, EmailBlockType, SavedBlockItem, TemplateModel, UserProfile, GlobalEmailSettings } from './types/email';
import { PageDocument, PageTemplateModel, PageCategoryType, PageStatus } from './types/page';
import { BoardDocument } from './types/board';
import { createBlankDocument, createNewBlock, createNewRow, createProductShowcaseRow } from './utils/defaults';
import { createBlankPageDocument } from './utils/pageDefaults';
import { PRESET_SAVED_BLOCKS } from './data/initialBlocks';
import { DashboardView } from './components/dashboard/DashboardView';
import { EditorTopBar } from './components/editor/EditorTopBar';
import { LeftSidebar } from './components/editor/LeftSidebar';
import { CanvasArea } from './components/editor/CanvasArea';
import { RightSidebar } from './components/editor/RightSidebar';
import { PageDashboardView } from './components/pages/PageDashboardView';
import { PageEditorView } from './components/pages/PageEditorView';
import { BoardDashboardView } from './components/boards/BoardDashboardView';
import { BoardEditorView } from './components/boards/BoardEditorView';
import { FileManagerModal } from './components/modals/FileManagerModal';
import { ExportModal } from './components/modals/ExportModal';
import { EmailTesterModal } from './components/modals/EmailTesterModal';
import { SaveBlockModal } from './components/modals/SaveBlockModal';
import { ImportHtmlModal } from './components/modals/ImportHtmlModal';
import { LeadSubmissionsModal } from './components/modals/LeadSubmissionsModal';
import { AiPageGeneratorModal } from './components/modals/AiPageGeneratorModal';
import { flushDomEditsToDoc, extractEmailMainBanner } from './utils/domSync';

export const App: React.FC = () => {
  // Global Product Switcher ('emails' | 'pages' | 'boards')
  const [activeProduct, setActiveProduct] = useState<'emails' | 'pages' | 'boards'>(() => {
    try {
      return (localStorage.getItem('vierstudio_active_product') as any) || 'emails';
    } catch {
      return 'emails';
    }
  });

  const handleSetActiveProduct = (prod: 'emails' | 'pages' | 'boards') => {
    setActiveProduct(prod);
    try {
      localStorage.setItem('vierstudio_active_product', prod);
    } catch {}
  };

  // Navigation & Views for Miro Boards / Mind Maps
  const [currentBoard, setCurrentBoard] = useState<BoardDocument | null>(null);
  const [currentBoardView, setCurrentBoardView] = useState<'dashboard' | 'editor'>('dashboard');

  // Navigation & Views for Emails
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  // Navigation & Views for Landing Pages
  const [pageProjects, setPageProjects] = useState<PageDocument[]>([]);
  const [pageFolders, setPageFolders] = useState<string[]>(['Geral', 'Páginas de Captura', 'Páginas de Vendas', 'Lançamentos 2026']);
  const [currentPageProject, setCurrentPageProject] = useState<PageDocument | null>(null);
  const [currentPageView, setCurrentPageView] = useState<'dashboard' | 'editor'>('dashboard');
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [isAiPageModalOpen, setIsAiPageModalOpen] = useState(false);

  // Persistence & Data
  const [projects, setProjects] = useState<EmailDocument[]>([]);
  const [templateFolders, setTemplateFolders] = useState<string[]>(['Geral', 'Campanhas 2026', 'E-commerce & Vendas', 'Transacionais', 'Boas-Vindas']);
  const [currentProject, setCurrentProject] = useState<EmailDocument | null>(null);
  const [savedBlocks, setSavedBlocks] = useState<SavedBlockItem[]>(PRESET_SAVED_BLOCKS);
  const [user, setUser] = useState<UserProfile>({
    id: 'user-lucas-01',
    name: 'Lucas Silveira',
    email: 'lucas@vierstudio.com.br',
    role: 'admin',
    company: 'vierstudio SaaS',
    plan: 'enterprise'
  });

  // Editor Active Selection
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Modals
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTesterModalOpen, setIsTesterModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaveBlockModalOpen, setIsSaveBlockModalOpen] = useState(false);
  const [saveBlockTarget, setSaveBlockTarget] = useState<EmailBlock | EmailRow | null>(null);
  const [saveBlockIsRow, setSaveBlockIsRow] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<EmailDocument[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Auto-save status
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<any>(null);
  const currentProjectRef = useRef<EmailDocument | null>(currentProject);

  useEffect(() => {
    currentProjectRef.current = currentProject;
  }, [currentProject]);

  // Synchronize a project into React state and localStorage immediately
  const syncToLocalProjects = (docToSave: EmailDocument) => {
    // Ensure docToSave reflects the primary banner of the email
    const banner = extractEmailMainBanner(docToSave);
    if (banner) {
      docToSave.thumbnailData = banner;
    }

    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === docToSave.id);
      const next = idx >= 0
        ? prev.map(p => p.id === docToSave.id ? docToSave : p)
        : [docToSave, ...prev];
      try {
        localStorage.setItem('vierstudio_email_projects', JSON.stringify(next));
      } catch (err) {
        console.warn('Falha no armazenamento local completo, podando miniaturas antigas:', err);
        try {
          // If quota exceeded, prune thumbnails from older projects
          const pruned = next.map((p, i) => i === 0 ? p : { ...p, thumbnailData: undefined });
          localStorage.setItem('vierstudio_email_projects', JSON.stringify(pruned));
        } catch (e) {
          console.error('Limite crítico de localStorage atingido:', e);
        }
      }
      return next;
    });

    try {
      localStorage.setItem('vierstudio_active_project_backup', JSON.stringify(docToSave));
    } catch (e) {}
  };

  // Immediate save (both local and server)
  const handleSaveProject = async (targetDoc?: EmailDocument | null, _showFeedback = true) => {
    const baseDoc = targetDoc || currentProjectRef.current || currentProject;
    if (!baseDoc) return;

    // 1. Flush any active DOM edits from contentEditable into the document
    const docToSave = flushDomEditsToDoc(baseDoc) || baseDoc;
    docToSave.updatedAt = new Date().toISOString();

    // 2. Synchronize main banner to thumbnailData
    const banner = extractEmailMainBanner(docToSave);
    if (banner) {
      docToSave.thumbnailData = banner;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setIsSaving(true);
    currentProjectRef.current = docToSave;
    setCurrentProject(docToSave);

    // 3. Synchronize to localStorage immediately
    syncToLocalProjects(docToSave);

    // 4. Persist to server database
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docToSave)
      });
      const data = await res.json();
      if (data.success && data.project) {
        setLastSavedAt(new Date());
      }
    } catch (err) {
      console.error('Falha ao salvar projeto no servidor:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save as a new template in the user library
  const handleSaveAsNewTemplate = async () => {
    const baseDoc = currentProjectRef.current || currentProject;
    if (!baseDoc) return;
    const flushed = flushDomEditsToDoc(baseDoc) || baseDoc;
    const templateName = prompt('Nome do novo template:', `${flushed.name} (Template)`);
    if (!templateName || !templateName.trim()) return;

    const banner = extractEmailMainBanner(flushed);

    const newTemplateDoc: EmailDocument = {
      ...JSON.parse(JSON.stringify(flushed)),
      id: `proj-tmpl-${Date.now()}`,
      name: templateName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      folder: 'Meus Templates',
      thumbnailData: banner || flushed.thumbnailData
    };

    await handleSaveProject(newTemplateDoc, true);
    setCurrentProject(newTemplateDoc);
    alert(`Template "${newTemplateDoc.name}" salvo com sucesso na sua biblioteca!`);
  };

  // Immediate save and return to dashboard
  const handleBackToDashboard = async () => {
    const base = currentProjectRef.current || currentProject;
    if (base) {
      const flushed = flushDomEditsToDoc(base) || base;
      await handleSaveProject(flushed, false);
    }
    setSelectedBlockId(null);
    setSelectedRowId(null);
    setCurrentView('dashboard');
  };

  // Save a brand new project from templates or duplication
  const handleSaveNewProject = async (newDoc: EmailDocument) => {
    syncToLocalProjects(newDoc);
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
    } catch (err) {
      console.error('Error saving new project:', err);
    }
  };

  // Save on tab close or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const base = currentProjectRef.current || currentProject;
      if (base) {
        const flushed = flushDomEditsToDoc(base) || base;
        flushed.updatedAt = new Date().toISOString();
        try {
          const raw = localStorage.getItem('vierstudio_email_projects');
          const list: EmailDocument[] = raw ? JSON.parse(raw) : [];
          const idx = list.findIndex(p => p.id === flushed.id);
          if (idx >= 0) list[idx] = flushed;
          else list.unshift(flushed);
          localStorage.setItem('vierstudio_email_projects', JSON.stringify(list));
          localStorage.setItem('vierstudio_active_project_backup', JSON.stringify(flushed));
        } catch (e) {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Initial Load from API & localStorage
  useEffect(() => {
    // 1. Instant load from localStorage so user never sees empty screen
    try {
      const rawLocal = localStorage.getItem('vierstudio_email_projects');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const synced = parsed.map((p: EmailDocument) => {
            const banner = extractEmailMainBanner(p);
            return banner ? { ...p, thumbnailData: banner } : p;
          });
          setProjects(synced);
        }
      }
    } catch (e) {
      console.warn('Could not read projects from localStorage', e);
    }

    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [projRes, blocksRes, userRes, foldersRes, pagesRes, pageFoldersRes] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/blocks').then(r => r.json()),
        fetch('/api/saas/me').then(r => r.json()),
        fetch('/api/template-folders').then(r => r.json()),
        fetch('/api/pages').then(r => r.json()),
        fetch('/api/page-folders').then(r => r.json())
      ]);

      if (projRes.success && Array.isArray(projRes.projects)) {
        setProjects(prev => {
          const mergedMap = new Map<string, EmailDocument>();
          // Seed with server projects
          projRes.projects.forEach((p: EmailDocument) => mergedMap.set(p.id, p));
          // Merge with local projects
          prev.forEach(localP => {
            const serverP = mergedMap.get(localP.id);
            if (!serverP) {
              mergedMap.set(localP.id, localP);
              // Push local project to server
              fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localP)
              }).catch(() => {});
            } else {
              const localTime = new Date(localP.updatedAt || 0).getTime();
              const serverTime = new Date(serverP.updatedAt || 0).getTime();
              if (localTime > serverTime) {
                mergedMap.set(localP.id, localP);
                // Push newer local project to server
                fetch('/api/projects', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(localP)
                }).catch(() => {});
              }
            }
          });
          const finalList = Array.from(mergedMap.values()).map(p => {
            const banner = extractEmailMainBanner(p);
            return banner ? { ...p, thumbnailData: banner } : p;
          });
          try {
            localStorage.setItem('vierstudio_email_projects', JSON.stringify(finalList));
          } catch (err) {
            console.warn(err);
          }
          return finalList;
        });
      }
      if (blocksRes.success && blocksRes.blocks) {
        setSavedBlocks(blocksRes.blocks);
      }
      if (userRes.success && userRes.user) {
        setUser(userRes.user);
      }
      if (foldersRes.success && foldersRes.folders) {
        setTemplateFolders(foldersRes.folders);
      }
      if (pagesRes.success && pagesRes.pages) {
        setPageProjects(pagesRes.pages);
      }
      if (pageFoldersRes.success && pageFoldersRes.folders) {
        setPageFolders(pageFoldersRes.folders);
      }
    } catch (err) {
      console.error('Failed to load initial data from server', err);
    }
  };

  // Keyboard Shortcuts (Undo/Redo, Escape, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (currentView === 'editor' && (currentProjectRef.current || currentProject)) {
          handleSaveProject(currentProjectRef.current || currentProject, true);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      } else if (e.key === 'Escape') {
        setSelectedBlockId(null);
        setSelectedRowId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Push new state to undo/redo history
  const pushToHistory = (newDoc: EmailDocument) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const banner = extractEmailMainBanner(newDoc);
    if (banner) {
      newDoc.thumbnailData = banner;
    }

    currentProjectRef.current = newDoc;
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, JSON.parse(JSON.stringify(newDoc))];
    });
    setHistoryIndex(prev => prev + 1);

    // Sync to local projects immediately (no debounce for local state!)
    syncToLocalProjects(newDoc);

    // Auto-save debounce
    triggerAutoSave(newDoc);
  };

  const triggerAutoSave = (docToSave: EmailDocument) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);

    saveTimeoutRef.current = setTimeout(async () => {
      const latest = flushDomEditsToDoc(currentProjectRef.current || docToSave) || docToSave;
      latest.updatedAt = new Date().toISOString();
      const banner = extractEmailMainBanner(latest);
      if (banner) {
        latest.thumbnailData = banner;
      }
      currentProjectRef.current = latest;
      syncToLocalProjects(latest);
      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(latest)
        });
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('Auto-save error', err);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  };

  // Continuous background auto-save while editor is open (every 8 seconds)
  useEffect(() => {
    if (currentView !== 'editor') return;

    const interval = setInterval(() => {
      const base = currentProjectRef.current || currentProject;
      if (base) {
        const flushed = flushDomEditsToDoc(base);
        if (flushed) {
          handleSaveProject(flushed, false);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [currentView]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const targetDoc = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentProject(JSON.parse(JSON.stringify(targetDoc)));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const targetDoc = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentProject(JSON.parse(JSON.stringify(targetDoc)));
    }
  };

  // Open Project in Editor
  const handleOpenProject = (project: EmailDocument) => {
    const clone = JSON.parse(JSON.stringify(project));
    setCurrentProject(clone);
    setHistory([clone]);
    setHistoryIndex(0);
    setSelectedBlockId(null);
    setSelectedRowId(null);
    setCurrentView('editor');
  };

  // Create New Project Blank
  const handleCreateNewProject = () => {
    const blank = createBlankDocument();
    setCurrentProject(blank);
    setHistory([blank]);
    setHistoryIndex(0);
    setSelectedBlockId(null);
    setSelectedRowId(null);
    setCurrentView('editor');
    triggerAutoSave(blank);
  };

  // Import HTML Project
  const handleImportHtmlProject = (importedDoc: EmailDocument) => {
    setCurrentProject(importedDoc);
    setProjects(prev => [importedDoc, ...prev]);
    setHistory([importedDoc]);
    setHistoryIndex(0);
    setSelectedBlockId(null);
    setSelectedRowId(null);
    setCurrentView('editor');
    triggerAutoSave(importedDoc);
  };

  // Select Ready Template Model
  const handleSelectTemplate = (template: TemplateModel) => {
    // 1. Check if an edited version already exists
    const existing = projects.find(p => 
      p.id === `proj-${template.id}` || 
      p.id === template.id || 
      (p as any).templateId === template.id ||
      p.name === template.name ||
      p.name === `${template.name} (Meu E-mail)`
    );

    if (existing) {
      handleOpenProject(existing);
      return;
    }

    const newDoc: EmailDocument = {
      ...JSON.parse(JSON.stringify(template.document)),
      id: `proj-${template.id}`,
      name: template.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      thumbnailData: template.thumbnailUrl,
      folder: template.document.folder || 'Campanhas 2026'
    };
    (newDoc as any).templateId = template.id;

    syncToLocalProjects(newDoc);
    setCurrentProject(newDoc);
    currentProjectRef.current = newDoc;
    setHistory([newDoc]);
    setHistoryIndex(0);
    setSelectedBlockId(null);
    setSelectedRowId(null);
    setCurrentView('editor');
    triggerAutoSave(newDoc);
  };

  // Move Project to Folder
  const handleMoveProject = async (id: string, folder: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, folder } : p));
        if (currentProject?.id === id) {
          setCurrentProject(prev => prev ? { ...prev, folder } : null);
        }
      }
    } catch (err) {
      console.error('Failed to move project', err);
    }
  };

  // Create Template Folder
  const handleCreateTemplateFolder = async (name: string): Promise<string | void> => {
    try {
      const res = await fetch('/api/template-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success && data.folders) {
        setTemplateFolders(data.folders);
        return name;
      }
    } catch (err) {
      console.error('Failed to create folder', err);
    }
  };

  // Delete Template Folder
  const handleDeleteTemplateFolder = async (name: string) => {
    try {
      const res = await fetch(`/api/template-folders/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success && data.folders) {
        setTemplateFolders(data.folders);
        setProjects(prev => prev.map(p => p.folder === name ? { ...p, folder: 'Geral' } : p));
      }
    } catch (err) {
      console.error('Failed to delete folder', err);
    }
  };

  // Duplicate Project / Template
  const handleDuplicateProject = async (id: string) => {
    const original = projects.find(p => p.id === id);
    if (!original) return;
    const copy: EmailDocument = {
      ...JSON.parse(JSON.stringify(original)),
      id: `proj-${Date.now()}`,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    syncToLocalProjects(copy);
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy)
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Project / Template
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Deseja realmente remover este template/e-mail?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('vierstudio_email_projects', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setCurrentView('dashboard');
    }
  };

  // ===================== PAGE BUILDER HANDLERS =====================
  const handleCreateNewPage = async (category: PageCategoryType = 'lead-capture') => {
    const newPage = createBlankPageDocument('Nova Landing Page', category);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage)
      });
      const data = await res.json();
      if (data.success && data.page) {
        setPageProjects(prev => [data.page, ...prev]);
        setCurrentPageProject(data.page);
        setCurrentPageView('editor');
      }
    } catch (err) {
      console.error('Failed to create page:', err);
      setPageProjects(prev => [newPage, ...prev]);
      setCurrentPageProject(newPage);
      setCurrentPageView('editor');
    }
  };

  const handleOpenPage = (pageToOpen: PageDocument) => {
    setCurrentPageProject(pageToOpen);
    setCurrentPageView('editor');
  };

  const handleSelectPageTemplate = async (tmpl: PageTemplateModel) => {
    const newPage: PageDocument = {
      ...JSON.parse(JSON.stringify(tmpl.document)),
      id: `page-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${tmpl.name} (Meu Projeto)`,
      slug: `${tmpl.document.slug}-${Date.now().toString(36)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage)
      });
      const data = await res.json();
      if (data.success && data.page) {
        setPageProjects(prev => [data.page, ...prev]);
        setCurrentPageProject(data.page);
        setCurrentPageView('editor');
      }
    } catch (err) {
      setPageProjects(prev => [newPage, ...prev]);
      setCurrentPageProject(newPage);
      setCurrentPageView('editor');
    }
  };

  const handleSavePage = async (pageToSave: PageDocument) => {
    try {
      await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageToSave)
      });
      setPageProjects(prev => prev.map(p => p.id === pageToSave.id ? pageToSave : p));
    } catch (err) {
      console.error('Failed to save page:', err);
    }
  };

  const handleDuplicatePage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.page) {
        setPageProjects(prev => [data.page, ...prev]);
      }
    } catch (err) {
      console.error('Failed to duplicate page:', err);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta landing page?')) return;
    try {
      await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      setPageProjects(prev => prev.filter(p => p.id !== id));
      if (currentPageProject?.id === id) {
        setCurrentPageProject(null);
        setCurrentPageView('dashboard');
      }
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  };

  const handleTogglePublishPage = async (id: string) => {
    const pageToToggle = pageProjects.find(p => p.id === id);
    if (!pageToToggle) return;
    const newStatus: PageStatus = pageToToggle.status === 'published' ? 'unpublished' : 'published';
    const updated: PageDocument = {
      ...pageToToggle,
      status: newStatus,
      publishedAt: newStatus === 'published' ? new Date().toISOString() : pageToToggle.publishedAt
    };
    await handleSavePage(updated);
  };

  const handleMovePage = async (id: string, folder: string) => {
    try {
      const res = await fetch(`/api/pages/${id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder })
      });
      const data = await res.json();
      if (data.success && data.page) {
        setPageProjects(prev => prev.map(p => p.id === id ? data.page : p));
      }
    } catch (err) {
      console.error('Failed to move page to folder:', err);
    }
  };

  const handleCreatePageFolder = async (name: string) => {
    try {
      const res = await fetch('/api/page-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success && data.folders) {
        setPageFolders(data.folders);
      }
    } catch (err) {
      console.error('Failed to create page folder:', err);
    }
  };

  const handleDeletePageFolder = async (name: string) => {
    try {
      const res = await fetch(`/api/page-folders/${encodeURIComponent(name)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.folders) {
        setPageFolders(data.folders);
        const pagesRes = await fetch('/api/pages').then(r => r.json());
        if (pagesRes.success && pagesRes.pages) setPageProjects(pagesRes.pages);
      }
    } catch (err) {
      console.error('Failed to delete page folder:', err);
    }
  };

  // Block & Row Operations in Canvas
  const handleSelectBlock = (block: EmailBlock, row: EmailRow) => {
    setSelectedBlockId(block.id);
    setSelectedRowId(row.id);
  };

  const handleSelectRow = (row: EmailRow) => {
    setSelectedRowId(row.id || null);
    setSelectedBlockId(null);
  };

  const handleUpdateBlock = (updated: EmailBlock) => {
    const base = currentProjectRef.current || currentProject;
    if (!base) return;
    const nextDoc: EmailDocument = {
      ...base,
      updatedAt: new Date().toISOString(),
      rows: base.rows.map(row => ({
        ...row,
        columns: row.columns.map(col => ({
          ...col,
          blocks: col.blocks.map(b => b.id === updated.id ? updated : b)
        }))
      }))
    };
    currentProjectRef.current = nextDoc;
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  const handleUpdateRow = (updated: EmailRow) => {
    const base = currentProjectRef.current || currentProject;
    if (!base) return;
    const nextDoc: EmailDocument = {
      ...base,
      updatedAt: new Date().toISOString(),
      rows: base.rows.map(r => r.id === updated.id ? updated : r)
    };
    currentProjectRef.current = nextDoc;
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  // Real-time silent sync from contentEditable DOM to in-memory ref
  const handleLiveDomChange = (blockId: string, field: string | undefined, html: string, text: string) => {
    const base = currentProjectRef.current || currentProject;
    if (!base) return;
    const nextDoc: EmailDocument = {
      ...base,
      updatedAt: new Date().toISOString(),
      rows: base.rows.map(row => ({
        ...row,
        columns: row.columns.map(col => ({
          ...col,
          blocks: col.blocks.map(b => {
            if (b.id !== blockId) return b;
            return {
              ...b,
              content: field
                ? { ...b.content, [field]: html }
                : { ...b.content, html, text }
            };
          })
        }))
      }))
    };
    currentProjectRef.current = nextDoc;
  };

  const handleDuplicateBlock = (blockId: string) => {
    if (!currentProject) return;
    let foundBlock: EmailBlock | null = null;

    const nextRows = currentProject.rows.map(row => ({
      ...row,
      columns: row.columns.map(col => {
        const bIdx = col.blocks.findIndex(b => b.id === blockId);
        if (bIdx >= 0) {
          foundBlock = col.blocks[bIdx];
          const cloned: EmailBlock = {
            ...JSON.parse(JSON.stringify(foundBlock)),
            id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
          };
          const nextBlocks = [...col.blocks];
          nextBlocks.splice(bIdx + 1, 0, cloned);
          return { ...col, blocks: nextBlocks };
        }
        return col;
      })
    }));

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!currentProject) return;
    const nextRows = currentProject.rows.map(row => ({
      ...row,
      columns: row.columns.map(col => ({
        ...col,
        blocks: col.blocks.filter(b => b.id !== blockId)
      }))
    }));

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!currentProject) return;
    const nextRows = currentProject.rows.map(row => ({
      ...row,
      columns: row.columns.map(col => {
        const idx = col.blocks.findIndex(b => b.id === blockId);
        if (idx === -1) return col;

        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= col.blocks.length) return col;

        const nextBlocks = [...col.blocks];
        const [moved] = nextBlocks.splice(idx, 1);
        nextBlocks.splice(targetIdx, 0, moved);
        return { ...col, blocks: nextBlocks };
      })
    }));

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  const handleDuplicateRow = (rowId: string) => {
    if (!currentProject) return;
    const rIdx = currentProject.rows.findIndex(r => r.id === rowId);
    if (rIdx === -1) return;

    const originalRow = currentProject.rows[rIdx];
    const clonedRow: EmailRow = {
      ...JSON.parse(JSON.stringify(originalRow)),
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      columns: originalRow.columns.map(c => ({
        ...JSON.parse(JSON.stringify(c)),
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        blocks: c.blocks.map(b => ({
          ...JSON.parse(JSON.stringify(b)),
          id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
        }))
      }))
    };

    const nextRows = [...currentProject.rows];
    nextRows.splice(rIdx + 1, 0, clonedRow);
    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  const handleDeleteRow = (rowId: string) => {
    if (!currentProject) return;
    if (currentProject.rows.length <= 1) {
      alert('O e-mail deve conter pelo menos uma seção.');
      return;
    }

    const nextRows = currentProject.rows.filter(r => r.id !== rowId);
    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    if (selectedRowId === rowId) {
      setSelectedRowId(null);
      setSelectedBlockId(null);
    }
  };

  const handleMoveRow = (rowId: string, direction: 'up' | 'down') => {
    if (!currentProject) return;
    const idx = currentProject.rows.findIndex(r => r.id === rowId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentProject.rows.length) return;

    const nextRows = [...currentProject.rows];
    const [moved] = nextRows.splice(idx, 1);
    nextRows.splice(targetIdx, 0, moved);

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  // Add block to first column or selected column
  const handleAddBlock = (type: EmailBlockType) => {
    if (!currentProject) return;
    const newBlock = createNewBlock(type);

    let inserted = false;
    const nextRows = currentProject.rows.map(row => {
      // If a row is selected or has selected block, insert there
      if ((selectedRowId && row.id === selectedRowId) || (!inserted && !selectedRowId)) {
        inserted = true;
        const targetCol = row.columns[0];
        return {
          ...row,
          columns: row.columns.map((col, idx) => idx === 0 ? { ...col, blocks: [...col.blocks, newBlock] } : col)
        };
      }
      return row;
    });

    if (!inserted) {
      // Create new 1-col row
      const newRow = createNewRow('1-col');
      newRow.columns[0].blocks.push(newBlock);
      nextRows.push(newRow);
    }

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    setSelectedBlockId(newBlock.id);
  };

  // Add new Row layout
  const handleAddRow = (layout: EmailRow['layout']) => {
    if (!currentProject) return;
    const newRow = createNewRow(layout);
    const nextDoc = { ...currentProject, rows: [...currentProject.rows, newRow] };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    setSelectedRowId(newRow.id);
    setSelectedBlockId(null);
  };

  // Add Product Showcase Row (with 1 to 4 customizable windows)
  const handleAddShowcaseRow = (count: number = 3) => {
    if (!currentProject) return;
    const newRow = createProductShowcaseRow(count);
    const nextDoc = { ...currentProject, rows: [...currentProject.rows, newRow] };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    setSelectedRowId(newRow.id);
    setSelectedBlockId(null);
  };

  // Add Saved Reusable Block Item
  const handleAddSavedBlock = (item: SavedBlockItem) => {
    if (!currentProject) return;
    if (item.isRow) {
      const clonedRow: EmailRow = {
        ...JSON.parse(JSON.stringify(item.block)),
        id: `row-${Date.now()}`
      };
      const nextDoc = { ...currentProject, rows: [...currentProject.rows, clonedRow] };
      setCurrentProject(nextDoc);
      pushToHistory(nextDoc);
    } else {
      const clonedBlock: EmailBlock = {
        ...JSON.parse(JSON.stringify(item.block)),
        id: `blk-${Date.now()}`
      };
      handleAddBlock(clonedBlock.type);
    }
  };

  // Delete saved block item
  const handleDeleteSavedBlock = async (id: string) => {
    try {
      await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
      setSavedBlocks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Drop Block from Drag & Drop into column
  const handleDropBlockIntoColumn = (type: string, rowId: string, colId: string, index?: number) => {
    if (!currentProject) return;
    const newBlock = createNewBlock(type as EmailBlockType);

    const nextRows = currentProject.rows.map(row => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        columns: row.columns.map(col => {
          if (col.id !== colId) return col;
          const nextBlocks = [...col.blocks];
          if (typeof index === 'number' && index >= 0 && index <= nextBlocks.length) {
            nextBlocks.splice(index, 0, newBlock);
          } else {
            nextBlocks.push(newBlock);
          }
          return { ...col, blocks: nextBlocks };
        })
      };
    });

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    setSelectedBlockId(newBlock.id);
  };

  // Move existing block from anywhere to a specific target column & index
  const handleMoveBlockToPosition = (blockId: string, targetRowId: string, targetColId: string, targetIndex?: number) => {
    if (!currentProject) return;

    let extractedBlock: EmailBlock | null = null;

    // First remove the block from its original position
    const rowsWithoutBlock = currentProject.rows.map(row => ({
      ...row,
      columns: row.columns.map(col => {
        const found = col.blocks.find(b => b.id === blockId);
        if (found) {
          extractedBlock = found;
          return {
            ...col,
            blocks: col.blocks.filter(b => b.id !== blockId)
          };
        }
        return col;
      })
    }));

    if (!extractedBlock) return;

    // Now insert the block at target position
    const nextRows = rowsWithoutBlock.map(row => {
      if (row.id !== targetRowId) return row;
      return {
        ...row,
        columns: row.columns.map(col => {
          if (col.id !== targetColId) return col;
          const nextBlocks = [...col.blocks];
          if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= nextBlocks.length) {
            nextBlocks.splice(targetIndex, 0, extractedBlock!);
          } else {
            nextBlocks.push(extractedBlock!);
          }
          return { ...col, blocks: nextBlocks };
        })
      };
    });

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    setSelectedBlockId(blockId);
  };

  // Drop Block Between Rows (creates a new row at that position)
  const handleDropBlockBetweenRows = (typeOrId: string, rowIndex: number, isExistingBlock?: boolean) => {
    if (!currentProject) return;

    let blockToInsert: EmailBlock;

    if (isExistingBlock) {
      let foundBlock: EmailBlock | null = null;
      const cleanRows = currentProject.rows.map(row => ({
        ...row,
        columns: row.columns.map(col => {
          const found = col.blocks.find(b => b.id === typeOrId);
          if (found) {
            foundBlock = found;
            return {
              ...col,
              blocks: col.blocks.filter(b => b.id !== typeOrId)
            };
          }
          return col;
        })
      }));

      if (!foundBlock) return;
      blockToInsert = foundBlock;

      const newRow = createNewRow('1-col');
      newRow.columns[0].blocks.push(blockToInsert);
      const nextRows = [...cleanRows];
      const validIndex = Math.max(0, Math.min(rowIndex, nextRows.length));
      nextRows.splice(validIndex, 0, newRow);

      const nextDoc = { ...currentProject, rows: nextRows };
      setCurrentProject(nextDoc);
      pushToHistory(nextDoc);
      setSelectedBlockId(blockToInsert.id);
      return;
    }

    // Creating new block from sidebar
    blockToInsert = createNewBlock(typeOrId as EmailBlockType);
    const newRow = createNewRow('1-col');
    newRow.columns[0].blocks.push(blockToInsert);

    const nextRows = [...currentProject.rows];
    const validIndex = Math.max(0, Math.min(rowIndex, nextRows.length));
    nextRows.splice(validIndex, 0, newRow);

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    setSelectedBlockId(blockToInsert.id);
  };

  const handleDropRow = (layout: string, index?: number) => {
    if (!currentProject) return;
    const newRow = createNewRow(layout as EmailRow['layout']);
    const nextRows = [...currentProject.rows];
    if (typeof index === 'number' && index >= 0 && index <= nextRows.length) {
      nextRows.splice(index, 0, newRow);
    } else {
      nextRows.push(newRow);
    }
    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
    setSelectedRowId(newRow.id);
    setSelectedBlockId(null);
  };

  // Update Global Settings
  const handleUpdateGlobalSettings = (settings: Partial<GlobalEmailSettings>) => {
    if (!currentProject) return;
    const nextDoc = {
      ...currentProject,
      globalSettings: { ...currentProject.globalSettings, ...settings }
    };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  // Update Preheader
  const handleUpdatePreheader = (text: string) => {
    if (!currentProject) return;
    const nextDoc = { ...currentProject, preheader: text };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  // Update Document Name
  const handleUpdateDocumentName = (name: string) => {
    if (!currentProject) return;
    const nextDoc = { ...currentProject, name };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  // Image replacement from file manager
  const handleSelectImageFromFileManager = (url: string, alt?: string) => {
    if (!currentProject || !selectedBlockId) return;

    const nextRows = currentProject.rows.map(row => ({
      ...row,
      columns: row.columns.map(col => ({
        ...col,
        blocks: col.blocks.map(b => {
          if (b.id !== selectedBlockId) return b;
          return {
            ...b,
            content: {
              ...b.content,
              url,
              imageUrl: url,
              thumbnailUrl: url,
              iconImage: url,
              logoUrl: url,
              avatar: url,
              alt: alt || b.content.alt || ''
            }
          };
        })
      }))
    }));

    const nextDoc = { ...currentProject, rows: nextRows };
    setCurrentProject(nextDoc);
    pushToHistory(nextDoc);
  };

  // Save Block as Reusable Modal trigger
  const handleSaveBlockAsReusable = (block: EmailBlock | EmailRow, isRow = false) => {
    setSaveBlockTarget(block);
    setSaveBlockIsRow(isRow);
    setIsSaveBlockModalOpen(true);
  };

  // Find active selected block object
  const getSelectedBlock = (): EmailBlock | null => {
    if (!currentProject || !selectedBlockId) return null;
    for (const row of currentProject.rows) {
      for (const col of row.columns) {
        const found = col.blocks.find(b => b.id === selectedBlockId);
        if (found) return found;
      }
    }
    return null;
  };

  // Find active selected row object
  const getSelectedRow = (): EmailRow | null => {
    if (!currentProject || !selectedRowId) return null;
    return currentProject.rows.find(r => r.id === selectedRowId) || null;
  };

  // ===================== BOARD & MINDMAP HANDLERS (ESTILO MIRO) =====================
  const handleOpenBoard = (board: BoardDocument) => {
    setCurrentBoard(board);
    setCurrentBoardView('editor');
  };

  const handleSaveBoard = async (boardToSave: BoardDocument) => {
    try {
      await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardToSave)
      });
      setCurrentBoard(boardToSave);
    } catch (err) {
      console.error('Erro ao salvar board:', err);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans antialiased text-slate-800">
      
      {/* ===================== PRODUTO 1: E-MAILS ===================== */}
      {activeProduct === 'emails' && (
        <>
          {currentView === 'dashboard' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto">
              <DashboardView
                projects={projects}
                folders={templateFolders}
                activeModule="emails"
                onChangeModule={setActiveProduct}
                onOpenProject={handleOpenProject}
                onCreateNewProject={handleCreateNewProject}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onSelectTemplate={handleSelectTemplate}
                onDuplicateProject={handleDuplicateProject}
                onDeleteProject={handleDeleteProject}
                onMoveProject={handleMoveProject}
                onCreateFolder={handleCreateTemplateFolder}
                onDeleteFolder={handleDeleteTemplateFolder}
                onOpenMediaManager={() => setIsFileManagerOpen(true)}
                onSaveNewProject={handleSaveNewProject}
                user={user}
              />
            </div>
          )}

          {currentView === 'editor' && currentProject && (
            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
              <EditorTopBar
                document={currentProject}
                folders={templateFolders}
                onUpdateFolder={(newFolder) => {
                  if (currentProject) {
                    handleMoveProject(currentProject.id, newFolder);
                  }
                }}
                onUpdateDocumentName={handleUpdateDocumentName}
                onBackToDashboard={handleBackToDashboard}
                onSave={() => handleSaveProject(currentProjectRef.current || currentProject, true)}
                onSaveAsTemplate={handleSaveAsNewTemplate}
                onExport={() => setIsExportModalOpen(true)}
                onOpenTester={() => setIsTesterModalOpen(true)}
                onOpenPreviewWindow={() => window.open('', '_blank')}
                deviceView={deviceView}
                onChangeDeviceView={setDeviceView}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
              />

              <div className="flex-1 flex min-h-0 overflow-hidden">
                <LeftSidebar
                  onAddBlock={handleAddBlock}
                  onAddRow={handleAddRow}
                  onAddShowcaseRow={handleAddShowcaseRow}
                  onAddSavedBlock={handleAddSavedBlock}
                  savedBlocks={savedBlocks}
                  onDeleteSavedBlock={handleDeleteSavedBlock}
                  globalSettings={currentProject.globalSettings}
                  onUpdateGlobalSettings={handleUpdateGlobalSettings}
                  preheader={currentProject.preheader || ''}
                  onUpdatePreheader={handleUpdatePreheader}
                />

                <CanvasArea
                  document={currentProject}
                  selectedBlockId={selectedBlockId}
                  selectedRowId={selectedRowId}
                  onSelectBlock={handleSelectBlock}
                  onSelectRow={handleSelectRow}
                  onUpdateBlock={handleUpdateBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onMoveBlock={handleMoveBlock}
                  onDuplicateRow={handleDuplicateRow}
                  onDeleteRow={handleDeleteRow}
                  onMoveRow={handleMoveRow}
                  onDropBlockIntoColumn={handleDropBlockIntoColumn}
                  onDropBlockBetweenRows={handleDropBlockBetweenRows}
                  onMoveBlockToPosition={handleMoveBlockToPosition}
                  onDropRow={handleDropRow}
                  onSaveBlockAsReusable={handleSaveBlockAsReusable}
                  onLiveDomChange={handleLiveDomChange}
                  deviceView={deviceView}
                />

                <RightSidebar
                  selectedBlock={getSelectedBlock()}
                  selectedRow={getSelectedRow()}
                  onUpdateBlock={handleUpdateBlock}
                  onUpdateRow={handleUpdateRow}
                  onOpenFileManager={() => setIsFileManagerOpen(true)}
                  onDeselectBlock={() => setSelectedBlockId(null)}
                  globalSettings={currentProject.globalSettings}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ===================== PRODUTO 2: PAGE BUILDER ===================== */}
      {activeProduct === 'pages' && (
        <>
          {currentPageView === 'dashboard' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto">
              <PageDashboardView
                pages={pageProjects}
                folders={pageFolders}
                activeModule="pages"
                onChangeModule={setActiveProduct}
                onOpenPage={handleOpenPage}
                onCreateNewPage={handleCreateNewPage}
                onOpenAiCreator={() => setIsAiPageModalOpen(true)}
                onSelectTemplate={handleSelectPageTemplate}
                onDuplicatePage={handleDuplicatePage}
                onDeletePage={handleDeletePage}
                onTogglePublishPage={handleTogglePublishPage}
                onMovePage={handleMovePage}
                onCreateFolder={handleCreatePageFolder}
                onDeleteFolder={handleDeletePageFolder}
                onOpenMediaManager={() => setIsFileManagerOpen(true)}
                onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
                user={user}
              />
            </div>
          )}

          {currentPageView === 'editor' && currentPageProject && (
            <PageEditorView
              key={currentPageProject.id}
              initialPage={currentPageProject}
              folders={pageFolders}
              onBackToDashboard={() => setCurrentPageView('dashboard')}
              onSavePage={handleSavePage}
              onOpenMediaManager={() => setIsFileManagerOpen(true)}
            />
          )}
        </>
      )}

      {/* ===================== PRODUTO 3: MAPAS MENTAIS & BOARDS (MIRO) ===================== */}
      {activeProduct === 'boards' && (
        <>
          {currentBoardView === 'dashboard' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto">
              <BoardDashboardView
                onOpenBoard={handleOpenBoard}
                activeModule={activeProduct}
                onSwitchModule={setActiveProduct}
              />
            </div>
          )}

          {currentBoardView === 'editor' && currentBoard && (
            <BoardEditorView
              key={currentBoard.id}
              board={currentBoard}
              onBack={() => setCurrentBoardView('dashboard')}
              onSave={handleSaveBoard}
            />
          )}
        </>
      )}

      {/* AI Landing Page Generator Modal */}
      <AiPageGeneratorModal
        isOpen={isAiPageModalOpen}
        onClose={() => setIsAiPageModalOpen(false)}
        folders={pageFolders}
        onPageGenerated={(newPage) => {
          setPageProjects(prev => [newPage, ...prev]);
          setCurrentPageProject(newPage);
          setCurrentPageView('editor');
        }}
      />

      {/* Leads Submissions Modal */}
      <LeadSubmissionsModal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
      />

      {/* Global Modals */}
      <FileManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        onSelectImage={handleSelectImageFromFileManager}
      />

      {currentProject && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          document={currentProject}
        />
      )}

      {currentProject && (
        <EmailTesterModal
          isOpen={isTesterModalOpen}
          onClose={() => setIsTesterModalOpen(false)}
          document={currentProject}
        />
      )}

      <SaveBlockModal
        isOpen={isSaveBlockModalOpen}
        onClose={() => setIsSaveBlockModalOpen(false)}
        target={saveBlockTarget}
        isRow={saveBlockIsRow}
        onSaved={(newBlock) => setSavedBlocks(prev => [...prev, newBlock])}
      />

      <ImportHtmlModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        folders={templateFolders}
        onImport={handleImportHtmlProject}
      />

    </div>
  );
};
