import React, { useState, useRef, useEffect } from 'react';
import { 
  BoardDocument, 
  BoardItem, 
  BoardConnection, 
  BoardTemplateModel, 
  ShapeType,
  AiBoardGenerateRequest 
} from '../../types/board';
import { BoardCanvas } from './BoardCanvas';
import { BoardTemplatesModal } from '../modals/BoardTemplatesModal';
import { MIRO_STICKY_COLORS, generateBoardId } from '../../data/initialBoards';
import { 
  ArrowLeft, 
  Sparkles, 
  Share2, 
  Download, 
  Plus, 
  Undo2, 
  Redo2, 
  MousePointer, 
  FileText, 
  Square, 
  Circle, 
  Diamond, 
  Type, 
  Grid, 
  Maximize2, 
  Send, 
  Check, 
  Loader2, 
  Folder, 
  ChevronDown,
  Layers,
  Layout,
  Workflow,
  Table,
  Clock,
  Kanban,
  FileSpreadsheet,
  Presentation,
  Play,
  HelpCircle,
  Palette
} from 'lucide-react';

interface BoardEditorViewProps {
  board: BoardDocument;
  onBack: () => void;
  onSave: (board: BoardDocument) => void;
}

export const BoardEditorView: React.FC<BoardEditorViewProps> = ({
  board: initialBoard,
  onBack,
  onSave
}) => {
  const [board, setBoard] = useState<BoardDocument>(initialBoard);
  const [activeTool, setActiveTool] = useState<'select' | 'sticky' | 'shape' | 'text' | 'connector' | 'frame'>('select');
  const [selectedStickyColor, setSelectedStickyColor] = useState(MIRO_STICKY_COLORS[0].bg);
  const [selectedShapeType, setSelectedShapeType] = useState<ShapeType>('rectangle');

  // Popovers & Modals
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showStickyPicker, setShowStickyPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<BoardDocument[]>([initialBoard]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Bottom AI prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiNotification, setAiNotification] = useState<string | null>(null);

  // Auto-save debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pushState = (newBoard: BoardDocument) => {
    setBoard(newBoard);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newBoard);
    if (updatedHistory.length > 30) updatedHistory.shift();
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);

    // Auto-save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onSave(newBoard);
    }, 800);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setBoard(prev);
      onSave(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setBoard(next);
      onSave(next);
    }
  };

  // Generate board content from AI
  const handleGenerateAi = async (promptOverride?: string, typeOverride?: 'mindmap' | 'flowchart' | 'brainstorm' | 'expand') => {
    const prompt = (promptOverride || aiPrompt).trim();
    if (!prompt) return;

    setIsGeneratingAi(true);
    setAiNotification('IA criando elementos do mapa mental...');

    try {
      const payload: AiBoardGenerateRequest = {
        prompt,
        type: typeOverride || (prompt.toLowerCase().includes('fluxo') ? 'flowchart' : prompt.toLowerCase().includes('brainstorm') ? 'brainstorm' : 'mindmap'),
        targetBoardId: board.id
      };

      const res = await fetch('/api/boards/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.data) {
        const { items: newItems, connections: newConns } = data.data;

        // Shift new items slightly to not overlap existing elements
        let maxX = 200;
        let maxY = 200;
        if (board.items.length > 0) {
          board.items.forEach(it => {
            if (it.x + it.width > maxX) maxX = it.x + it.width;
          });
          maxX += 150;
        }

        const shiftedItems = (newItems as BoardItem[]).map(it => ({
          ...it,
          x: it.x + (board.items.length > 0 ? maxX : 0)
        }));

        const merged: BoardDocument = {
          ...board,
          items: [...board.items, ...shiftedItems],
          connections: [...board.connections, ...(newConns || [])],
          updatedAt: new Date().toISOString()
        };

        pushState(merged);
        setAiPrompt('');
        setAiNotification(`Criado com sucesso: ${shiftedItems.length} novos nós gerados!`);
        setTimeout(() => setAiNotification(null), 4000);
      } else {
        alert(data.message || 'Erro ao gerar conteúdo com IA.');
      }
    } catch (err: any) {
      alert(`Falha na conexão com IA: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Expand a single node using AI
  const handleExpandNodeWithAi = async (item: BoardItem) => {
    setIsGeneratingAi(true);
    setAiNotification(`Expandindo ideias para: "${item.content.text || item.content.title}"...`);

    try {
      const payload: AiBoardGenerateRequest = {
        prompt: `Expandir tópicos e sub-ações para o nó: ${item.content.text || item.content.title}`,
        type: 'expand',
        targetBoardId: board.id,
        contextNode: {
          id: item.id,
          text: item.content.text || item.content.title || '',
          x: item.x,
          y: item.y
        }
      };

      const res = await fetch('/api/boards/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.data) {
        const { items: newItems, connections: newConns } = data.data;
        const merged: BoardDocument = {
          ...board,
          items: [...board.items, ...newItems],
          connections: [...board.connections, ...newConns],
          updatedAt: new Date().toISOString()
        };
        pushState(merged);
        setAiNotification('Nó expandido com 3 ramificações inteligentes!');
        setTimeout(() => setAiNotification(null), 3000);
      }
    } catch (err: any) {
      alert(`Erro ao expandir nó: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Export board as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(board, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${board.name.toLowerCase().replace(/\s+/g, '-')}-miro.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Apply template
  const handleSelectTemplate = (template: BoardTemplateModel) => {
    const sourceDoc = template.board || template.document;
    const merged: BoardDocument = {
      ...board,
      items: [...sourceDoc.items],
      connections: [...sourceDoc.connections],
      updatedAt: new Date().toISOString()
    };
    pushState(merged);
    setShowTemplatesModal(false);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-100 select-none">
      {/* Miro Blue Notification Banner (as seen in Image 1 & 2) */}
      <div className="bg-blue-600 text-white text-xs px-4 py-1.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Editor de Mapas Mentais & Diagramas <strong>estilo Miro</strong> • Canvas Infinito com IA ativa</span>
        </div>
        <div className="flex items-center gap-4 text-blue-100">
          <button 
            onClick={() => handleGenerateAi('Criar funil de vendas completo para curso online')}
            className="hover:underline cursor-pointer"
          >
            Exemplo: Gerar Funil com IA
          </button>
        </div>
      </div>

      {/* Top Navbar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Voltar aos Mapas"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Miro Iconic Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-xs">
              M
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight hidden sm:inline">
              miro <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 ml-1">AI</span>
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Board Title (In-place edit) */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={board.name}
              onChange={e => {
                const updated = { ...board, name: e.target.value };
                setBoard(updated);
                onSave(updated);
              }}
              className="font-bold text-sm text-slate-800 hover:bg-slate-50 px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 border-transparent border transition-all max-w-[200px] sm:max-w-xs"
            />
            <span className="text-[11px] text-slate-400 hidden md:inline">
              • {board.items.length} elementos
            </span>
          </div>
        </div>

        {/* Center: AI Notification Pill */}
        {aiNotification && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200 text-xs font-semibold animate-pulse shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{aiNotification}</span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Templates Gallery Button */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Layout className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExportJson}
            title="Exportar board em JSON"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Blue Share button (Image 2 style) */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Link do board copiado para a área de transferência!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Left Vertical Miro Toolbar (Image 2 & 3) */}
        <div className="absolute top-6 left-6 z-30 flex flex-col items-center p-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 gap-1.5">
          {/* Yellow Sparkles AI Button at top of toolbar */}
          <div className="relative">
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              title="Miro AI & Ferramentas Inteligentes"
              className="w-10 h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5 fill-current" />
            </button>

            {/* AI / Creation Flyout Menu (Image 3) */}
            {showAiMenu && (
              <div 
                className="absolute top-0 left-12 ml-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                  Geradores Inteligentes
                </div>
                <button
                  onClick={() => {
                    handleGenerateAi('Mapa Mental de Lançamento de Produto Digital', 'mindmap');
                    setShowAiMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
                >
                  <Workflow className="w-4 h-4 text-blue-600" />
                  <span>Mapa Mental com IA</span>
                </button>
                <button
                  onClick={() => {
                    handleGenerateAi('Fluxograma de Vendas e Checkout de Alta Conversão', 'flowchart');
                    setShowAiMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-left cursor-pointer"
                >
                  <Workflow className="w-4 h-4 text-amber-600" />
                  <span>Diagrama & Fluxo</span>
                </button>
                <button
                  onClick={() => {
                    handleGenerateAi('Brainstorm de Ângulos de Cópia e Ofertas Irrecusáveis', 'brainstorm');
                    setShowAiMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition-colors text-left cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-pink-600" />
                  <span>Brainstorming Cluster</span>
                </button>
                <div className="h-px bg-slate-100 my-1.5" />
                <button
                  onClick={() => {
                    setShowTemplatesModal(true);
                    setShowAiMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-slate-400" />
                    <span>Galeria de Templates</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Miro</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-6 h-px bg-slate-200" />

          {/* Pointer / Select tool */}
          <button
            onClick={() => setActiveTool('select')}
            title="Selecionar e mover (V)"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'select'
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MousePointer className="w-5 h-5" />
          </button>

          {/* Templates modal shortcut */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            title="Abrir Templates"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
          >
            <Layout className="w-5 h-5" />
          </button>

          {/* Sticky Note Tool (Image 5 color flyout) */}
          <div className="relative">
            <button
              onClick={() => {
                setActiveTool('sticky');
                setShowStickyPicker(!showStickyPicker);
              }}
              title="Nota Adesiva (N)"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTool === 'sticky'
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-5 h-5" />
            </button>

            {/* Miro Sticky Colors Picker (Image 5) */}
            {showStickyPicker && (
              <div 
                className="absolute top-0 left-12 ml-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-52 animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cores Miro Sticky
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {MIRO_STICKY_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedStickyColor(c.bg);
                        setActiveTool('sticky');
                        setShowStickyPicker(false);
                      }}
                      title={c.label}
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                      className={`h-8 rounded-lg border-2 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-xs cursor-pointer ${
                        selectedStickyColor === c.bg ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                    >
                      {selectedStickyColor === c.bg && (
                        <div className="w-2 h-2 rounded-full bg-slate-800/80" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold">
                  <Square className="w-3.5 h-3.5" />
                  <span>Bloco Miro</span>
                </div>
              </div>
            )}
          </div>

          {/* Shapes Tool */}
          <div className="relative">
            <button
              onClick={() => {
                setActiveTool('shape');
                setShowShapePicker(!showShapePicker);
              }}
              title="Formas & Diagramas (S)"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTool === 'shape'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Square className="w-5 h-5" />
            </button>

            {/* Shape types flyout */}
            {showShapePicker && (
              <div 
                className="absolute top-0 left-12 ml-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-44 animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                  Formas
                </div>
                <button
                  onClick={() => {
                    setSelectedShapeType('rectangle');
                    setActiveTool('shape');
                    setShowShapePicker(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Square className="w-4 h-4 text-blue-600" />
                  <span>Retângulo</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedShapeType('circle');
                    setActiveTool('shape');
                    setShowShapePicker(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Circle className="w-4 h-4 text-emerald-600" />
                  <span>Círculo / Oval</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedShapeType('diamond');
                    setActiveTool('shape');
                    setShowShapePicker(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Diamond className="w-4 h-4 text-amber-600" />
                  <span>Decisão (Losango)</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedShapeType('pill');
                    setActiveTool('shape');
                    setShowShapePicker(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <div className="w-4 h-2 rounded-full border-2 border-purple-600" />
                  <span>Pílula / Início-Fim</span>
                </button>
              </div>
            )}
          </div>

          {/* Text Tool */}
          <button
            onClick={() => setActiveTool('text')}
            title="Texto (T)"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'text'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Type className="w-5 h-5" />
          </button>

          {/* Frame / Quadro Tool */}
          <button
            onClick={() => setActiveTool('frame')}
            title="Quadro / Frame (F)"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'frame'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>

          <div className="w-6 h-px bg-slate-200 mt-2" />

          {/* Undo and Redo buttons */}
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            title="Desfazer (Ctrl+Z)"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              historyIndex > 0 ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Refazer (Ctrl+Y)"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              historyIndex < history.length - 1 ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Board Canvas Area */}
        <BoardCanvas
          board={board}
          onChange={pushState}
          activeTool={activeTool}
          selectedStickyColor={selectedStickyColor}
          selectedShapeType={selectedShapeType}
          onExpandWithAi={handleExpandNodeWithAi}
        />

        {/* Bottom Floating AI Prompt Bar: "+ O que faremos a seguir?" (Image 2) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>

            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateAi();
                }
              }}
              placeholder="O que faremos a seguir? (Ex: crie funil de vendas, brainstorm de temas...)"
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none px-2"
            />

            <button
              onClick={() => handleGenerateAi()}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                aiPrompt.trim() && !isGeneratingAi
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isGeneratingAi ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Suggestion Chips below AI bar */}
          <div className="flex items-center justify-center gap-2 mt-2 overflow-x-auto py-1">
            <button
              onClick={() => handleGenerateAi('Funil de Vendas de 4 Etapas com Anúncio, LP, Checkout e Upsell', 'flowchart')}
              className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              ⚡ Funil de 4 Etapas
            </button>
            <button
              onClick={() => handleGenerateAi('Mapa Mental de Lançamento de Produto Digital', 'mindmap')}
              className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              💡 Mapa de Lançamento
            </button>
            <button
              onClick={() => handleGenerateAi('Brainstorm de 6 Ganchos de Copy para Criativos', 'brainstorm')}
              className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              🎯 Ganchos de Copy
            </button>
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      <BoardTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleSelectTemplate}
        onStartBlank={() => setShowTemplatesModal(false)}
      />
    </div>
  );
};
