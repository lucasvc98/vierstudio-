import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  BoardDocument, 
  BoardItem, 
  BoardConnection, 
  BoardViewport, 
  BoardItemType, 
  ShapeType 
} from '../../types/board';
import { MIRO_STICKY_COLORS, generateBoardId } from '../../data/initialBoards';
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Maximize2, 
  Move, 
  Type, 
  Square, 
  Circle, 
  Diamond, 
  Minus, 
  Plus, 
  ArrowRight,
  Palette,
  Edit3
} from 'lucide-react';

interface BoardCanvasProps {
  board: BoardDocument;
  onChange: (updated: BoardDocument) => void;
  activeTool: 'select' | 'sticky' | 'shape' | 'text' | 'connector' | 'frame';
  selectedStickyColor: string;
  selectedShapeType: ShapeType;
  onItemSelect?: (item: BoardItem | null) => void;
  onExpandWithAi?: (item: BoardItem) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  board,
  onChange,
  activeTool,
  selectedStickyColor,
  selectedShapeType,
  onItemSelect,
  onExpandWithAi
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<BoardViewport>(board.viewport || { x: 0, y: 0, zoom: 1 });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Track spacebar for pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Connector drawing state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [connectorPreviewMouse, setConnectorPreviewMouse] = useState<{ x: number; y: number } | null>(null);

