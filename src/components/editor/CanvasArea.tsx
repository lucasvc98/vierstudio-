import React, { useState } from 'react';
import { 
  Trash2, Copy, ArrowUp, ArrowDown, BookmarkPlus, 
  Plus, Move, GripVertical, Check, ExternalLink, Play, LayoutGrid
} from 'lucide-react';
import { EmailBlock, EmailRow, EmailColumn, EmailDocument, DeviceVisibility } from '../../types/email';

interface DropTargetState {
  type: 'between-rows' | 'between-blocks' | 'empty-column';
  rowIndex?: number;
  rowId?: string;
  colId?: string;
  index?: number;
}

interface CanvasAreaProps {
  document: EmailDocument;
  selectedBlockId: string | null;
  selectedRowId: string | null;
  onSelectBlock: (block: EmailBlock, row: EmailRow) => void;
  onSelectRow: (row: EmailRow) => void;
  onUpdateBlock: (updated: EmailBlock) => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateRow: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void;
  onMoveRow: (rowId: string, direction: 'up' | 'down') => void;
  onDropBlockIntoColumn: (type: string, rowId: string, colId: string, index?: number) => void;
  onDropBlockBetweenRows: (typeOrId: string, rowIndex: number, isExistingBlock?: boolean) => void;
  onMoveBlockToPosition: (blockId: string, targetRowId: string, targetColId: string, targetIndex?: number) => void;
  onDropRow: (layout: string, index?: number) => void;
  onSaveBlockAsReusable: (block: EmailBlock, isRow?: boolean) => void;
  deviceView: 'desktop' | 'mobile';
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  document: doc,
  selectedBlockId,
  selectedRowId,
  onSelectBlock,
  onSelectRow,
  onUpdateBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveBlock,
  onDuplicateRow,
  onDeleteRow,
  onMoveRow,
  onDropBlockIntoColumn,
  onDropBlockBetweenRows,
  onMoveBlockToPosition,
  onDropRow,
  onSaveBlockAsReusable,
  deviceView
}) => {
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

  const { globalSettings } = doc;
  const containerWidth = globalSettings.containerWidth || 600;

  // Global handler for dropping elements inside a column or between blocks
  const handleDropOnBlockSlot = (e: React.DragEvent, rowId: string, colId: string, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    setDraggingBlockId(null);

    // 1. Moving an existing block
    const existingRaw = e.dataTransfer.getData('application/vierstudio-existing-block');
    if (existingRaw) {
      try {
        const { blockId } = JSON.parse(existingRaw);
        if (blockId) {
          onMoveBlockToPosition(blockId, rowId, colId, index);
          return;
        }
      } catch (err) {
        console.error('Error moving block:', err);
      }
    }

    // 2. New block dropped from sidebar
    const blockType = e.dataTransfer.getData('application/vierstudio-block');
    if (blockType) {
      onDropBlockIntoColumn(blockType, rowId, colId, index);
      return;
    }

    // 3. Row layout dropped
    const rowLayout = e.dataTransfer.getData('application/vierstudio-row');
    if (rowLayout) {
      onDropRow(rowLayout);
    }
  };

  // Handler for dropping between rows (creates a new row / section!)
  const handleDropBetweenRows = (e: React.DragEvent, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    setDraggingBlockId(null);

    // 1. Moving an existing block into a new row between rows
    const existingRaw = e.dataTransfer.getData('application/vierstudio-existing-block');
    if (existingRaw) {
      try {
        const { blockId } = JSON.parse(existingRaw);
        if (blockId) {
          onDropBlockBetweenRows(blockId, rowIndex, true);
          return;
        }
      } catch (err) {
        console.error('Error moving block between rows:', err);
      }
    }

    // 2. New block from sidebar dropped between rows (opens a new row!)
    const blockType = e.dataTransfer.getData('application/vierstudio-block');
    if (blockType) {
      onDropBlockBetweenRows(blockType, rowIndex, false);
      return;
    }

    // 3. New row layout from structure tab
    const rowLayout = e.dataTransfer.getData('application/vierstudio-row');
    if (rowLayout) {
      onDropRow(rowLayout, rowIndex);
    }
  };

  // Inter-block drop zone indicator
  const renderBlockDropSlot = (rowId: string, colId: string, targetIndex: number) => {
    const isTarget = dropTarget?.type === 'between-blocks' && 
                     dropTarget.rowId === rowId && 
                     dropTarget.colId === colId && 
                     dropTarget.index === targetIndex;

    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDropTarget({ type: 'between-blocks', rowId, colId, index: targetIndex });
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
        }}
        onDrop={(e) => handleDropOnBlockSlot(e, rowId, colId, targetIndex)}
        className={`relative transition-all duration-150 flex items-center justify-center cursor-copy ${
          isTarget 
            ? 'h-9 my-1.5 bg-indigo-50 border-2 border-dashed border-indigo-600 rounded-xl z-20 shadow-sm' 
            : 'h-2 hover:h-4 -my-0.5 opacity-0 hover:opacity-100 hover:bg-indigo-50/60 rounded'
        }`}
      >
        {isTarget && (
          <div className="flex items-center gap-1.5 text-indigo-700 text-[11px] font-extrabold tracking-wide uppercase select-none animate-pulse">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Soltar elemento aqui</span>
          </div>
        )}
      </div>
    );
  };

  // Inter-row drop zone indicator (creates a new row / section in the email)
  const renderRowDropSlot = (targetRowIndex: number) => {
    const isTarget = dropTarget?.type === 'between-rows' && dropTarget.rowIndex === targetRowIndex;

    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDropTarget({ type: 'between-rows', rowIndex: targetRowIndex });
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
        }}
        onDrop={(e) => handleDropBetweenRows(e, targetRowIndex)}
        className={`w-full transition-all duration-200 flex items-center justify-center cursor-copy ${
          isTarget 
            ? 'h-12 my-2 bg-indigo-600/10 border-2 border-dashed border-indigo-600 rounded-2xl z-30 shadow-md scale-100' 
            : 'h-2.5 hover:h-6 -my-1 opacity-0 hover:opacity-100 hover:bg-indigo-100/50'
        }`}
      >
        {isTarget && (
          <div className="flex items-center gap-2 bg-indigo-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce select-none">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Soltar para criar nova janela / seção aqui</span>
          </div>
        )}
      </div>
    );
  };

  // Render a single block inside canvas with drag support
  const renderCanvasBlock = (block: EmailBlock, row: EmailRow, col: EmailColumn, index: number) => {
    const isSelected = selectedBlockId === block.id;
    const isDragging = draggingBlockId === block.id;

    return (
      <React.Fragment key={block.id}>
        {/* Drop slot before the first block */}
        {index === 0 && renderBlockDropSlot(row.id, col.id, 0)}

        <div
          draggable
          onDragStart={(e) => {
            // If dragging from editable text directly, don't trigger block drag
            if ((e.target as HTMLElement).isContentEditable) return;
            e.stopPropagation();
            e.dataTransfer.setData('application/vierstudio-existing-block', JSON.stringify({ 
              blockId: block.id, 
              rowId: row.id, 
              colId: col.id 
            }));
            e.dataTransfer.effectAllowed = 'move';
            setDraggingBlockId(block.id);
          }}
          onDragEnd={() => {
            setDraggingBlockId(null);
            setDropTarget(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectBlock(block, row);
          }}
          className={`relative group/block transition-all rounded-md cursor-pointer ${
            isDragging 
              ? 'opacity-40 border-2 border-dashed border-indigo-500 scale-[0.98]' 
              : isSelected 
              ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white' 
              : 'hover:outline-dashed hover:outline-1 hover:outline-indigo-300'
          }`}
        >
          {/* Visual Move Pill Handle on Hover */}
          <div 
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('application/vierstudio-existing-block', JSON.stringify({ 
                blockId: block.id, 
                rowId: row.id, 
                colId: col.id 
              }));
              e.dataTransfer.effectAllowed = 'move';
              setDraggingBlockId(block.id);
            }}
            onDragEnd={() => {
              setDraggingBlockId(null);
              setDropTarget(null);
            }}
            className="absolute -top-3 -left-2 z-30 hidden group-hover/block:flex items-center gap-1 bg-white border border-indigo-300 shadow-md rounded-md px-1.5 py-0.5 text-indigo-700 text-[10px] font-bold cursor-grab active:cursor-grabbing hover:bg-indigo-50"
            title="Segure e arraste para qualquer lugar do e-mail"
          >
            <GripVertical className="w-3.5 h-3.5" />
            <span>Mover</span>
          </div>

          {/* Floating Action Toolbar on Selected Block */}
          {isSelected && (
            <div className="absolute -top-9 right-2 z-30 flex items-center gap-0.5 bg-slate-900 text-white rounded-lg px-1.5 py-1 shadow-lg text-[11px] animate-in fade-in zoom-in-95 duration-100">
              <div 
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData('application/vierstudio-existing-block', JSON.stringify({ 
                    blockId: block.id, 
                    rowId: row.id, 
                    colId: col.id 
                  }));
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggingBlockId(block.id);
                }}
                onDragEnd={() => {
                  setDraggingBlockId(null);
                  setDropTarget(null);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-600 rounded text-white font-bold text-[10px] uppercase cursor-grab active:cursor-grabbing mr-1"
                title="Segure e arraste este bloco"
              >
                <GripVertical className="w-3.5 h-3.5" />
                <span>{block.type}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'up'); }}
                title="Mover para cima"
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'down'); }}
                title="Mover para baixo"
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }}
                title="Duplicar elemento"
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSaveBlockAsReusable(block, false); }}
                title="Salvar como bloco reutilizável"
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                title="Excluir elemento"
                className="p-1 hover:bg-rose-600 rounded transition-colors text-slate-300 hover:text-white ml-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Visual Content Representation */}
          <div 
            style={{
              marginTop: `${block.style.marginTop ?? 4}px`,
              marginBottom: `${block.style.marginBottom ?? 8}px`,
              textAlign: block.style.textAlign || 'left',
              color: block.style.color,
              fontSize: block.style.fontSize ? `${block.style.fontSize}px` : undefined,
              fontWeight: block.style.fontWeight,
              lineHeight: block.style.lineHeight
            }}
            className="relative"
          >
            {block.type === 'heading' && (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateBlock({ ...block, content: { ...block.content, text: e.currentTarget.innerText } })}
                style={{
                  fontFamily: block.style.fontFamily || globalSettings.defaultFontFamily,
                  fontSize: `${block.style.fontSize || (block.content.level === 'h1' ? 28 : block.content.level === 'h2' ? 22 : 18)}px`,
                  fontWeight: block.style.fontWeight || 700,
                  color: block.style.color || globalSettings.defaultHeadingColor || '#111827',
                  lineHeight: block.style.lineHeight || 1.3,
                  letterSpacing: block.style.letterSpacing ? `${block.style.letterSpacing}px` : undefined,
                  textTransform: block.style.textTransform,
                  whiteSpace: 'pre-line'
                }}
                className="outline-none focus:bg-indigo-50/40 rounded px-1 -mx-1"
              >
                {block.content.text}
              </div>
            )}

            {block.type === 'text' && (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateBlock({ ...block, content: { ...block.content, html: e.currentTarget.innerHTML, text: e.currentTarget.innerText } })}
                dangerouslySetInnerHTML={{ __html: block.content.html || block.content.text || '' }}
                style={{
                  fontFamily: block.style.fontFamily || globalSettings.defaultFontFamily,
                  fontSize: `${block.style.fontSize || 15}px`,
                  fontWeight: block.style.fontWeight,
                  color: block.style.color || globalSettings.defaultTextColor || '#475569',
                  lineHeight: block.style.lineHeight || 1.6,
                  letterSpacing: block.style.letterSpacing ? `${block.style.letterSpacing}px` : undefined,
                  textTransform: block.style.textTransform
                }}
                className="outline-none focus:bg-indigo-50/40 rounded px-1 -mx-1"
              />
            )}

            {block.type === 'button' && (
              <div style={{ textAlign: block.style.textAlign || 'center' }}>
                <span
                  style={{
                    display: block.content.fullWidth ? 'block' : 'inline-block',
                    backgroundColor: block.style.backgroundColor || globalSettings.defaultButtonBg || '#6366f1',
                    color: block.style.color || globalSettings.defaultButtonTextColor || '#ffffff',
                    borderRadius: `${block.style.borderRadius ?? (globalSettings.defaultButtonRadius || 6)}px`,
                    fontSize: `${block.style.fontSize || 15}px`,
                    fontWeight: block.style.fontWeight || 600,
                    letterSpacing: block.style.letterSpacing ? `${block.style.letterSpacing}px` : undefined,
                    textTransform: block.style.textTransform,
                    paddingTop: `${block.style.paddingTop ?? 12}px`,
                    paddingBottom: `${block.style.paddingBottom ?? 12}px`,
                    paddingLeft: `${block.style.paddingLeft ?? 24}px`,
                    paddingRight: `${block.style.paddingRight ?? 24}px`,
                    border: block.style.borderWidth ? `${block.style.borderWidth}px ${block.style.borderStyle || 'solid'} ${block.style.borderColor}` : 'none'
                  }}
                  className="shadow-xs font-semibold cursor-grab active:cursor-grabbing select-none"
                  title="Segure e arraste este botão para reposicionar"
                >
                  {block.content.text || 'Clique Aqui'}
                </span>
              </div>
            )}

            {block.type === 'image' && (
              <div style={{ textAlign: block.style.textAlign || 'center' }}>
                <img
                  src={block.content.url}
                  alt={block.content.alt || 'Imagem'}
                  style={{
                    width: block.content.width || '100%',
                    borderRadius: `${block.style.borderRadius ?? 6}px`,
                    display: 'inline-block'
                  }}
                  className="max-w-full h-auto object-cover select-none pointer-events-none"
                />
              </div>
            )}

            {block.type === 'logo' && (
              <div style={{ textAlign: block.style.textAlign || 'left' }}>
                <img
                  src={block.content.url}
                  alt={block.content.alt || 'Logo'}
                  style={{ width: `${block.content.width || 140}px`, display: 'inline-block' }}
                  className="max-w-full h-auto select-none pointer-events-none"
                />
              </div>
            )}

            {block.type === 'divider' && (
              <div 
                style={{
                  borderTop: `${block.style.borderWidth || 1}px ${block.style.borderStyle || 'solid'} ${block.style.borderColor || '#e2e8f0'}`,
                  marginTop: `${block.style.marginTop ?? 12}px`,
                  marginBottom: `${block.style.marginBottom ?? 12}px`
                }} 
              />
            )}

            {block.type === 'spacer' && (
              <div 
                style={{ height: `${block.style.height || 24}px` }} 
                className="bg-slate-100/40 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400"
              >
                Espaçador ({block.style.height || 24}px)
              </div>
            )}

            {block.type === 'coupon' && (
              <div 
                style={{
                  backgroundColor: block.style.backgroundColor || '#f5f3ff',
                  borderColor: block.style.borderColor || '#8b5cf6'
                }}
                className="border-2 border-dashed rounded-xl p-5 text-center my-3"
              >
                <div className="text-xs font-extrabold uppercase text-violet-700 tracking-wider">
                  {block.content.discount}
                </div>
                <div className="font-mono text-2xl font-black text-slate-900 tracking-widest my-1.5">
                  {block.content.code}
                </div>
                <div className="text-xs text-slate-500">
                  {block.content.description}
                </div>
              </div>
            )}

            {block.type === 'product' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-4 text-center my-2">
                <img 
                  src={block.content.imageUrl} 
                  alt={block.content.title} 
                  className="w-full h-40 object-cover rounded-lg mb-3 pointer-events-none" 
                />
                <h4 className="font-bold text-slate-900 text-sm mb-1">{block.content.title}</h4>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {block.content.oldPrice && (
                    <span className="text-xs text-slate-400 line-through">{block.content.oldPrice}</span>
                  )}
                  <span className="text-base font-extrabold text-indigo-600">{block.content.price}</span>
                </div>
                <span className="inline-block bg-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs">
                  {block.content.buttonText || 'Comprar'}
                </span>
              </div>
            )}

            {block.type === 'social' && (
              <div className="flex items-center justify-center gap-3 my-2">
                {(block.content.items || []).map((item: any, i: number) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 capitalize">
                    {item.platform.slice(0, 2)}
                  </div>
                ))}
              </div>
            )}

            {block.type === 'video' && (
              <div className="relative rounded-xl overflow-hidden my-2 group/video">
                <img src={block.content.thumbnailUrl} alt="Video" className="w-full h-48 object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>
              </div>
            )}

            {block.type === 'nav' && (
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 my-2">
                {(block.content.links || []).map((l: any, i: number) => (
                  <span key={i} className="hover:text-indigo-600 cursor-pointer">{l.label}</span>
                ))}
              </div>
            )}

            {block.type === 'hero' && (
              <div className="bg-slate-900 text-white rounded-xl overflow-hidden my-2">
                <img src={block.content.imageUrl} alt="Hero" className="w-full h-48 object-cover pointer-events-none" />
                <div className="p-6 text-center">
                  <h2 className="text-xl font-black mb-2">{block.content.title}</h2>
                  <p className="text-xs text-slate-300 mb-4">{block.content.subtitle}</p>
                  <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-xs">
                    {block.content.ctaText}
                  </span>
                </div>
              </div>
            )}

            {block.type === 'footer' && (
              <div className="text-center text-xs text-slate-400 py-3 space-y-1">
                <div>© {new Date().getFullYear()} {block.content.companyName}. Todos os direitos reservados.</div>
                <div>{block.content.address}</div>
                <div>
                  <span className="text-indigo-600 underline">Cancelar inscrição</span> • <span className="text-indigo-600 underline">Privacidade</span>
                </div>
              </div>
            )}

            {block.type === 'signature' && (
              <div className="flex items-center gap-3.5 my-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <img src={block.content.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-slate-200 pointer-events-none" />
                <div className="border-l-2 border-slate-200 pl-3">
                  <div className="font-bold text-slate-900 text-xs">{block.content.name}</div>
                  <div className="text-[11px] font-medium text-indigo-600">{block.content.role} • {block.content.company}</div>
                  <div className="text-[10px] text-slate-400">{block.content.phone}</div>
                </div>
              </div>
            )}

            {block.type === 'html' && (
              <div className="my-2 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs font-mono text-slate-600 overflow-x-auto">
                {block.content.code}
              </div>
            )}
          </div>
        </div>

        {/* Drop slot after each block */}
        {renderBlockDropSlot(row.id, col.id, index + 1)}
      </React.Fragment>
    );
  };

  return (
    <main 
      className="flex-1 h-full min-h-0 overflow-y-auto p-8 flex flex-col items-center justify-start select-text pb-40"
      style={{ backgroundColor: globalSettings.bodyBgColor || '#f4f5f8' }}
      onClick={() => {
        // Deselect when clicking outside canvas container
        onSelectRow({} as any);
      }}
    >
      
      {/* Device Wrapper */}
      <div 
        style={{
          width: deviceView === 'mobile' ? '375px' : `${containerWidth}px`,
          maxWidth: '100%',
          backgroundColor: globalSettings.contentBgColor || '#ffffff',
          borderRadius: `${globalSettings.containerRadius || 8}px`,
          border: `${globalSettings.containerBorderWidth || 0}px solid ${globalSettings.containerBorderColor || '#e2e8f0'}`
        }}
        className={`shadow-xl transition-all duration-200 relative shrink-0 ${
          deviceView === 'mobile' 
            ? 'ring-12 ring-slate-800 rounded-[36px] overflow-hidden my-4' 
            : 'rounded-xl overflow-hidden my-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Mobile Header Bezel indicator */}
        {deviceView === 'mobile' && (
          <div className="bg-slate-900 text-white text-[10px] py-1.5 px-6 flex justify-between items-center select-none">
            <span>9:41</span>
            <div className="w-16 h-3.5 bg-black rounded-full" />
            <span>100%</span>
          </div>
        )}

        {/* Drop slot at the very top of email */}
        {renderRowDropSlot(0)}

        {/* Email Rows List */}
        {doc.rows.map((row, rIndex) => {
          const isRowSelected = selectedRowId === row.id && !selectedBlockId;

          return (
            <React.Fragment key={row.id}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRow(row);
                }}
                style={{
                  backgroundColor: row.style.backgroundColor || 'transparent',
                  paddingTop: `${row.style.paddingTop ?? 16}px`,
                  paddingBottom: `${row.style.paddingBottom ?? 16}px`,
                  paddingLeft: `${row.style.paddingLeft ?? 24}px`,
                  paddingRight: `${row.style.paddingRight ?? 24}px`,
                  borderWidth: `${row.style.borderWidth ?? 0}px`
                }}
                className={`relative group/row transition-all ${
                  isRowSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/10' : 'hover:outline-dashed hover:outline-1 hover:outline-slate-300'
                }`}
              >
                {/* Row Action Toolbar on Hover / Selection */}
                <div className="absolute left-2 -top-3.5 hidden group-hover/row:flex items-center gap-1 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-lg shadow-md z-20">
                  <span className="font-bold text-indigo-300 uppercase tracking-tight flex items-center gap-1">
                    <LayoutGrid className="w-3 h-3 text-indigo-400" />
                    {row.columns.length} {row.columns.length === 1 ? 'Janela' : 'Janelas'}
                  </span>
                  <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveRow(row.id, 'up'); }}
                    className="p-0.5 hover:text-indigo-400"
                    title="Mover linha para cima"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveRow(row.id, 'down'); }}
                    className="p-0.5 hover:text-indigo-400"
                    title="Mover linha para baixo"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicateRow(row.id); }}
                    className="p-0.5 hover:text-indigo-400"
                    title="Duplicar linha"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteRow(row.id); }}
                    className="p-0.5 hover:text-rose-400"
                    title="Excluir linha"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Columns container */}
                <div 
                  className={`flex gap-3 ${
                    deviceView === 'mobile' ? 'flex-col' : 'flex-row'
                  }`}
                >
                  {row.columns.map((col, cIndex) => {
                    const isEmpty = col.blocks.length === 0;
                    const isColDropTarget = dropTarget?.type === 'empty-column' && 
                                            dropTarget.rowId === row.id && 
                                            dropTarget.colId === col.id;

                    return (
                      <div
                        key={col.id}
                        style={{
                          width: deviceView === 'mobile' ? '100%' : `${col.widthPercentage}%`,
                          backgroundColor: col.style.backgroundColor || 'transparent',
                          paddingTop: `${col.style.paddingTop ?? 4}px`,
                          paddingBottom: `${col.style.paddingBottom ?? 4}px`,
                          paddingLeft: `${col.style.paddingLeft ?? 4}px`,
                          paddingRight: `${col.style.paddingRight ?? 4}px`,
                          verticalAlign: col.style.verticalAlign || 'top'
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isEmpty) {
                            setDropTarget({ type: 'empty-column', rowId: row.id, colId: col.id });
                          }
                        }}
                        onDrop={(e) => {
                          if (isEmpty) {
                            handleDropOnBlockSlot(e, row.id, col.id, 0);
                          }
                        }}
                        className={`min-h-[60px] rounded-lg transition-all ${
                          isColDropTarget 
                            ? 'border-2 border-dashed border-indigo-600 bg-indigo-50/50 scale-[0.99]' 
                            : isEmpty 
                            ? 'border border-dashed border-slate-300 flex items-center justify-center p-4 bg-slate-50/40' 
                            : ''
                        }`}
                      >
                        {isEmpty ? (
                          <div className="text-center text-slate-400 text-xs py-3 select-none">
                            <Plus className="w-4 h-4 mx-auto mb-1 stroke-[1.5]" />
                            <span>Solte elementos nesta coluna</span>
                          </div>
                        ) : (
                          col.blocks.map((block, bIndex) => renderCanvasBlock(block, row, col, bIndex))
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Drop slot between rows */}
              {renderRowDropSlot(rIndex + 1)}
            </React.Fragment>
          );
        })}

        {/* Bottom Helper to Add More Rows */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-center select-none">
          <p className="text-[11px] text-slate-400">
            Arraste qualquer elemento para criar uma nova seção ou posicione entre os blocos existentes.
          </p>
        </div>

      </div>

    </main>
  );
};
