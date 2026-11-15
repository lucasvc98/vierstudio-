import React, { useState, useEffect, useRef } from 'react';
import { 
  PageDocument, 
  PageSection, 
  PageContainer, 
  PageElement, 
  PageDeviceView, 
  PageElementType,
  PageContainerLayout,
  PageStatus,
  PageSeoSettings,
  PageTrackingSettings,
  PageGlobalSettings
} from '../../types/page';
import { PageEditorTopBar } from './editor/PageEditorTopBar';
import { PageLeftSidebar } from './editor/PageLeftSidebar';
import { PageCanvasArea } from './editor/PageCanvasArea';
import { PageRightSidebar } from './editor/PageRightSidebar';
import { PageCodeModal } from '../modals/PageCodeModal';
import { PageSeoTrackingModal } from '../modals/PageSeoTrackingModal';
import { PagePublishModal } from '../modals/PagePublishModal';
import { FileManagerModal } from '../modals/FileManagerModal';
import { createNewSection, createNewPageElement, createNewContainer, generateUniqueId } from '../../utils/pageDefaults';

interface PageEditorViewProps {
  initialPage: PageDocument;
  folders: string[];
  onBackToDashboard: () => void;
  onSavePage: (page: PageDocument) => Promise<void>;
  onOpenMediaManager: () => void;
}