  // Resizing state
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ width: number; height: number; mouseX: number; mouseY: number } | null>(null);

  // Color picker popup for selected item
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Sync internal viewport with board
  useEffect(() => {
    if (board.viewport) {
      setViewport(board.viewport);
    }
  }, [board.id]);

  const updateBoard = useCallback((newItems?: BoardItem[], newConnections?: BoardConnection[], newVp?: BoardViewport) => {
    const updated: BoardDocument = {
      ...board,
      items: newItems !== undefined ? newItems : board.items,
      connections: newConnections !== undefined ? newConnections : board.connections,
      viewport: newVp !== undefined ? newVp : viewport,
      updatedAt: new Date().toISOString()
    };
    onChange(updated);
  }, [board, onChange, viewport]);

  // Convert screen coordinates to canvas world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - viewport.x) / viewport.zoom;
    const y = (screenY - rect.top - viewport.y) / viewport.zoom;
    return { x, y };
  }, [viewport]);

  // Zoom handling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.15), 3.0);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom);
    const newY = mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom);

    const updatedVp = { x: newX, y: newY, zoom: newZoom };
    setViewport(updatedVp);
    updateBoard(undefined, undefined, updatedVp);
  };

  // Canvas background pointer down -> Pan or create element
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // If middle button or spacebar held or select tool on empty space
    if (e.button === 1 || isSpacePressed || (e.button === 0 && (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg'))) {
      if (activeTool === 'select' || e.button === 1 || isSpacePressed) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
        setSelectedItemId(null);
        setSelectedConnectionId(null);
        setEditingItemId(null);
        setShowColorPicker(false);
        if (onItemSelect) onItemSelect(null);
        return;
      }

      // If activeTool is sticky / shape / text / frame, click creates at cursor
      const worldPos = screenToWorld(e.clientX, e.clientY);
      if (activeTool === 'sticky') {
        const color = MIRO_STICKY_COLORS.find(c => c.bg === selectedStickyColor) || MIRO_STICKY_COLORS[0];
        const newItem: BoardItem = {
          id: generateBoardId('sticky'),
          type: 'sticky',
          x: Math.round(worldPos.x - 90),
          y: Math.round(worldPos.y - 90),
          width: 180,
          height: 180,
          content: { text: 'Nova anotação' },
          style: {
            backgroundColor: color.bg,
            borderColor: color.border,
            color: color.text,
            fontSize: 14,
            fontWeight: 600,
            shadow: true
          }
        };
        const nextItems = [...board.items, newItem];
        updateBoard(nextItems);
        setSelectedItemId(newItem.id);
        setEditingItemId(newItem.id);
      } else if (activeTool === 'shape') {
        const newItem: BoardItem = {
          id: generateBoardId('shape'),
          type: 'shape',
          x: Math.round(worldPos.x - 80),
          y: Math.round(worldPos.y - 40),
          width: 160,
          height: 80,
          content: { text: 'Novo Bloco', shapeType: selectedShapeType },
          style: {
            backgroundColor: '#ffffff',
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderStyle: 'solid',
            color: '#1e293b',
            fontSize: 14,
            fontWeight: 600,
            shadow: true
          }
        };
        const nextItems = [...board.items, newItem];
        updateBoard(nextItems);
        setSelectedItemId(newItem.id);
        setEditingItemId(newItem.id);
      } else if (activeTool === 'text') {
        const newItem: BoardItem = {
          id: generateBoardId('text'),
          type: 'text',
          x: Math.round(worldPos.x),
          y: Math.round(worldPos.y),
          width: 200,
          height: 60,
          content: { text: 'Clique duas vezes para editar texto' },
          style: {
            color: '#0f172a',
            fontSize: 18,
            fontWeight: 700
          }
        };
        const nextItems = [...board.items, newItem];
        updateBoard(nextItems);
        setSelectedItemId(newItem.id);
        setEditingItemId(newItem.id);
      } else if (activeTool === 'frame') {
        const newItem: BoardItem = {
          id: generateBoardId('frame'),
          type: 'frame',
          x: Math.round(worldPos.x - 200),
          y: Math.round(worldPos.y - 150),
          width: 500,
          height: 350,
          content: { title: 'Novo Quadro / Seção' },
          style: {
            backgroundColor: 'rgba(241, 245, 249, 0.4)',
            borderColor: '#94a3b8',
            borderWidth: 2,
            borderStyle: 'dashed',
            color: '#334155',
            fontSize: 16,
            fontWeight: 700
          }
        };
        const nextItems = [...board.items, newItem];
        updateBoard(nextItems);
        setSelectedItemId(newItem.id);
      }
    }
  };

  // Pointer move: pan, drag item, resize item, or connector line preview
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newVp = {
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      };
      setViewport(newVp);
      return;
    }

    if (resizingItemId && resizeStart) {
      const deltaX = (e.clientX - resizeStart.mouseX) / viewport.zoom;
      const deltaY = (e.clientY - resizeStart.mouseY) / viewport.zoom;
      const newW = Math.max(80, Math.round(resizeStart.width + deltaX));
      const newH = Math.max(50, Math.round(resizeStart.height + deltaY));

      const updated = board.items.map(item => {
        if (item.id === resizingItemId) {
          return { ...item, width: newW, height: newH };
        }
        return item;
      });
      updateBoard(updated);
      return;
    }

    if (draggingItemId) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const newX = Math.round(worldPos.x - dragOffset.x);
      const newY = Math.round(worldPos.y - dragOffset.y);

      const updated = board.items.map(item => {
        if (item.id === draggingItemId) {
          return { ...item, x: newX, y: newY };
        }
        return item;
      });
      updateBoard(updated);
      return;
    }

    if (connectingSourceId) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setConnectorPreviewMouse(worldPos);
    }
  };

  // Pointer up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      updateBoard(undefined, undefined, viewport);
    }
    if (resizingItemId) {
      setResizingItemId(null);
      setResizeStart(null);
    }
    if (draggingItemId) {
      setDraggingItemId(null);
    }
    if (connectingSourceId && !connectorPreviewMouse) {
      setConnectingSourceId(null);
    }
  };

  // Start dragging an item
  const handleItemMouseDown = (e: React.MouseEvent, item: BoardItem) => {
    e.stopPropagation();
    if (editingItemId === item.id) return;

    setSelectedItemId(item.id);
    setSelectedConnectionId(null);
    if (onItemSelect) onItemSelect(item);

    // If connecting tool is active and we clicked another item
    if (connectingSourceId && connectingSourceId !== item.id) {
      finishConnection(connectingSourceId, item.id);
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);
    setDraggingItemId(item.id);
    setDragOffset({
      x: worldPos.x - item.x,
      y: worldPos.y - item.y
    });
  };

  // Start connector from anchor handle
  const handleStartConnector = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    setConnectingSourceId(sourceId);
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setConnectorPreviewMouse(worldPos);
  };

  // Finish connector to target item
  const finishConnection = (fromId: string, toId: string) => {
    if (fromId === toId) {
      setConnectingSourceId(null);
      setConnectorPreviewMouse(null);
      return;
    }

    // Check if duplicate connection exists
    const exists = board.connections.some(c => (c.fromId === fromId || c.from === fromId) && (c.toId === toId || c.to === toId));
    if (!exists) {
      const newConn: BoardConnection = {
        id: generateBoardId('conn'),
        fromId: fromId,
        toId: toId,
        from: fromId,
        to: toId,
        color: '#64748b',
        arrow: true,
        arrowEnd: true,
        style: 'solid'
      };
      updateBoard(undefined, [...board.connections, newConn]);
    }
    setConnectingSourceId(null);
    setConnectorPreviewMouse(null);
  };

  // Double click item to edit text
  const handleItemDoubleClick = (e: React.MouseEvent, item: BoardItem) => {
    e.stopPropagation();
    setEditingItemId(item.id);
  };

  // Text change
  const handleTextChange = (itemId: string, newText: string) => {
    const updated = board.items.map(it => {
      if (it.id === itemId) {
        if (it.type === 'frame') {
          return { ...it, content: { ...it.content, title: newText } };
        }
        return { ...it, content: { ...it.content, text: newText } };
      }
      return it;
    });
    updateBoard(updated);
  };

  // Delete selected item or connection
  const handleDeleteSelected = () => {
    if (selectedItemId) {
      const nextItems = board.items.filter(it => it.id !== selectedItemId);
      const nextConns = board.connections.filter(c => 
        c.fromId !== selectedItemId && c.toId !== selectedItemId &&
        c.from !== selectedItemId && c.to !== selectedItemId
      );
      updateBoard(nextItems, nextConns);
      setSelectedItemId(null);
      setEditingItemId(null);
      setShowColorPicker(false);
      if (onItemSelect) onItemSelect(null);
    } else if (selectedConnectionId) {
      const nextConns = board.connections.filter(c => c.id !== selectedConnectionId);
      updateBoard(undefined, nextConns);
      setSelectedConnectionId(null);
    }
  };

  // Duplicate selected item
  const handleDuplicateSelected = () => {
    if (!selectedItemId) return;
    const target = board.items.find(it => it.id === selectedItemId);
    if (!target) return;

    const copy: BoardItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: generateBoardId(target.type),
      x: target.x + 40,
      y: target.y + 40
    };
    const nextItems = [...board.items, copy];
    updateBoard(nextItems);
    setSelectedItemId(copy.id);
    if (onItemSelect) onItemSelect(copy);
  };

  // Change color of selected item
  const handleColorChange = (color: typeof MIRO_STICKY_COLORS[0]) => {
    if (!selectedItemId) return;
    const updated = board.items.map(it => {
      if (it.id === selectedItemId) {
        return {
          ...it,
          style: {
            ...it.style,
            backgroundColor: color.bg,
            borderColor: color.border,
            color: color.text
          }
        };
      }
      return it;
    });
    updateBoard(updated);
    setShowColorPicker(false);
  };

  // Keyboard shortcuts (Delete, Escape, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingItemId) return; // Don't trigger shortcuts when typing inside an item

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedItemId(null);
        setSelectedConnectionId(null);
        setConnectingSourceId(null);
        setConnectorPreviewMouse(null);
        setShowColorPicker(false);
        if (onItemSelect) onItemSelect(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, selectedConnectionId, editingItemId, board]);

  // Center / Fit to view
  const handleFitToView = () => {
    if (!containerRef.current || board.items.length === 0) {
      const resetVp = { x: 50, y: 50, zoom: 1 };
      setViewport(resetVp);
      updateBoard(undefined, undefined, resetVp);
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    board.items.forEach(it => {
      minX = Math.min(minX, it.x);
      minY = Math.min(minY, it.y);
      maxX = Math.max(maxX, it.x + it.width);
      maxY = Math.max(maxY, it.y + it.height);
    });

    const rect = containerRef.current.getBoundingClientRect();
    const contentW = maxX - minX + 200;
    const contentH = maxY - minY + 200;

    const zoom = Math.min(Math.max(Math.min(rect.width / contentW, rect.height / contentH), 0.3), 1.2);
    const vpX = (rect.width - contentW * zoom) / 2 - (minX - 100) * zoom;
    const vpY = (rect.height - contentH * zoom) / 2 - (minY - 100) * zoom;

    const newVp = { x: vpX, y: vpY, zoom };
    setViewport(newVp);
    updateBoard(undefined, undefined, newVp);
  };

  const selectedItem = board.items.find(it => it.id === selectedItemId);

  // Helper to calculate connector anchor points
  const getItemCenter = (id: string) => {
    const item = board.items.find(i => i.id === id);
    if (!item) return { x: 0, y: 0, left: 0, right: 0, top: 0, bottom: 0, w: 0, h: 0 };
    return {
      x: item.x + item.width / 2,
      y: item.y + item.height / 2,
      left: item.x,
      right: item.x + item.width,
      top: item.y,
      bottom: item.y + item.height,
      w: item.width,
      h: item.height
    };
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full overflow-hidden select-none bg-[#f8f9fa] cursor-default"
      style={{
        backgroundImage: `
          radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)
        `,
        backgroundSize: `${32 * viewport.zoom}px ${32 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`
      }}
    >
      {/* Canvas World Transform Container */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
        }}
      >
        {/* SVG Layer for Connections */}
        <svg 
          className="absolute top-0 left-0 w-[10000px] h-[10000px] pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="miro-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker
              id="miro-arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>
          </defs>

          {/* Render Connections */}
          {board.connections.map(conn => {
            const fromId = conn.fromId || conn.from || '';
            const toId = conn.toId || conn.to || '';
            const src = getItemCenter(fromId);
            const dst = getItemCenter(toId);
            if (!src || !dst) return null;

            // Simple smart anchor selection (left/right or top/bottom)
            const isHorizontal = Math.abs(dst.x - src.x) > Math.abs(dst.y - src.y);
            let startX = src.x;
            let startY = src.y;
            let endX = dst.x;
            let endY = dst.y;

            if (isHorizontal) {
              startX = dst.x > src.x ? src.right : src.left;
              endX = dst.x > src.x ? dst.left : dst.right;
            } else {
              startY = dst.y > src.y ? src.bottom : src.top;
              endY = dst.y > src.y ? dst.top : dst.bottom;
            }

            const dx = Math.abs(endX - startX) * 0.5;
            const pathData = isHorizontal
              ? `M ${startX} ${startY} C ${startX + (dst.x > src.x ? dx : -dx)} ${startY}, ${endX - (dst.x > src.x ? dx : -dx)} ${endY}, ${endX} ${endY}`
              : `M ${startX} ${startY} C ${startX} ${startY + (dst.y > src.y ? 60 : -60)}, ${endX} ${endY - (dst.y > src.y ? 60 : -60)}, ${endX} ${endY}`;

            const isSelected = selectedConnectionId === conn.id;
            const hasArrow = conn.arrow !== false && conn.arrowEnd !== false;

            return (
              <g 
                key={conn.id} 
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedConnectionId(conn.id);
                  setSelectedItemId(null);
                }}
              >
                {/* Fat transparent path for easy clicking */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                />
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? '#2563eb' : (conn.color || '#64748b')}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={conn.style === 'dashed' ? '5,5' : undefined}
                  markerEnd={hasArrow ? (isSelected ? 'url(#miro-arrow-selected)' : 'url(#miro-arrow)') : undefined}
                  className="transition-colors"
                />
                {conn.label && (
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 8}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="11"
                    fontWeight="600"
                    className="bg-white px-1 font-sans"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Drawing Connector Line */}
          {connectingSourceId && connectorPreviewMouse && (
            <path
              d={`M ${getItemCenter(connectingSourceId).x} ${getItemCenter(connectingSourceId).y} L ${connectorPreviewMouse.x} ${connectorPreviewMouse.y}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4,4"
              markerEnd="url(#miro-arrow-selected)"
            />
          )}
        </svg>

        {/* Render Canvas Items */}
        {board.items.map(item => {
          const isSelected = selectedItemId === item.id;
          const isEditing = editingItemId === item.id;

          // Sticky Note Rendering (Authentic Miro look)
          if (item.type === 'sticky') {
            return (
              <div
                key={item.id}
                onMouseDown={e => handleItemMouseDown(e, item)}
                onDoubleClick={e => handleItemDoubleClick(e, item)}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  backgroundColor: item.style?.backgroundColor || '#fff9b1',
                  color: item.style?.color || '#713f12',
                  fontSize: `${item.style?.fontSize || 14}px`,
                  fontWeight: item.style?.fontWeight || 600,
                  transform: 'rotate(-0.5deg)',
                }}
                className={`pointer-events-auto rounded-md p-4 transition-shadow flex flex-col justify-between group select-none shadow-md hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                {/* Folded corner bottom-right */}
                <div 
                  className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none opacity-40"
                  style={{
                    borderRight: '16px solid rgba(0,0,0,0.15)',
                    borderTop: '16px solid transparent',
                    borderBottomRightRadius: '4px'
                  }}
                />

                {/* Text Content */}
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={item.content.text || ''}
                    onChange={e => handleTextChange(item.id, e.target.value)}
                    onBlur={() => setEditingItemId(null)}
                    className="w-full h-full bg-transparent resize-none border-none outline-none font-sans leading-relaxed"
                    style={{ color: item.style?.color || '#713f12', fontSize: `${item.style?.fontSize || 14}px` }}
                  />
                ) : (
                  <div className="w-full h-full overflow-hidden font-sans whitespace-pre-wrap break-words leading-relaxed">
                    {item.content.text}
                  </div>
                )}

                {/* Connection Anchors on Hover */}
                <div 
                  onClick={e => handleStartConnector(e, item.id)}
                  title="Puxe para conectar a outro bloco"
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm cursor-crosshair z-10"
                >
                  <Plus className="w-3.5 h-3.5" />
                </div>

                {/* Resize Handle at bottom right */}
                {isSelected && (
                  <div
                    onMouseDown={e => {
                      e.stopPropagation();
                      setResizingItemId(item.id);
                      setResizeStart({
                        width: item.width,
                        height: item.height,
                        mouseX: e.clientX,
                        mouseY: e.clientY
                      });
                    }}
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-sm cursor-se-resize z-20 shadow-xs"
                  />
                )}
              </div>
            );
          }

          // Shape Rendering (Flowchart & Diagram Shapes)
          if (item.type === 'shape') {
            const shapeType = item.content.shapeType || 'rectangle';
            const isCircle = shapeType === 'circle';
            const isDiamond = shapeType === 'diamond';
            const isPill = shapeType === 'pill';

            return (
              <div
                key={item.id}
                onMouseDown={e => handleItemMouseDown(e, item)}
                onDoubleClick={e => handleItemDoubleClick(e, item)}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  backgroundColor: item.style?.backgroundColor || '#ffffff',
                  borderColor: item.style?.borderColor || '#3b82f6',
                  borderWidth: `${item.style?.borderWidth || 2}px`,
                  borderStyle: item.style?.borderStyle || 'solid',
                  color: item.style?.color || '#1e293b',
                  fontSize: `${item.style?.fontSize || 14}px`,
                  fontWeight: item.style?.fontWeight || 600,
                  borderRadius: isCircle ? '50%' : isPill ? '9999px' : isDiamond ? '4px' : '12px',
                  transform: isDiamond ? 'rotate(45deg)' : undefined
                }}
                className={`pointer-events-auto flex items-center justify-center p-3 text-center transition-all group select-none shadow-sm hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ transform: isDiamond ? 'rotate(-45deg)' : undefined }}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={item.content.text || ''}
                      onChange={e => handleTextChange(item.id, e.target.value)}
                      onBlur={() => setEditingItemId(null)}
                      className="w-full bg-transparent text-center border-none outline-none font-sans font-semibold"
                      style={{ color: item.style?.color || '#1e293b', fontSize: `${item.style?.fontSize || 14}px` }}
                    />
                  ) : (
                    <span className="font-sans break-words">{item.content.text}</span>
                  )}
                </div>

                {/* Connection Anchor */}
                <div 
                  onClick={e => handleStartConnector(e, item.id)}
                  title="Puxe para conectar a outro bloco"
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm cursor-crosshair z-10"
                  style={{ transform: isDiamond ? 'rotate(-45deg)' : undefined }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </div>

                {/* Resize Handle */}
                {isSelected && (
                  <div
                    onMouseDown={e => {
                      e.stopPropagation();
                      setResizingItemId(item.id);
                      setResizeStart({
                        width: item.width,
                        height: item.height,
                        mouseX: e.clientX,
                        mouseY: e.clientY
                      });
                    }}
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-sm cursor-se-resize z-20"
                  />
                )}
              </div>
            );
          }

          // Frame Rendering (Miro Frame / Seção)
          if (item.type === 'frame') {
            return (
              <div
                key={item.id}
                onMouseDown={e => handleItemMouseDown(e, item)}
                onDoubleClick={e => handleItemDoubleClick(e, item)}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  backgroundColor: item.style?.backgroundColor || 'rgba(241, 245, 249, 0.4)',
                  borderColor: item.style?.borderColor || '#cbd5e1',
                  borderWidth: `${item.style?.borderWidth || 2}px`,
                  borderStyle: item.style?.borderStyle || 'dashed'
                }}
                className={`pointer-events-auto rounded-2xl p-4 transition-all group select-none ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Frame Title Bar */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={item.content.title || ''}
                      onChange={e => handleTextChange(item.id, e.target.value)}
                      onBlur={() => setEditingItemId(null)}
                      className="bg-transparent font-bold text-sm text-slate-700 outline-none border-b border-blue-500"
                    />
                  ) : (
                    <span className="font-bold text-sm text-slate-700 tracking-tight flex items-center gap-2">
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      {item.content.title || 'Quadro'}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">Frame</span>
                </div>

                {/* Resize Handle */}
                {isSelected && (
                  <div
                    onMouseDown={e => {
                      e.stopPropagation();
                      setResizingItemId(item.id);
                      setResizeStart({
                        width: item.width,
                        height: item.height,
                        mouseX: e.clientX,
                        mouseY: e.clientY
                      });
                    }}
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-sm cursor-se-resize z-20"
                  />
                )}
              </div>
            );
          }

          // Text item
          if (item.type === 'text') {
            return (
              <div
                key={item.id}
                onMouseDown={e => handleItemMouseDown(e, item)}
                onDoubleClick={e => handleItemDoubleClick(e, item)}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  minHeight: item.height,
                  color: item.style?.color || '#0f172a',
                  fontSize: `${item.style?.fontSize || 18}px`,
                  fontWeight: item.style?.fontWeight || 700
                }}
                className={`pointer-events-auto p-2 group select-none ${
                  isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''
                }`}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={item.content.text || ''}
                    onChange={e => handleTextChange(item.id, e.target.value)}
                    onBlur={() => setEditingItemId(null)}
                    className="w-full bg-transparent resize-none border-none outline-none font-sans"
                    style={{ color: item.style?.color || '#0f172a', fontSize: `${item.style?.fontSize || 18}px` }}
                  />
                ) : (
                  <div className="font-sans whitespace-pre-wrap">{item.content.text}</div>
                )}
              </div>
            );
          }

          // Mindmap Node item
          return (
            <div
              key={item.id}
              onMouseDown={e => handleItemMouseDown(e, item)}
              onDoubleClick={e => handleItemDoubleClick(e, item)}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                backgroundColor: item.style?.backgroundColor || '#ffffff',
                borderColor: item.style?.borderColor || '#3b82f6',
                color: item.style?.color || '#0f172a',
                fontSize: `${item.style?.fontSize || 14}px`,
                fontWeight: item.style?.fontWeight || 600
              }}
              className={`pointer-events-auto rounded-xl p-3 border-2 shadow-sm flex items-center justify-center text-center transition-all group select-none ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <span className="font-sans">{item.content.text}</span>

              {/* Anchor */}
              <div 
                onClick={e => handleStartConnector(e, item.id)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm cursor-crosshair z-10"
              >
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Miro Context Bar on Selected Item */}
      {selectedItem && (
        <div 
          className="absolute z-30 flex items-center gap-1.5 p-1.5 bg-slate-900/95 text-white rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in duration-150"
          style={{
            left: Math.max(16, viewport.x + (selectedItem.x + selectedItem.width / 2) * viewport.zoom - 140),
            top: Math.max(16, viewport.y + selectedItem.y * viewport.zoom - 50)
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Color Picker Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Mudar cor Miro"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <div 
                className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                style={{ backgroundColor: selectedItem.style?.backgroundColor || '#fff9b1' }}
              />
              <Palette className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Miro Color Picker Flyout (Image 5) */}
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-52 animate-in fade-in zoom-in-95 duration-150">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {MIRO_STICKY_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleColorChange(c)}
                      title={c.label}
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                      className="h-8 rounded-lg border-2 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      {selectedItem.style?.backgroundColor === c.bg && (
                        <div className="w-2 h-2 rounded-full bg-slate-800/80" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-slate-600 text-xs font-semibold">
                  <Square className="w-3.5 h-3.5" />
                  <span>Bloco Miro</span>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-700 mx-0.5" />

          {/* Edit text */}
          <button
            onClick={() => setEditingItemId(selectedItem.id)}
            title="Editar texto"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* AI Expand Node Button */}
          {onExpandWithAi && (
            <button
              onClick={() => onExpandWithAi(selectedItem)}
              title="Expandir ideia com Inteligência Artificial"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Expandir IA</span>
            </button>
          )}

          <div className="w-px h-4 bg-slate-700 mx-0.5" />

          {/* Duplicate */}
          <button
            onClick={handleDuplicateSelected}
            title="Duplicar bloco (Ctrl+D)"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteSelected}
            title="Excluir bloco (Del)"
            className="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Delete on Selected Connection */}
      {selectedConnectionId && (
        <div 
          className="absolute z-30 bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl shadow-xl text-xs"
        >
          <span>Conexão selecionada</span>
          <button
            onClick={handleDeleteSelected}
            className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-semibold cursor-pointer"
          >
            Excluir Linha
          </button>
        </div>
      )}

      {/* Bottom-right Zoom & Navigation Controls (Image 2 style) */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center bg-white rounded-xl shadow-lg border border-slate-200/80 p-1 text-slate-700">
        <button
          onClick={handleFitToView}
          title="Ajustar à tela"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button
          onClick={() => {
            const newZoom = Math.max(viewport.zoom * 0.85, 0.15);
            setViewport(v => ({ ...v, zoom: newZoom }));
            updateBoard(undefined, undefined, { ...viewport, zoom: newZoom });
          }}
          title="Diminuir zoom"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-2 text-xs font-bold font-mono min-w-[50px] text-center select-none">
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button
          onClick={() => {
            const newZoom = Math.min(viewport.zoom * 1.15, 3.0);
            setViewport(v => ({ ...v, zoom: newZoom }));
            updateBoard(undefined, undefined, { ...viewport, zoom: newZoom });
          }}
          title="Aumentar zoom"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
