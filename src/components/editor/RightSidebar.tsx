import React from 'react';
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Underline, Link2, Image as ImageIcon, Sliders, 
  Smartphone, Monitor, Eye, Sparkles, FolderOpen, Tag,
  LayoutGrid, Plus, Minus, Trash2, Copy, Upload, AlertTriangle, Check,
  ExternalLink, Loader2
} from 'lucide-react';
import { EmailBlock, EmailRow, EmailColumn, GlobalEmailSettings, MediaAsset } from '../../types/email';
import { compressImageFile } from '../../utils/imageOptimizer';
import { uploadImageFileToCloud } from '../../utils/cloudImageUploader';

interface RightSidebarProps {
  selectedBlock: EmailBlock | null;
  selectedRow: EmailRow | null;
  onUpdateBlock: (updated: EmailBlock) => void;
  onUpdateRow: (updated: EmailRow) => void;
  onOpenFileManager: () => void;
  onDeselectBlock?: () => void;
  onDeleteBlock?: (blockId: string) => void;
  globalSettings: GlobalEmailSettings;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedBlock,
  selectedRow,
  onUpdateBlock,
  onUpdateRow,
  onOpenFileManager,
  onDeselectBlock,
  onDeleteBlock,
  globalSettings
}) => {
  const [isConvertingImage, setIsConvertingImage] = React.useState(false);
  const [convertedNotice, setConvertedNotice] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Handler to change column/window quantity dynamically
  const handleChangeColumnCount = (targetCount: number) => {
    if (!selectedRow) return;
    if (targetCount < 1 || targetCount > 4) return;
    const currentCount = selectedRow.columns.length;
    if (currentCount === targetCount) return;

    let newLayout: EmailRow['layout'] = '1-col';
    if (targetCount === 2) newLayout = '2-col-equal';
    else if (targetCount === 3) newLayout = '3-col';
    else if (targetCount === 4) newLayout = '4-col';

    const widthPct = Math.round((100 / targetCount) * 1000) / 1000;

    let newColumns: EmailColumn[] = [];

    if (targetCount < currentCount) {
      newColumns = selectedRow.columns.slice(0, targetCount).map(col => ({
        ...col,
        widthPercentage: widthPct
      }));
    } else {
      newColumns = selectedRow.columns.map(col => ({
        ...col,
        widthPercentage: widthPct
      }));

      const lastCol = selectedRow.columns[selectedRow.columns.length - 1];
      const itemsToAdd = targetCount - currentCount;

      const sampleProducts = [
        { title: 'CAMISETAS', desc: 'Versatilidade com acabamento premium.', img: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_9997-66be88d6a98713955c17879257591779-640-0.webp' },
        { title: 'LOAFERS', desc: 'Elegância e conforto em cada passo.', img: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_9345-aa0c59bde831b0659d17875312406767-640-0.webp' },
        { title: 'COLETES', desc: 'Camadas marcantes para composições premium.', img: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_2599-359b4eb742e7340b4117816300103197-640-0.webp' },
        { title: 'ACESSÓRIOS', desc: 'Presença e acabamento em cada detalhe.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' }
      ];

      for (let i = 0; i < itemsToAdd; i++) {
        const newColIndex = currentCount + i + 1;
        if (lastCol && lastCol.blocks.length > 0) {
          const sample = sampleProducts[(newColIndex - 1) % sampleProducts.length];
          const clonedBlocks = lastCol.blocks.map(b => {
            const newId = `blk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
            if (b.type === 'image') {
              return {
                ...JSON.parse(JSON.stringify(b)),
                id: newId,
                content: {
                  ...b.content,
                  alt: sample.title,
                  url: sample.img
                }
              };
            }
            if (b.type === 'heading') {
              return {
                ...JSON.parse(JSON.stringify(b)),
                id: newId,
                content: {
                  ...b.content,
                  text: sample.title
                }
              };
            }
            if (b.type === 'text') {
              if (b.content.html && b.content.html.includes('VER MODELOS')) {
                return {
                  ...JSON.parse(JSON.stringify(b)),
                  id: newId
                };
              }
              return {
                ...JSON.parse(JSON.stringify(b)),
                id: newId,
                content: {
                  html: sample.desc,
                  text: sample.desc
                }
              };
            }
            return {
              ...JSON.parse(JSON.stringify(b)),
              id: newId
            };
          });

          newColumns.push({
            id: `col-${Date.now()}-${i}`,
            widthPercentage: widthPct,
            style: { ...lastCol.style },
            blocks: clonedBlocks
          });
        }
      }
    }

    onUpdateRow({
      ...selectedRow,
      layout: newLayout,
      columns: newColumns
    });
  };

  if (!selectedBlock && !selectedRow) {
    return (
      <aside className="w-80 h-full bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center select-none text-slate-400 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
          <Sliders className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-700">Nenhum elemento selecionado</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
          Clique em qualquer texto, imagem, botão ou linha no canvas para personalizar suas propriedades.
        </p>
      </aside>
    );
  }

  // If a row is selected (and no specific block inside is active)
  if (!selectedBlock && selectedRow) {
    return (
      <aside className="w-80 h-full min-h-0 bg-white border-l border-slate-200 p-4 overflow-y-auto select-none shrink-0 pb-24 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Configurações da Janela / Seção</h3>
              <span className="text-[10px] text-indigo-600 font-semibold">{selectedRow.columns.length} Janelas de Produtos</span>
            </div>
          </div>
        </div>

        {/* ================= QUANTIDADE DE JANELAS / PRODUTOS ================= */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <LayoutGrid className="w-3.5 h-3.5" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  Quantidade de Janelas
                </label>
                <span className="text-[10px] text-slate-500">
                  Imagens ou produtos lado a lado
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs font-mono">
              {selectedRow.columns.length} {selectedRow.columns.length === 1 ? 'Janela' : 'Janelas'}
            </span>
          </div>

          {/* 1, 2, 3, 4 window selector */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleChangeColumnCount(num)}
                className={`py-2 px-1 text-center rounded-xl font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRow.columns.length === num
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600 ring-offset-1'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50/50 hover:border-indigo-300'
                }`}
              >
                <span className="text-base font-black leading-none">{num}</span>
                <span className="text-[9px] uppercase tracking-tighter">
                  {num === 1 ? 'Janela' : 'Janelas'}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              disabled={selectedRow.columns.length <= 1}
              onClick={() => handleChangeColumnCount(selectedRow.columns.length - 1)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Minus className="w-3 h-3" /> Remover
            </button>
            <button
              disabled={selectedRow.columns.length >= 4}
              onClick={() => handleChangeColumnCount(selectedRow.columns.length + 1)}
              className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Plus className="w-3 h-3" /> Adicionar Janela
            </button>
          </div>
        </div>

        {/* ================= GERENCIAR CONTEÚDOS DAS JANELAS ================= */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Editar Conteúdo das Janelas</span>
          </div>

          {selectedRow.columns.map((col, colIdx) => {
            const imgBlock = col.blocks.find(b => b.type === 'image');
            const headingBlock = col.blocks.find(b => b.type === 'heading');
            const textBlocks = col.blocks.filter(b => b.type === 'text');
            const descBlock = textBlocks.find(b => !b.content.html || !b.content.html.includes('VER MODELOS'));
            const linkBlock = textBlocks.find(b => b.content.html && b.content.html.includes('VER MODELOS'));

            return (
              <div key={col.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                      {colIdx + 1}
                    </span>
                    <span>Janela {colIdx + 1}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round(col.widthPercentage)}% largura
                  </span>
                </div>

                {/* Image preview & URL */}
                {imgBlock && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Imagem do Produto
                    </label>
                    <div className="flex items-center gap-2">
                      <img 
                        src={imgBlock.content.url} 
                        alt={imgBlock.content.alt || ''} 
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0" 
                      />
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={imgBlock.content.url || ''}
                          onChange={(e) => {
                            const updatedCols = selectedRow.columns.map(c => {
                              if (c.id !== col.id) return c;
                              return {
                                ...c,
                                blocks: c.blocks.map(b => b.id === imgBlock.id ? { ...b, content: { ...b.content, url: e.target.value } } : b)
                              };
                            });
                            onUpdateRow({ ...selectedRow, columns: updatedCols });
                          }}
                          placeholder="URL da imagem (HTTPS)"
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={onOpenFileManager}
                            className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <FolderOpen className="w-3 h-3" /> Trocar na Biblioteca
                          </button>
                          {imgBlock.content.url?.startsWith('data:image/') && (
                            <button
                              type="button"
                              disabled={isConvertingImage}
                              onClick={async () => {
                                setIsConvertingImage(true);
                                try {
                                  const res = await fetch('/api/upload-image', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ base64: imgBlock.content.url, filename: 'produto.jpg' })
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    if (data.success && data.url) {
                                      const updatedCols = selectedRow.columns.map(c => {
                                        if (c.id !== col.id) return c;
                                        return {
                                          ...c,
                                          blocks: c.blocks.map(b => b.id === imgBlock.id ? { ...b, content: { ...b.content, url: data.url } } : b)
                                        };
                                      });
                                      onUpdateRow({ ...selectedRow, columns: updatedCols });
                                    }
                                  }
                                } catch (err) {
                                  console.error('Erro ao converter base64:', err);
                                } finally {
                                  setIsConvertingImage(false);
                                }
                              }}
                              className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-colors"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>Remover Base64</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Title input */}
                {headingBlock && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Título
                    </label>
                    <input
                      type="text"
                      value={headingBlock.content.text || ''}
                      onChange={(e) => {
                        const updatedCols = selectedRow.columns.map(c => {
                          if (c.id !== col.id) return c;
                          return {
                            ...c,
                            blocks: c.blocks.map(b => b.id === headingBlock.id ? { ...b, content: { ...b.content, text: e.target.value } } : b)
                          };
                        });
                        onUpdateRow({ ...selectedRow, columns: updatedCols });
                      }}
                      placeholder="Ex: CAMISETAS"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold"
                    />
                  </div>
                )}

                {/* Description input */}
                {descBlock && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={descBlock.content.text || ''}
                      onChange={(e) => {
                        const updatedCols = selectedRow.columns.map(c => {
                          if (c.id !== col.id) return c;
                          return {
                            ...c,
                            blocks: c.blocks.map(b => b.id === descBlock.id ? { ...b, content: { html: e.target.value, text: e.target.value } } : b)
                          };
                        });
                        onUpdateRow({ ...selectedRow, columns: updatedCols });
                      }}
                      placeholder="Ex: Versatilidade com acabamento premium."
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-600"
                    />
                  </div>
                )}

                {/* Link / Button */}
                {linkBlock && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Texto do Link
                    </label>
                    <input
                      type="text"
                      value={linkBlock.content.text || 'VER MODELOS'}
                      onChange={(e) => {
                        const updatedCols = selectedRow.columns.map(c => {
                          if (c.id !== col.id) return c;
                          return {
                            ...c,
                            blocks: c.blocks.map(b => {
                              if (b.id !== linkBlock.id) return b;
                              const text = e.target.value;
                              const newHtml = `<div style="text-align: center;"><a href="#" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; font-weight: 800; letter-spacing: 1px; color: #111111; text-decoration: none; border-bottom: 2px solid #b88a2a; padding-bottom: 4px; display: inline-block;">${text}</a></div>`;
                              return { ...b, content: { html: newHtml, text } };
                            })
                          };
                        });
                        onUpdateRow({ ...selectedRow, columns: updatedCols });
                      }}
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-bold"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Row Background Color */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Aparência da Linha
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor de Fundo da Linha</label>
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
              <input
                type="color"
                value={selectedRow.style.backgroundColor || '#ffffff'}
                onChange={e => onUpdateRow({
                  ...selectedRow,
                  style: { ...selectedRow.style, backgroundColor: e.target.value }
                })}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={selectedRow.style.backgroundColor || '#ffffff'}
                onChange={e => onUpdateRow({
                  ...selectedRow,
                  style: { ...selectedRow.style, backgroundColor: e.target.value }
                })}
                className="w-full text-xs font-mono uppercase focus:outline-none"
              />
            </div>
          </div>

          {/* Imagem de Fundo da Seção / Linha */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800">Imagem de Fundo da Seção</label>
              {selectedRow.style.backgroundImage && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">Ativo</span>
              )}
            </div>

            {selectedRow.style.backgroundImage ? (
              <div className="space-y-2">
                <div className="h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center relative group">
                  <img src={selectedRow.style.backgroundImage} alt="Fundo" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-semibold">
                    Fundo aplicado
                  </div>
                </div>

                <button
                  onClick={() => onUpdateRow({
                    ...selectedRow,
                    style: {
                      ...selectedRow.style,
                      backgroundImage: undefined
                    }
                  })}
                  className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Imagem de Fundo</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Imagem de Fundo (Upload)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      try {
                        const optimized = await compressImageFile(files[0], 1200, 0.85);
                        onUpdateRow({
                          ...selectedRow,
                          style: {
                            ...selectedRow.style,
                            backgroundImage: optimized.dataUrl,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }
                        });
                      } catch (err) {
                        console.error('Falha ao subir imagem de fundo', err);
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />
                </label>

                <button
                  onClick={onOpenFileManager}
                  className="w-full py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Escolher da Galeria</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Ou cole uma URL direta</label>
              <input
                type="text"
                placeholder="https://..."
                value={selectedRow.style.backgroundImage || ''}
                onChange={e => onUpdateRow({
                  ...selectedRow,
                  style: {
                    ...selectedRow.style,
                    backgroundImage: e.target.value || undefined,
                    backgroundSize: selectedRow.style.backgroundSize || 'cover',
                    backgroundPosition: selectedRow.style.backgroundPosition || 'center',
                    backgroundRepeat: selectedRow.style.backgroundRepeat || 'no-repeat'
                  }
                })}
                className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:outline-none bg-white font-mono"
              />
            </div>
          </div>

          {/* Padding */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Padding Superior</label>
              <input
                type="number"
                value={selectedRow.style.paddingTop ?? 16}
                onChange={e => onUpdateRow({
                  ...selectedRow,
                  style: { ...selectedRow.style, paddingTop: Number(e.target.value) }
                })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Padding Inferior</label>
              <input
                type="number"
                value={selectedRow.style.paddingBottom ?? 16}
                onChange={e => onUpdateRow({
                  ...selectedRow,
                  style: { ...selectedRow.style, paddingBottom: Number(e.target.value) }
                })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Padding Lateral</label>
              <input
                type="number"
                value={selectedRow.style.paddingLeft ?? 24}
                onChange={e => {
                  const val = Number(e.target.value);
                  onUpdateRow({
                    ...selectedRow,
                    style: { ...selectedRow.style, paddingLeft: val, paddingRight: val }
                  });
                }}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Borda (px)</label>
              <input
                type="number"
                value={selectedRow.style.borderWidth ?? 0}
                onChange={e => onUpdateRow({
                  ...selectedRow,
                  style: { ...selectedRow.style, borderWidth: Number(e.target.value) }
                })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Active Block is selected
  const block = selectedBlock!;
  const updateContent = (fields: Record<string, any>) => {
    onUpdateBlock({
      ...block,
      content: { ...block.content, ...fields }
    });
  };

  const updateStyle = (fields: Partial<EmailBlock['style']>) => {
    onUpdateBlock({
      ...block,
      style: { ...block.style, ...fields }
    });
  };

  return (
    <aside className="w-80 h-full min-h-0 bg-white border-l border-slate-200 p-4 overflow-y-auto select-none shrink-0 pb-24">
      
      {/* Multi-window shortcut banner if block is part of multi-column row */}
      {selectedRow && selectedRow.columns.length > 1 && onDeselectBlock && (
        <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-indigo-950 block">
                Seção com {selectedRow.columns.length} Janelas
              </span>
              <span className="text-[10px] text-indigo-600">
                Altere a quantidade de colunas / imagens
              </span>
            </div>
          </div>
          <button
            onClick={onDeselectBlock}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors shrink-0"
          >
            Configurar Janelas
          </button>
        </div>
      )}

      {/* Shortcut banner to remove row background image if present */}
      {selectedRow && selectedRow.style.backgroundImage && (
        <div className="mb-3 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-amber-950 block truncate">
              Fundo ativo nesta seção
            </span>
            <span className="text-[10px] text-amber-700 block truncate">
              Imagem de fundo aplicada na linha
            </span>
          </div>
          <button
            onClick={() => onUpdateRow({
              ...selectedRow,
              style: {
                ...selectedRow.style,
                backgroundImage: undefined
              }
            })}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-colors shrink-0"
            title="Remover imagem de fundo desta seção com 1 clique"
          >
            Remover Fundo
          </button>
        </div>
      )}

      {/* Block Type Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
            {block.type.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 capitalize">Bloco: {block.type}</h3>
            <span className="text-[10px] text-slate-400 font-mono">ID: {block.id.slice(0, 10)}</span>
          </div>
        </div>

        {/* Device Visibility Selector */}
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          <button
            onClick={() => onUpdateBlock({ ...block, deviceVisibility: 'all' })}
            title="Visível em todos os dispositivos"
            className={`p-1 rounded ${block.deviceVisibility === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400'}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateBlock({ ...block, deviceVisibility: 'desktop' })}
            title="Somente Desktop"
            className={`p-1 rounded ${block.deviceVisibility === 'desktop' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateBlock({ ...block, deviceVisibility: 'mobile' })}
            title="Somente Mobile"
            className={`p-1 rounded ${block.deviceVisibility === 'mobile' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* ================= HEADING CONFIG ================= */}
        {block.type === 'heading' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Texto do Título</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = block.content.html || block.content.text || '';
                      updateContent({ html: `<b>${cur || 'Título'}</b>`, text: cur });
                    }}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded font-bold border border-slate-200"
                    title="Envolver em Negrito <b>"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = block.content.html || block.content.text || '';
                      updateContent({ html: `<i>${cur || 'Título'}</i>`, text: cur });
                    }}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded italic font-serif border border-slate-200"
                    title="Envolver em Itálico <i>"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = block.content.html || block.content.text || '';
                      updateContent({ html: `<u>${cur || 'Título'}</u>`, text: cur });
                    }}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded underline border border-slate-200"
                    title="Envolver em Sublinhado <u>"
                  >
                    U
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={block.content.html || block.content.text || ''}
                onChange={e => updateContent({ html: e.target.value, text: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Estilo do Texto: Bold, Italic, Underline */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estilo do Título</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    const isBold = block.style.fontWeight === 700 || block.style.fontWeight === 'bold';
                    updateStyle({ fontWeight: isBold ? 400 : 700 });
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    (block.style.fontWeight === 700 || block.style.fontWeight === 'bold')
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Negrito (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                  <span>Negrito</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const isItalic = block.style.fontStyle === 'italic';
                    updateStyle({ fontStyle: isItalic ? 'normal' : 'italic' });
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs italic flex items-center justify-center gap-1 transition-all ${
                    block.style.fontStyle === 'italic'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Itálico (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                  <span>Itálico</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const isUnderline = block.style.textDecoration === 'underline';
                    updateStyle({ textDecoration: isUnderline ? 'none' : 'underline' });
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs underline flex items-center justify-center gap-1 transition-all ${
                    block.style.textDecoration === 'underline'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Sublinhado (Underline)"
                >
                  <Underline className="w-3.5 h-3.5" />
                  <span>Sublinhado</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nível de Título</label>
                <select
                  value={block.content.level || 'h2'}
                  onChange={e => updateContent({ level: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="h1">H1 (Principal - 28px)</option>
                  <option value="h2">H2 (Seção - 22px)</option>
                  <option value="h3">H3 (Subtítulo - 18px)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tamanho (px)</label>
                <input
                  type="number"
                  value={block.style.fontSize || 22}
                  onChange={e => updateStyle({ fontSize: Number(e.target.value) })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        {/* ================= TEXT CONFIG ================= */}
        {block.type === 'text' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Conteúdo do Parágrafo</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = block.content.html || block.content.text || '';
                      updateContent({ html: `<b>${cur || 'Texto'}</b>`, text: cur });
                    }}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded font-bold border border-slate-200"
                    title="Envolver em Negrito <b>"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = block.content.html || block.content.text || '';
                      updateContent({ html: `<i>${cur || 'Texto'}</i>`, text: cur });
                    }}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded italic font-serif border border-slate-200"
                    title="Envolver em Itálico <i>"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = block.content.html || block.content.text || '';
                      updateContent({ html: `<u>${cur || 'Texto'}</u>`, text: cur });
                    }}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded underline border border-slate-200"
                    title="Envolver em Sublinhado <u>"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = block.content.html || block.content.text || '';
                      updateContent({ html: `<font color="#ff6b00">${cur || 'Destaque'}</font>`, text: cur });
                    }}
                    className="px-1.5 py-0.5 text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-600 rounded font-bold border border-orange-200"
                    title="Envolver em Laranja Monetter <font color='#ff6b00'>"
                  >
                    🎨 Laranja
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={block.content.html || block.content.text || ''}
                onChange={e => updateContent({ html: e.target.value, text: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-[10px] text-slate-400">Inserir tag:</span>
                {['{{nome}}', '{{email}}', '{{empresa}}', '{{cupom}}'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const cur = block.content.html || '';
                      updateContent({ html: `${cur} ${tag}` });
                    }}
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo do Texto: Bold, Italic, Underline */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estilo do Texto</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    const isBold = block.style.fontWeight === 700 || block.style.fontWeight === 'bold';
                    updateStyle({ fontWeight: isBold ? 400 : 700 });
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    (block.style.fontWeight === 700 || block.style.fontWeight === 'bold')
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Negrito (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                  <span>Negrito</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const isItalic = block.style.fontStyle === 'italic';
                    updateStyle({ fontStyle: isItalic ? 'normal' : 'italic' });
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs italic flex items-center justify-center gap-1 transition-all ${
                    block.style.fontStyle === 'italic'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Itálico (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                  <span>Itálico</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const isUnderline = block.style.textDecoration === 'underline';
                    updateStyle({ textDecoration: isUnderline ? 'none' : 'underline' });
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs underline flex items-center justify-center gap-1 transition-all ${
                    block.style.textDecoration === 'underline'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Sublinhado (Underline)"
                >
                  <Underline className="w-3.5 h-3.5" />
                  <span>Sublinhado</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tamanho da Fonte</label>
                <input
                  type="number"
                  value={block.style.fontSize || 15}
                  onChange={e => updateStyle({ fontSize: Number(e.target.value) })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Altura de Linha</label>
                <select
                  value={block.style.lineHeight || 1.6}
                  onChange={e => updateStyle({ lineHeight: Number(e.target.value) })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value={1.2}>1.2 (Compacta)</option>
                  <option value={1.4}>1.4 (Normal)</option>
                  <option value={1.6}>1.6 (Espaçada)</option>
                  <option value={1.8}>1.8 (Leitura Fácil)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ================= BUTTON CONFIG ================= */}
        {block.type === 'button' && (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Texto do Botão</label>
              <input
                type="text"
                value={block.content.text || ''}
                onChange={e => updateContent({ text: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Link de Destino (URL)</label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://seusite.com.br/pagina"
                  value={block.content.url || ''}
                  onChange={e => updateContent({ url: e.target.value })}
                  className="w-full text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* Button Style Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estilo Predefinido</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: 'Preenchido', bg: '#6366f1', text: '#ffffff', border: 0 },
                  { name: 'Contorno', bg: 'transparent', text: '#6366f1', border: 2, borderColor: '#6366f1' },
                  { name: 'Minimalista', bg: '#f1f5f9', text: '#0f172a', border: 0 },
                  { name: 'Promocional', bg: '#dc2626', text: '#ffffff', border: 0 },
                  { name: 'Compra CTA', bg: '#059669', text: '#ffffff', border: 0 },
                  { name: 'Corporativo', bg: '#0f172a', text: '#ffffff', border: 0 }
                ].map(pst => (
                  <button
                    key={pst.name}
                    onClick={() => updateStyle({
                      backgroundColor: pst.bg,
                      color: pst.text,
                      borderWidth: pst.border,
                      borderColor: pst.borderColor || pst.bg
                    })}
                    className="p-1.5 border border-slate-200 hover:border-indigo-400 rounded-md text-[11px] font-medium text-slate-700 text-center transition-colors hover:bg-indigo-50/20"
                  >
                    {pst.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor do Botão</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={block.style.backgroundColor || '#6366f1'}
                    onChange={e => updateStyle({ backgroundColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={block.style.backgroundColor || '#6366f1'}
                    onChange={e => updateStyle({ backgroundColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor do Texto</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={block.style.color || '#ffffff'}
                    onChange={e => updateStyle({ color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={block.style.color || '#ffffff'}
                    onChange={e => updateStyle({ color: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700 mb-1">
                <span>Arredondamento</span>
                <span className="font-mono text-indigo-600">{block.style.borderRadius ?? 6} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={block.style.borderRadius ?? 6}
                onChange={e => updateStyle({ borderRadius: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] font-semibold text-slate-700">Largura Total (100%)</label>
              <input
                type="checkbox"
                checked={block.content.fullWidth || false}
                onChange={e => updateContent({ fullWidth: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        {/* ================= IMAGE & LOGO CONFIG ================= */}
        {(block.type === 'image' || block.type === 'logo') && (
          <>
            {/* Visual Preview & Status */}
            {block.content.url && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>Prévia da Imagem</span>
                  {block.content.url.startsWith('https://') && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" /> Hospedada na Nuvem
                    </span>
                  )}
                </div>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-video flex items-center justify-center">
                  <img 
                    src={block.content.url} 
                    alt={block.content.alt || ''} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Status: Enviando Imagem */}
            {isUploadingImage && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-indigo-900 animate-in fade-in">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                <span>Enviando e hospedando imagem na nuvem...</span>
              </div>
            )}

            {/* Status: Erro no Upload */}
            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Status: Base64 Detectado com Conversor de 1 Clique */}
            {block.content.url && typeof block.content.url === 'string' && block.content.url.startsWith('data:image/') && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Imagem em Base64 (Rejeitada pelo Brevo)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  O Brevo não aceita imagens embutidas em código Base64. Clique no botão abaixo para converter e hospedar esta imagem na nuvem com link público oficial (HTTPS).
                </p>
                <button
                  type="button"
                  disabled={isConvertingImage}
                  onClick={async () => {
                    setIsConvertingImage(true);
                    try {
                      const res = await fetch('/api/upload-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ base64: block.content.url, filename: `${block.type || 'banner'}.jpg` })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.url) {
                          updateContent({ url: data.url });
                          setConvertedNotice(true);
                          setTimeout(() => setConvertedNotice(false), 3000);
                        }
                      }
                    } catch (err) {
                      console.error('Falha ao converter base64:', err);
                      alert('Falha ao converter imagem. Tente novamente.');
                    } finally {
                      setIsConvertingImage(false);
                    }
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isConvertingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Convertendo e Hospedando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hospedar na Nuvem (Remover Base64)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {convertedNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✓ Imagem hospedada com sucesso! 100% pronta para o Brevo.</span>
              </div>
            )}

            {/* Botões de Ação para Imagem */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-indigo-900">
                {block.type === 'image' ? 'Substituir Imagem / Banner' : 'Substituir Logotipo'}
              </label>
              
              <label className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-4 h-4" />
                <span>Escolher do Computador (Upload)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    const file = files[0];
                    setIsUploadingImage(true);
                    setUploadError(null);
                    try {
                      const cloudUrl = await uploadImageFileToCloud(file);
                      updateContent({ 
                        url: cloudUrl, 
                        alt: block.content.alt || file.name.replace(/\.[^/.]+$/, '') 
                      });

                      const newAsset: MediaAsset = {
                        id: `media-${Date.now()}`,
                        name: file.name,
                        folder: 'Banners',
                        url: cloudUrl,
                        sizeBytes: file.size,
                        mimeType: file.type || 'image/jpeg',
                        altText: file.name.replace(/\.[^/.]+$/, ''),
                        createdAt: new Date().toISOString()
                      };
                      try {
                        const raw = localStorage.getItem('vierstudio_custom_media');
                        const custom = raw ? JSON.parse(raw) : [];
                        localStorage.setItem('vierstudio_custom_media', JSON.stringify([newAsset, ...custom].slice(0, 30)));
                        fetch('/api/media', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newAsset)
                        }).catch(() => {});
                      } catch {}
                    } catch (err: any) {
                      console.error('Falha no upload direto da imagem', err);
                      setUploadError('Não foi possível processar a imagem. Verifique o formato e tente novamente.');
                    } finally {
                      setIsUploadingImage(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>

              <button
                onClick={onOpenFileManager}
                className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Escolher da Biblioteca de Mídia</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ou cole uma URL Direta (HTTPS)</label>
              <input
                type="text"
                value={block.content.url || ''}
                onChange={e => updateContent({ url: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Texto Alternativo (Alt Text)</label>
              <input
                type="text"
                placeholder="Descrição da imagem para leitores de tela..."
                value={block.content.alt || ''}
                onChange={e => updateContent({ alt: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Link ao Clicar (URL de Destino)</label>
              <input
                type="text"
                placeholder="https://sua-pagina.com..."
                value={block.content.link || ''}
                onChange={e => updateContent({ link: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* Largura da Imagem */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700 mb-1">
                <span>Largura da Imagem</span>
                <span className="font-mono text-indigo-600">{block.content.width || '100%'}</span>
              </div>
              <div className="flex gap-1.5 mb-1.5">
                {['100%', '80%', '50%', '300px'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateContent({ width: preset })}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      (block.content.width || '100%') === preset
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={block.content.width || '100%'}
                onChange={e => updateContent({ width: e.target.value })}
                placeholder="Ex: 100%, 300px, 140"
                className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* Alinhamento */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alinhamento</label>
              <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
                {[
                  { id: 'left', icon: AlignLeft, label: 'Esquerda' },
                  { id: 'center', icon: AlignCenter, label: 'Centro' },
                  { id: 'right', icon: AlignRight, label: 'Direita' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateStyle({ textAlign: item.id as any })}
                    className={`flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-semibold rounded-md transition-colors ${
                      (block.style.textAlign || 'center') === item.id
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Arredondamento das Bordas */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700 mb-1">
                <span>Arredondamento das Bordas</span>
                <span className="font-mono text-indigo-600">{block.style.borderRadius ?? 6} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={block.style.borderRadius ?? 6}
                onChange={e => updateStyle({ borderRadius: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Botão de Excluir Bloco de Imagem */}
            {onDeleteBlock && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onDeleteBlock(block.id)}
                  className="w-full py-2 px-3 border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Imagem do Template</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ================= COUPON CONFIG ================= */}
        {block.type === 'coupon' && (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Código do Cupom</label>
              <input
                type="text"
                value={block.content.code || '{{cupom}}'}
                onChange={e => updateContent({ code: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Texto de Destaque</label>
              <input
                type="text"
                value={block.content.discount || '20% OFF'}
                onChange={e => updateContent({ discount: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Descrição</label>
              <input
                type="text"
                value={block.content.description || ''}
                onChange={e => updateContent({ description: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </>
        )}

        {/* ================= PRODUCT CONFIG ================= */}
        {block.type === 'product' && (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título do Produto</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={e => updateContent({ title: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preço Original</label>
                <input
                  type="text"
                  value={block.content.oldPrice || ''}
                  onChange={e => updateContent({ oldPrice: e.target.value })}
                  placeholder="R$ 499,00"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preço com Desconto</label>
                <input
                  type="text"
                  value={block.content.price || ''}
                  onChange={e => updateContent({ price: e.target.value })}
                  placeholder="R$ 299,00"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Imagem do Produto</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={block.content.imageUrl || ''}
                  onChange={e => updateContent({ imageUrl: e.target.value })}
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
                <button
                  onClick={onOpenFileManager}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Trocar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Texto do Botão</label>
              <input
                type="text"
                value={block.content.buttonText || 'Comprar Agora'}
                onChange={e => updateContent({ buttonText: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </>
        )}

        {/* ================= HEADER / TOPO CONFIG ================= */}
        {block.type === 'header' && (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nome / Marca</label>
              <input
                type="text"
                value={block.content.brandText || ''}
                onChange={e => updateContent({ brandText: e.target.value })}
                placeholder="Ex: MONETTER"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Slogan / Subtítulo</label>
              <input
                type="text"
                value={block.content.sloganText || ''}
                onChange={e => updateContent({ sloganText: e.target.value })}
                placeholder="Ex: • NEGOCIE MAIS ATIVOS"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Texto do Selo / Botão</label>
              <input
                type="text"
                value={block.content.badgeText || ''}
                onChange={e => updateContent({ badgeText: e.target.value })}
                placeholder="Ex: 🔴 SUPER LIVE VIP"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Link do Selo (URL)</label>
              <input
                type="text"
                value={block.content.badgeUrl || ''}
                onChange={e => updateContent({ badgeUrl: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Logotipo em Imagem (Opcional)</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={block.content.logoUrl || ''}
                  onChange={e => updateContent({ logoUrl: e.target.value })}
                  placeholder="https://... (ou use texto)"
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
                <button
                  onClick={onOpenFileManager}
                  className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Trocar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor da Marca</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={block.content.brandColor || '#ffffff'}
                    onChange={e => updateContent({ brandColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={block.content.brandColor || '#ffffff'}
                    onChange={e => updateContent({ brandColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor do Selo</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={block.content.badgeBg || '#ff6b00'}
                    onChange={e => updateContent({ badgeBg: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={block.content.badgeBg || '#ff6b00'}
                    onChange={e => updateContent({ badgeBg: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= TOPIC CARD CONFIG ================= */}
        {block.type === 'topic-card' && (
          <>
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5">
              <label className="block text-[11px] font-bold text-indigo-900">Imagem ou Ícone do Tópico</label>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-orange-500 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {block.content.iconImage ? (
                    <img src={block.content.iconImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{block.content.icon || '🎯'}</span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <button
                    onClick={onOpenFileManager}
                    className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Trocar Imagem do Tópico</span>
                  </button>
                  {block.content.iconImage && (
                    <button
                      onClick={() => updateContent({ iconImage: '' })}
                      className="text-[10px] text-red-600 hover:underline block text-center w-full"
                    >
                      Remover imagem (usar emoji)
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">URL Direta da Imagem</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={block.content.iconImage || ''}
                  onChange={e => updateContent({ iconImage: e.target.value })}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:outline-none bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Ou selecione um Ícone Rápido</label>
                <div className="flex flex-wrap gap-1">
                  {['🎯', '📊', '🛡️', '🚀', '💰', '📈', '💎', '⚡', '🔔', '🎁', '🔥', '🏆', '💡', '🔑', '⭐', '✨'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => updateContent({ icon: emoji, iconImage: '' })}
                      className={`w-7 h-7 text-sm rounded border flex items-center justify-center hover:scale-110 transition-transform ${
                        !block.content.iconImage && block.content.icon === emoji
                          ? 'bg-orange-100 border-orange-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título do Tópico</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={e => updateContent({ title: e.target.value })}
                placeholder="Ex: Erros que travam seus resultados"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Descrição do Tópico</label>
              <textarea
                rows={3}
                value={block.content.description || ''}
                onChange={e => updateContent({ description: e.target.value })}
                placeholder="Ex: Entenda o que faz tantos traders perderem dinheiro sem perceber."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor do Destaque/Ícone</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={block.content.dividerColor || '#ff6b00'}
                    onChange={e => updateContent({ dividerColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={block.content.dividerColor || '#ff6b00'}
                    onChange={e => updateContent({ dividerColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fundo do Card</label>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                  <input
                    type="color"
                    value={block.content.bgColor || '#101522'}
                    onChange={e => updateContent({ bgColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={block.content.bgColor || '#101522'}
                    onChange={e => updateContent({ bgColor: e.target.value })}
                    className="w-full text-[11px] font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= SCHEDULE BOX CONFIG ================= */}
        {block.type === 'schedule-box' && (
          <>
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2.5">
              <label className="block text-[11px] font-bold text-amber-900">Ícone ou Imagem do Evento</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border-2 border-orange-500 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {block.content.iconImage ? (
                    <img src={block.content.iconImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{block.content.icon || '📅'}</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <button
                    onClick={onOpenFileManager}
                    className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Trocar Ícone/Imagem</span>
                  </button>
                  {block.content.iconImage && (
                    <button
                      onClick={() => updateContent({ iconImage: '' })}
                      className="text-[10px] text-red-600 hover:underline block text-center w-full"
                    >
                      Usar emoji padrão
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tag Superior (Opcional)</label>
              <input
                type="text"
                value={block.content.badge || ''}
                onChange={e => updateContent({ badge: e.target.value })}
                placeholder="Ex: 🗓️ DATAS & HORÁRIOS CONFIRMADOS"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título do Evento</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={e => updateContent({ title: e.target.value })}
                placeholder="Ex: Super Live com PH"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Datas Confirmadas</label>
              <input
                type="text"
                value={block.content.dates || ''}
                onChange={e => updateContent({ dates: e.target.value })}
                placeholder="Ex: Dias 19 e 20 de Novembro"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none font-semibold text-orange-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Horários / Turnos</label>
              <input
                type="text"
                value={block.content.times || ''}
                onChange={e => updateContent({ times: e.target.value })}
                placeholder="Ex: 1º Turno: 12h às 14h • 2º Turno: 20h às 22h"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cor Neon da Borda & Destaques</label>
              <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
                <input
                  type="color"
                  value={block.content.accentColor || '#ff6b00'}
                  onChange={e => updateContent({ accentColor: e.target.value, borderColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={block.content.accentColor || '#ff6b00'}
                  onChange={e => updateContent({ accentColor: e.target.value, borderColor: e.target.value })}
                  className="w-full text-[11px] font-mono focus:outline-none uppercase"
                />
              </div>
            </div>
          </>
        )}

        {/* ================= HTML BLOCK CONFIG ================= */}
        {block.type === 'html' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Código HTML do Bloco</label>
                <span className="text-[10px] text-slate-400 font-mono">Editável</span>
              </div>
              <textarea
                rows={10}
                value={block.content.html || block.content.code || ''}
                onChange={e => updateContent({ html: e.target.value, code: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono bg-slate-900 text-slate-100 leading-relaxed"
                placeholder="<div>Insira ou edite o HTML aqui...</div>"
              />
            </div>
          </>
        )}

        {/* ================= ALIGNMENT & COLOR PROPERTIES (COMMON) ================= */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alinhamento</label>
          <div className="grid grid-cols-4 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            {[
              { id: 'left', icon: AlignLeft },
              { id: 'center', icon: AlignCenter },
              { id: 'right', icon: AlignRight },
              { id: 'justify', icon: AlignJustify }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = (block.style.textAlign || 'left') === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => updateStyle({ textAlign: item.id as any })}
                  className={`flex items-center justify-center py-1.5 rounded-md transition-colors ${
                    isSelected ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color picker for text blocks */}
        {(block.type === 'heading' || block.type === 'text') && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Cor do Bloco Inteiro (Padrão)</label>
              <span className="text-[10px] text-indigo-600 font-medium">Bloco Todo</span>
            </div>
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white">
              <input
                type="color"
                value={block.style.color || '#334155'}
                onChange={e => updateStyle({ color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={block.style.color || '#334155'}
                onChange={e => updateStyle({ color: e.target.value })}
                className="w-full text-xs font-mono focus:outline-none uppercase"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">
              💡 <strong className="text-slate-700">Colorir palavras específicas:</strong> Selecione o texto desejado diretamente no e-mail e escolha a cor na barra flutuante!
            </p>
          </div>
        )}

        {/* Margins & Spacings */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Margem Superior</label>
            <input
              type="number"
              value={block.style.marginTop ?? 4}
              onChange={e => updateStyle({ marginTop: Number(e.target.value) })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Margem Inferior</label>
            <input
              type="number"
              value={block.style.marginBottom ?? 12}
              onChange={e => updateStyle({ marginBottom: Number(e.target.value) })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

      </div>

    </aside>
  );
};