export const PageEditorView: React.FC<PageEditorViewProps> = ({
  initialPage,
  folders,
  onBackToDashboard,
  onSavePage,
  onOpenMediaManager
}) => {
  const [page, setPage] = useState<PageDocument>(initialPage);
  const [deviceView, setDeviceView] = useState<PageDeviceView>('desktop');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<PageDocument[]>([initialPage]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const saveTimeoutRef = useRef<any>(null);

  // Auto-save debounced whenever page changes
  const triggerAutoSave = (newPage: PageDocument) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onSavePage(newPage);
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('Failed to auto-save landing page:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  // Push to history
  const updatePage = (newPage: PageDocument) => {
    setPage(newPage);
    triggerAutoSave(newPage);

    if (!isUndoRedoAction.current) {
      setHistory(prev => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(newPage);
        return next;
      });
      setHistoryIndex(prev => prev + 1);
    }
    isUndoRedoAction.current = false;
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setPage(prev);
      triggerAutoSave(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setPage(next);
      triggerAutoSave(next);
    }
  };

  // Keyboard shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Selected item getters
  const getSelectedElement = (): PageElement | null => {
    if (!selectedElementId) return null;
    for (const sec of page.sections) {
      for (const cont of sec.containers) {
        const el = cont.elements.find(e => e.id === selectedElementId);
        if (el) return el;
      }
    }
    return null;
  };

  const getSelectedSection = (): PageSection | null => {
    if (!selectedSectionId) return null;
    return page.sections.find(s => s.id === selectedSectionId) || null;
  };

  // Selection handlers
  const handleSelectElement = (element: PageElement, section: PageSection) => {
    setSelectedElementId(element.id);
    setSelectedSectionId(section.id);
  };

  const handleSelectSection = (section: PageSection) => {
    setSelectedSectionId(section.id);
    setSelectedElementId(null);
  };

  // Element actions
  const handleAddElement = (type: PageElementType) => {
    const newEl = createNewPageElement(type);
    let targetSection = page.sections[page.sections.length - 1];
    
    // If no sections exist, create one
    if (!targetSection) {
      const s = createNewSection('Seção Principal', false);
      s.containers[0].elements.push(newEl);
      updatePage({ ...page, sections: [s] });
      setSelectedElementId(newEl.id);
      setSelectedSectionId(s.id);
      return;
    }

    // Add to target section's first container
    const updatedSections = page.sections.map(s => {
      if (s.id === (selectedSectionId || targetSection.id)) {
        const conts = [...s.containers];
        conts[0] = { ...conts[0], elements: [...conts[0].elements, newEl] };
        return { ...s, containers: conts };
      }
      return s;
    });

    updatePage({ ...page, sections: updatedSections });
    setSelectedElementId(newEl.id);
  };

  const handleUpdateElement = (elementId: string, updates: Partial<PageElement>) => {
    const updatedSections = page.sections.map(sec => ({
      ...sec,
      containers: sec.containers.map(cont => ({
        ...cont,
        elements: cont.elements.map(el => {
          if (el.id === elementId) {
            return { ...el, ...updates };
          }
          return el;
        })
      }))
    }));
    updatePage({ ...page, sections: updatedSections });
  };

  const handleDuplicateElement = (elementId: string) => {
    const updatedSections = page.sections.map(sec => ({
      ...sec,
      containers: sec.containers.map(cont => {
        const elements: PageElement[] = [];
        for (const el of cont.elements) {
          elements.push(el);
          if (el.id === elementId) {
            const clone: PageElement = {
              ...JSON.parse(JSON.stringify(el)),
              id: generateUniqueId(el.type)
            };
            elements.push(clone);
          }
        }
        return { ...cont, elements };
      })
    }));
    updatePage({ ...page, sections: updatedSections });
  };

  const handleDeleteElement = (elementId: string) => {
    const updatedSections = page.sections.map(sec => ({
      ...sec,
      containers: sec.containers.map(cont => ({
        ...cont,
        elements: cont.elements.filter(el => el.id !== elementId)
      }))
    }));
    updatePage({ ...page, sections: updatedSections });
    setSelectedElementId(null);
  };

  const handleMoveElement = (elementId: string, direction: 'up' | 'down') => {
    const updatedSections = page.sections.map(sec => ({
      ...sec,
      containers: sec.containers.map(cont => {
        const idx = cont.elements.findIndex(e => e.id === elementId);
        if (idx < 0) return cont;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= cont.elements.length) return cont;

        const nextElements = [...cont.elements];
        const [moved] = nextElements.splice(idx, 1);
        nextElements.splice(newIdx, 0, moved);
        return { ...cont, elements: nextElements };
      })
    }));
    updatePage({ ...page, sections: updatedSections });
  };

  // Drop into container
  const handleDropElementIntoContainer = (
    elementType: PageElementType,
    sectionId: string,
    containerId: string,
    index?: number
  ) => {
    const newEl = createNewPageElement(elementType);
    const updatedSections = page.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          containers: sec.containers.map(cont => {
            if (cont.id === containerId) {
              const elements = [...cont.elements];
              if (index !== undefined && index >= 0 && index <= elements.length) {
                elements.splice(index, 0, newEl);
              } else {
                elements.push(newEl);
              }
              return { ...cont, elements };
            }
            return cont;
          })
        };
      }
      return sec;
    });

    updatePage({ ...page, sections: updatedSections });
    setSelectedElementId(newEl.id);
    setSelectedSectionId(sectionId);
  };

  // Move existing element between containers
  const handleMoveExistingElementToContainer = (
    elementId: string,
    targetSectionId: string,
    targetContainerId: string,
    targetIndex?: number
  ) => {
    let elementToMove: PageElement | null = null;

    // 1. Remove from source
    const cleanedSections = page.sections.map(sec => ({
      ...sec,
      containers: sec.containers.map(cont => {
        const found = cont.elements.find(e => e.id === elementId);
        if (found) elementToMove = found;
        return {
          ...cont,
          elements: cont.elements.filter(e => e.id !== elementId)
        };
      })
    }));

    if (!elementToMove) return;

    // 2. Add to target
    const finalSections = cleanedSections.map(sec => {
      if (sec.id === targetSectionId) {
        return {
          ...sec,
          containers: sec.containers.map(cont => {
            if (cont.id === targetContainerId) {
              const elements = [...cont.elements];
              if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= elements.length) {
                elements.splice(targetIndex, 0, elementToMove!);
              } else {
                elements.push(elementToMove!);
              }
              return { ...cont, elements };
            }
            return cont;
          })
        };
      }
      return sec;
    });

    updatePage({ ...page, sections: finalSections });
    setSelectedElementId(elementId);
    setSelectedSectionId(targetSectionId);
  };

  // Section actions
  const handleAddSection = (name = 'Nova Seção', fullWidth = false) => {
    const newSec = createNewSection(name, fullWidth);
    updatePage({ ...page, sections: [...page.sections, newSec] });
    setSelectedSectionId(newSec.id);
    setSelectedElementId(null);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<PageSection>) => {
    const updatedSections = page.sections.map(s => {
      if (s.id === sectionId) return { ...s, ...updates };
      return s;
    });
    updatePage({ ...page, sections: updatedSections });
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sections: PageSection[] = [];
    for (const sec of page.sections) {
      sections.push(sec);
      if (sec.id === sectionId) {
        const clone: PageSection = {
          ...JSON.parse(JSON.stringify(sec)),
          id: generateUniqueId('sec'),
          name: `${sec.name} (Cópia)`
        };
        sections.push(clone);
      }
    }
    updatePage({ ...page, sections });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (page.sections.length <= 1) {
      alert('A página precisa ter pelo menos uma seção.');
      return;
    }
    const updatedSections = page.sections.filter(s => s.id !== sectionId);
    updatePage({ ...page, sections: updatedSections });
    setSelectedSectionId(null);
    setSelectedElementId(null);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const idx = page.sections.findIndex(s => s.id === sectionId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= page.sections.length) return;

    const sections = [...page.sections];
    const [moved] = sections.splice(idx, 1);
    sections.splice(newIdx, 0, moved);
    updatePage({ ...page, sections });
  };

  const handleChangeContainerLayout = (sectionId: string, containerId: string, layout: PageContainerLayout) => {
    const updatedSections = page.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          containers: sec.containers.map(cont => {
            if (cont.id === containerId) {
              return { ...cont, layout };
            }
            return cont;
          })
        };
      }
      return sec;
    });
    updatePage({ ...page, sections: updatedSections });
  };

  // Add preset sections (Hero sales, Hero lead, Benefits, Pricing, FAQ, WhatsApp)
  const handleAddPresetBlock = (blockType: string) => {
    if (blockType === 'hero-sales') {
      const s = createNewSection('Apresentação & Vídeo', false);
      s.style.backgroundColor = '#0b0f19';
      s.style.paddingTop = 72;
      s.style.paddingBottom = 72;
      const h = createNewPageElement('heading');
      h.content.text = 'O Método Definitivo Para Escalar Seu Negócio';
      h.style.color = '#ffffff';
      const p = createNewPageElement('paragraph');
      p.content.text = 'Assista ao vídeo e conheça a estratégia completa passo a passo.';
      p.style.color = '#94a3b8';
      const v = createNewPageElement('video');
      const b = createNewPageElement('button');
      s.containers[0].elements = [h, p, v, b];
      updatePage({ ...page, sections: [...page.sections, s] });
    } else if (blockType === 'hero-lead') {
      const s = createNewSection('Captura de Leads', false);
      s.style.backgroundColor = '#f8fafc';
      const twoCol = createNewContainer('2-col-equal');
      const h = createNewPageElement('heading');
      h.content.text = 'Baixe Nosso Material Gratuito Agora';
      h.style.textAlign = 'left';
      const p = createNewPageElement('paragraph');
      p.content.text = 'Cadastre-se para receber em primeira mão no seu e-mail.';
      p.style.textAlign = 'left';
      const form = createNewPageElement('form');
      twoCol.elements = [h, p, form];
      s.containers = [twoCol];
      updatePage({ ...page, sections: [...page.sections, s] });
    } else if (blockType === 'pricing-section') {
      const s = createNewSection('Oferta & Preço', false);
      const pr = createNewPageElement('pricing-table');
      s.containers[0].elements = [pr];
      updatePage({ ...page, sections: [...page.sections, s] });
    } else if (blockType === 'faq-section') {
      const s = createNewSection('Perguntas Frequentes', false);
      const faq = createNewPageElement('accordion');
      s.containers[0].elements = [faq];
      updatePage({ ...page, sections: [...page.sections, s] });
    } else if (blockType === 'whatsapp-fixed') {
      const wa = createNewPageElement('whatsapp-button');
      wa.content.isFloating = true;
      const lastSec = page.sections[page.sections.length - 1];
      if (lastSec) {
        lastSec.containers[0].elements.push(wa);
        updatePage({ ...page });
      }
    }
  };

  // Image selection from file manager
  const handleSelectImageFromFileManager = (url: string) => {
    const selected = getSelectedElement();
    if (selectedElementId && selected) {
      if (selected.type === 'testimonial') {
        handleUpdateElement(selectedElementId, {
          content: { ...selected.content, avatar: url }
        });
      } else {
        handleUpdateElement(selectedElementId, {
          content: { ...selected.content, url }
        });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden font-sans bg-slate-100">
      
      {/* 1. Top Bar */}
      <PageEditorTopBar
        page={page}
        folders={folders}
        deviceView={deviceView}
        onChangeDeviceView={setDeviceView}
        onBackToDashboard={onBackToDashboard}
        onUpdateName={(name) => updatePage({ ...page, name })}
        onUpdateSlug={(slug) => updatePage({ ...page, slug, publishedUrl: `/p/${slug}` })}
        onSave={() => onSavePage(page)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenSeoModal={() => setIsSeoModalOpen(true)}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenPreview={() => window.open(`/p/${page.slug}`, '_blank')}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
      />

      {/* 2. Main 3-Column Studio Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left Sidebar: Components, Sections, Design */}
        <PageLeftSidebar
          onAddElement={handleAddElement}
          onAddSection={handleAddSection}
          onAddPresetBlock={handleAddPresetBlock}
          globalSettings={page.globalSettings}
          onUpdateGlobalSettings={(settings) => updatePage({
            ...page,
            globalSettings: { ...page.globalSettings, ...settings }
          })}
        />

        {/* Central Canvas Construction Area */}
        <PageCanvasArea
          page={page}
          deviceView={deviceView}
          selectedElementId={selectedElementId}
          selectedSectionId={selectedSectionId}
          onSelectElement={handleSelectElement}
          onSelectSection={handleSelectSection}
          onUpdateElement={handleUpdateElement}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          onMoveElement={handleMoveElement}
          onDropElementIntoContainer={handleDropElementIntoContainer}
          onMoveExistingElementToContainer={handleMoveExistingElementToContainer}
          onAddSection={handleAddSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          onMoveSection={handleMoveSection}
          onChangeContainerLayout={handleChangeContainerLayout}
        />

        {/* Right Sidebar: Contextual Properties Panel */}
        <PageRightSidebar
          selectedElement={getSelectedElement()}
          selectedSection={getSelectedSection()}
          onUpdateElement={handleUpdateElement}
          onUpdateSection={handleUpdateSection}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onDeleteSection={handleDeleteSection}
          onOpenMediaManager={() => setIsFileManagerOpen(true)}
          globalSettings={page.globalSettings}
        />

      </div>

      {/* 3. Page Builder Modals */}
      <PageCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        page={page}
      />

      <PageSeoTrackingModal
        isOpen={isSeoModalOpen}
        onClose={() => setIsSeoModalOpen(false)}
        page={page}
        onSaveSeoTracking={(seo, tracking) => updatePage({ ...page, seo, tracking })}
      />

      <PagePublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        page={page}
        onPublish={(slug, status) => updatePage({
          ...page,
          slug,
          status,
          publishedUrl: `/p/${slug}`,
          publishedAt: status === 'published' ? new Date().toISOString() : page.publishedAt
        })}
      />

      <FileManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        onSelectImage={handleSelectImageFromFileManager}
      />

    </div>
  );
};
