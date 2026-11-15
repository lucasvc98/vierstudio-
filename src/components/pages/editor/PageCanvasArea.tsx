import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  GripVertical, 
  MessageCircle, 
  ExternalLink,
  HelpCircle,
  Clock,
  ShieldCheck,
  Check,
  CheckCircle,
  ChevronDown,
  Video,
  Sliders,
  Columns
} from 'lucide-react';
import { 
  PageDocument, 
  PageSection, 
  PageContainer, 
  PageElement, 
  PageDeviceView, 
  PageElementType,
  PageContainerLayout
} from '../../../types/page';

interface PageCanvasAreaProps {
  page: PageDocument;
  deviceView: PageDeviceView;
  selectedElementId: string | null;
  selectedSectionId: string | null;
  onSelectElement: (element: PageElement, section: PageSection) => void;
  onSelectSection: (section: PageSection) => void;
  onUpdateElement: (elementId: string, updates: Partial<PageElement>) => void;
  onDuplicateElement: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
  onDropElementIntoContainer: (elementType: PageElementType, sectionId: string, containerId: string, index?: number) => void;
  onMoveExistingElementToContainer: (elementId: string, sectionId: string, containerId: string, index?: number) => void;
  onAddSection: (name?: string, fullWidth?: boolean) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onChangeContainerLayout: (sectionId: string, containerId: string, layout: PageContainerLayout) => void;
}

export const PageCanvasArea: React.FC<PageCanvasAreaProps> = ({
  page,
  deviceView,
  selectedElementId,
  selectedSectionId,
  onSelectElement,
  onSelectSection,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onMoveElement,
  onDropElementIntoContainer,
  onMoveExistingElementToContainer,
  onAddSection,
  onDuplicateSection,
  onDeleteSection,
  onMoveSection,
  onChangeContainerLayout
}) => {
  const [dropTarget, setDropTarget] = useState<{ sectionId: string; containerId: string; index: number } | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);

  // Frame container dimensions according to device view
  let canvasContainerStyle = 'w-full max-w-full';
  let deviceWrapperStyle = 'w-full';
  if (deviceView === 'tablet') {
    deviceWrapperStyle = 'w-[768px] my-6 shadow-2xl rounded-2xl border-4 border-slate-700 bg-white overflow-hidden transition-all';
  } else if (deviceView === 'mobile') {
    deviceWrapperStyle = 'w-[375px] my-6 shadow-2xl rounded-[36px] border-[10px] border-slate-800 bg-white overflow-hidden transition-all';
  }

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent, sectionId: string, containerId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!dropTarget || dropTarget.sectionId !== sectionId || dropTarget.containerId !== containerId || dropTarget.index !== index) {
      setDropTarget({ sectionId, containerId, index });
    }
  };

  // Handle Drop into Container
  const handleDrop = (e: React.DragEvent, sectionId: string, containerId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    setDraggingElementId(null);

    // 1. Existing element moved
    const existingRaw = e.dataTransfer.getData('application/vierstudio-page-existing-element');
    if (existingRaw) {
      try {
        const { elementId } = JSON.parse(existingRaw);
        if (elementId) {
          onMoveExistingElementToContainer(elementId, sectionId, containerId, index);
          return;
        }
      } catch (err) {
        console.error('Error moving existing element:', err);
      }
    }

    // 2. New element from left sidebar
    const newType = e.dataTransfer.getData('application/vierstudio-page-element') as PageElementType;
    if (newType) {
      onDropElementIntoContainer(newType, sectionId, containerId, index);
    }
  };

  const renderElementCard = (el: PageElement, elIndex: number, section: PageSection) => {
    const isElementSelected = selectedElementId === el.id;

    return (
      <div
        key={el.id}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('application/vierstudio-page-existing-element', JSON.stringify({ elementId: el.id }));
          e.dataTransfer.effectAllowed = 'move';
          setDraggingElementId(el.id);
        }}
        onDragEnd={() => {
          setDraggingElementId(null);
          setDropTarget(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(el, section);
        }}
        className={`relative group/el cursor-pointer rounded-lg transition-all ${
          isElementSelected
            ? 'ring-2 ring-indigo-600 ring-offset-2'
            : 'hover:outline-dashed hover:outline-1 hover:outline-indigo-300'
        }`}
        style={{
          marginBottom: el.style.marginBottom ?? 16,
          marginTop: el.style.marginTop ?? 0,
          textAlign: el.style.textAlign || 'left'
        }}
      >
        {/* Hover Drag Handle */}
        <div className="absolute -top-3.5 -left-2 z-30 hidden group-hover/el:flex items-center gap-1 bg-white border border-indigo-300 shadow-md rounded-md px-1.5 py-0.5 text-indigo-700 text-[10px] font-bold cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5" />
          <span>Mover</span>
        </div>

        {/* Selection Action Toolbar */}
        {isElementSelected && (
          <div className="absolute -top-8 right-2 z-30 flex items-center gap-1 bg-slate-900 text-white rounded-lg px-2 py-1 shadow-lg text-[10px] animate-in fade-in">
            <span className="capitalize font-semibold text-indigo-300">{el.type}</span>
            <div className="h-3 w-px bg-slate-700 mx-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicateElement(el.id); }}
              className="hover:text-indigo-400"
              title="Duplicar"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteElement(el.id); }}
              className="hover:text-red-400"
              title="Excluir"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Dynamic Element Content Renderers */}
        {el.type === 'heading' && (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateElement(el.id, { content: { ...el.content, text: e.currentTarget.innerText } })}
            className="outline-none focus:bg-indigo-50/50 rounded px-1 transition-colors"
            style={{
              fontSize: el.style.fontSize || 36,
              fontWeight: el.style.fontWeight || 800,
              color: el.style.color || '#0f172a',
              textAlign: el.style.textAlign || 'left',
              lineHeight: el.style.lineHeight || 1.2
            }}
            dangerouslySetInnerHTML={{ __html: el.content.titleHtml || el.content.text || 'Título Principal' }}
          />
        )}

        {el.type === 'paragraph' && (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateElement(el.id, { content: { ...el.content, text: e.currentTarget.innerText } })}
            className="outline-none focus:bg-indigo-50/50 rounded px-1 transition-colors leading-relaxed"
            style={{
              fontSize: el.style.fontSize || 16,
              color: el.style.color || '#475569',
              textAlign: el.style.textAlign || 'left'
            }}
            dangerouslySetInnerHTML={{ __html: el.content.textHtml || el.content.text || 'Texto de parágrafo...' }}
          />
        )}

        {el.type === 'button' && (
          <div style={{ textAlign: el.style.textAlign || 'left' }}>
            <button
              type="button"
              className="inline-flex flex-col items-center justify-center font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              style={{
                backgroundColor: el.style.backgroundColor || page.globalSettings.primaryColor || '#6366f1',
                color: el.style.color || '#ffffff',
                paddingTop: el.style.paddingTop || 14,
                paddingBottom: el.style.paddingBottom || 14,
                paddingLeft: el.style.paddingLeft || 28,
                paddingRight: el.style.paddingRight || 28,
                borderRadius: el.style.borderRadius || 12,
                fontSize: el.style.fontSize || 16
              }}
            >
              <span>{el.content.text || 'Clique Aqui'}</span>
              {el.content.subtext && (
                <span className="block text-[11px] font-normal opacity-85 mt-0.5">{el.content.subtext}</span>
              )}
            </button>
          </div>
        )}

        {el.type === 'whatsapp-button' && (
          <div style={{ textAlign: el.style.textAlign || 'left' }}>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-full text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{el.content.text || 'Fale no WhatsApp'}</span>
            </button>
          </div>
        )}

        {el.type === 'image' && (
          <div
            className="overflow-hidden rounded-lg"
            style={{ textAlign: el.style.textAlign || 'left' }}
          >
            <img
              src={el.content.url || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80'}
              alt={el.content.alt || ''}
              className="object-cover transition-all inline-block"
              style={{
                width: el.style.width || '100%',
                maxWidth: el.style.maxWidth ? `${el.style.maxWidth}px` : '100%',
                borderRadius: el.style.borderRadius ?? 12,
                boxShadow: el.style.boxShadow || 'none'
              }}
            />
          </div>
        )}

        {el.type === 'video' && (
          <div className="relative aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl overflow-hidden group/vid">
            <Video className="w-12 h-12 text-indigo-400 group-hover/vid:scale-110 transition-transform" />
            <span className="absolute bottom-3 text-xs font-semibold text-slate-300">
              Vídeo Player ({el.content.provider || 'youtube'})
            </span>
          </div>
        )}

        {el.type === 'form' && (
          <div 
            className="p-6 rounded-2xl shadow-xl transition-all"
            style={{
              backgroundColor: el.style.backgroundColor || '#ffffff',
              borderRadius: el.style.borderRadius || 20,
              borderWidth: el.style.borderWidth || 1,
              borderColor: el.style.borderColor || '#e2e8f0',
              color: el.style.color || '#0f172a'
            }}
          >
            {(el.content.titleHtml || el.content.title) && (
              <h3 
                className="text-xl font-extrabold mb-1"
                dangerouslySetInnerHTML={{ __html: el.content.titleHtml || el.content.title }}
              />
            )}
            {el.content.subtitle && (
              <p className="text-xs opacity-80 mb-5 leading-relaxed">
                {el.content.subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-2.5">
              {(el.content.fields || []).map((f: any) => {
                const isHalf = f.halfWidth;
                const widthCls = isHalf ? 'flex-1 min-w-[120px]' : 'w-full';

                if (f.type === 'select') {
                  const options = f.options || ['SP', 'MG', 'RJ', 'ES', 'PR', 'SC', 'RS', 'GO', 'MT', 'MS', 'BA', 'Outro'];
                  return (
                    <div key={f.id} className={widthCls}>
                      {f.label && <label className="block text-[11px] font-semibold mb-1 opacity-90">{f.label}</label>}
                      <select
                        disabled
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option>{f.placeholder || 'Selecione...'}</option>
                        {options.map((opt: string) => <option key={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                }

                if (f.type === 'radio-group') {
                  const options = f.options || ['Opção 1', 'Opção 2'];
                  return (
                    <div key={f.id} className="w-full my-1">
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        {options.map((opt: string, i: number) => (
                          <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" checked={i === 0} readOnly className="accent-lime-500" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={f.id} className={widthCls}>
                    {f.label && <label className="block text-[11px] font-semibold mb-1 opacity-90">{f.label}</label>}
                    <input
                      type="text"
                      disabled
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                );
              })}
              <button
                type="button"
                className="w-full py-3 font-bold rounded-xl text-xs shadow-md mt-2 transition-transform active:scale-95"
                style={{
                  backgroundColor: el.content.buttonBg || '#073e2e',
                  color: el.content.buttonTextColor || '#ffffff',
                  border: el.content.buttonBorder || 'none',
                  borderRadius: el.content.buttonBorderRadius || 11
                }}
              >
                {el.content.buttonText || 'Enviar Dados'}
              </button>
              {el.content.disclaimer && (
                <p className="w-full text-[11px] opacity-70 text-center mt-2 leading-relaxed">
                  {el.content.disclaimer}
                </p>
              )}
            </div>
          </div>
        )}

        {el.type === 'countdown' && (
          <div className="p-4 bg-slate-900 text-white rounded-xl text-center shadow-lg">
            <span className="text-xs font-bold text-amber-400 block mb-2">{el.content.label || 'OFERTA TERMINA EM:'}</span>
            <div className="flex justify-center gap-3 font-mono font-bold text-xl">
              <span className="bg-slate-800 px-2 py-1 rounded">12h</span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-1 rounded">45m</span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-1 rounded">00s</span>
            </div>
          </div>
        )}

        {el.type === 'pricing-table' && (() => {
          const accent = el.style.borderColor || page.globalSettings.primaryColor || '#6366f1';
          const cardBg = el.style.backgroundColor || '#ffffff';
          const cardColor = el.style.color || '#0f172a';
          const btnBg = el.content.buttonBg || accent;
          const btnColor = el.content.buttonTextColor || '#ffffff';
          const rawPrice = String(el.content.price || '97');
          const hasCurrency = /R\$|\$|€|£|Grátis/i.test(rawPrice);

          return (
            <div
              className="p-6 rounded-2xl shadow-xl text-center transition-all flex flex-col justify-between h-full"
              style={{
                backgroundColor: cardBg,
                color: cardColor,
                borderWidth: el.style.borderWidth ?? 2,
                borderStyle: 'solid',
                borderColor: accent,
                borderRadius: el.style.borderRadius ?? 20
              }}
            >
              <div>
                {el.content.badge && (
                  <span
                    className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                    style={{ backgroundColor: accent, color: '#ffffff' }}
                  >
                    {el.content.badge}
                  </span>
                )}
                <h4 className="text-lg font-extrabold" style={{ color: cardColor }}>
                  {el.content.planName || 'Plano Pro'}
                </h4>
                {el.content.description && (
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">{el.content.description}</p>
                )}
                <div className="my-4">
                  {el.content.originalPrice && (
                    <div className="text-xs opacity-60 line-through mb-0.5">
                      De {el.content.originalPrice}
                    </div>
                  )}
                  {hasCurrency ? (
                    <span className="text-3xl font-black" style={{ color: cardColor }}>{rawPrice}</span>
                  ) : (
                    <>
                      <span className="text-xs opacity-60 align-top">R$ </span>
                      <span className="text-4xl font-black" style={{ color: cardColor }}>{rawPrice}</span>
                    </>
                  )}
                  {el.content.installments && (
                    <div className="text-xs opacity-75 mt-1">{el.content.installments}</div>
                  )}
                </div>
                <ul className="text-xs space-y-2 mb-6 text-left opacity-90">
                  {(el.content.features || []).map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
                style={{ backgroundColor: btnBg, color: btnColor }}
              >
                {el.content.buttonText || 'Garantir Esta Oferta →'}
              </button>
            </div>
          );
        })()}

        {el.type === 'testimonial' && (
          <div
            className="p-6 rounded-2xl border shadow-sm text-left h-full flex flex-col justify-between"
            style={{
              backgroundColor: el.style.backgroundColor || '#f8fafc',
              color: el.style.color || '#334155',
              borderColor: el.style.borderColor || '#e2e8f0',
              borderWidth: el.style.borderWidth ?? 1,
              borderRadius: el.style.borderRadius ?? 16
            }}
          >
            <div>
              {el.content.rating && (
                <div className="text-amber-400 text-sm mb-2 tracking-wide">
                  {'★'.repeat(Math.min(5, Math.max(1, Number(el.content.rating) || 5)))}
                </div>
              )}
              <p className="text-xs italic leading-relaxed mb-4 opacity-90">
                {el.content.quote || '"Excelente solução, transformou nossos resultados."'}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-200/40">
              {el.content.avatar && (
                <img
                  src={el.content.avatar}
                  alt={el.content.author || ''}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              )}
              <div>
                <div className="text-xs font-bold">{el.content.author || 'Cliente Satisfeito'}</div>
                {el.content.role && <div className="text-[11px] opacity-70">{el.content.role}</div>}
              </div>
            </div>
          </div>
        )}

        {el.type === 'accordion' && (
          <div
            className="border rounded-2xl p-5 space-y-2.5 text-left"
            style={{
              backgroundColor: el.style.backgroundColor || '#ffffff',
              color: el.style.color || '#0f172a',
              borderColor: el.style.borderColor || '#e2e8f0',
              borderRadius: el.style.borderRadius ?? 16
            }}
          >
            {el.content.title && (
              <h4 className="text-base font-extrabold text-center mb-3">
                {el.content.title}
              </h4>
            )}
            {(el.content.items || []).map((item: any, idx: number) => (
              <div
                key={idx}
                className="border border-slate-200/70 rounded-xl p-3 bg-slate-50/60"
              >
                <div className="text-xs font-bold flex items-center justify-between gap-2 text-slate-800">
                  <span>{item.question}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                {item.answer && (
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {el.type === 'trust-badges' && (
          <div
            className="flex flex-wrap items-center justify-center gap-6 py-2"
            style={{ color: el.style.color || page.globalSettings.textColor || '#334155' }}
          >
            {(el.content.items || []).map((badge: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: page.globalSettings.primaryColor || '#6366f1' }} />
                <div className="text-left">
                  <div className="font-bold leading-tight">{badge.title}</div>
                  {badge.desc && <div className="text-[10px] opacity-75">{badge.desc}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {el.type === 'spacer' && (
          <div className="h-10 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400">
            Espaçador ({el.content.height || 40}px)
          </div>
        )}

        {el.type === 'divider' && (
          <hr className="border-t border-slate-200 my-4" />
        )}

        {el.type === 'html-embed' && (
          <div 
            dangerouslySetInnerHTML={{ __html: el.content.html || '<div class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-mono text-indigo-800">&lt;HTML Embed Personalizado&gt;</div>' }} 
          />
        )}
      </div>
    );
  };

  return (
    <div 
      className="flex-1 bg-slate-100 overflow-y-auto flex flex-col items-center justify-start relative select-none scrollbar-thin"
      onClick={() => {
        // Deselect when clicking outside
      }}
    >
      
      {/* Device Dimension Bar */}
      <div className="w-full bg-slate-200/70 border-b border-slate-300/60 py-1 px-4 text-center text-[11px] font-bold text-slate-500 shrink-0">
        {deviceView === 'desktop' && `Visualização Desktop — Fluida (Container ${page.globalSettings.maxWidth}px)`}
        {deviceView === 'tablet' && 'Visualização Tablet — Frame Fixo 768px (iPad / Android Tablet)'}
        {deviceView === 'mobile' && 'Visualização Celular — Simulador Mobile 375px (iPhone / Android)'}
      </div>

      {/* Responsive Canvas Frame */}
      <div className={deviceWrapperStyle}>
        <div 
          className="min-h-[85vh] bg-white transition-all text-slate-800"
          style={{ 
            fontFamily: page.globalSettings.fontFamily,
            color: page.globalSettings.textColor,
            backgroundColor: page.globalSettings.backgroundColor 
          }}
        >
          {page.tracking?.customCss && (
            <style dangerouslySetInnerHTML={{ __html: page.tracking.customCss }} />
          )}
          
          {/* Loop over Sections */}
          {page.sections.map((section, sIndex) => {
            const isSectionSelected = selectedSectionId === section.id && !selectedElementId;
            const isFullWidth = section.fullWidth;
            const containerMaxW = isFullWidth ? '100%' : `${page.globalSettings.maxWidth}px`;

            return (
              <section
                key={section.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSection(section);
                }}
                className={`relative group/sec transition-all ${
                  isSectionSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:outline-dashed hover:outline-1 hover:outline-indigo-300'
                }`}
                style={{
                  backgroundColor: section.style.backgroundColor || 'transparent',
                  backgroundImage: section.style.backgroundImage ? `url('${section.style.backgroundImage}')` : undefined,
                  backgroundSize: section.style.backgroundSize || 'cover',
                  backgroundPosition: section.style.backgroundPosition || 'center',
                  paddingTop: section.style.paddingTop ?? 64,
                  paddingBottom: section.style.paddingBottom ?? 64,
                  paddingLeft: isFullWidth ? 0 : (page.globalSettings.containerPadding || 24),
                  paddingRight: isFullWidth ? 0 : (page.globalSettings.containerPadding || 24),
                  borderTopWidth: section.style.borderTopWidth || 0,
                  borderBottomWidth: section.style.borderBottomWidth || 0,
                  borderColor: section.style.borderColor || '#e2e8f0'
                }}
              >
                {section.style.backgroundOverlay && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: section.style.backgroundOverlay }}
                  />
                )}
                
                {/* Section Top Control Pill */}
                <div className="absolute top-1 left-3 z-20 hidden group-hover/sec:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md">
                  <span>{section.name}</span>
                  <div className="flex items-center gap-0.5 ml-2 border-l border-slate-700 pl-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'up'); }}
                      disabled={sIndex === 0}
                      className="p-0.5 hover:text-indigo-400 disabled:opacity-30"
                      title="Mover seção para cima"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'down'); }}
                      disabled={sIndex === page.sections.length - 1}
                      className="p-0.5 hover:text-indigo-400 disabled:opacity-30"
                      title="Mover seção para baixo"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicateSection(section.id); }}
                      className="p-0.5 hover:text-indigo-400"
                      title="Duplicar seção"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
                      className="p-0.5 hover:text-red-400"
                      title="Excluir seção"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Section Inner Container */}
                <div 
                  className="mx-auto w-full transition-all relative z-10"
                  style={{ maxWidth: containerMaxW }}
                >
                  
                  {/* Loop over Containers */}
                  {section.containers.map(container => {
                    const layout = container.layout;
                    
                    // Choose Tailwind or Inline grid style
                    let gridLayoutClass = 'flex flex-col gap-6';
                    if (layout === '2-col-equal') {
                      gridLayoutClass = deviceView === 'mobile' ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-8 items-center';
                    } else if (layout === '2-col-30-70') {
                      gridLayoutClass = deviceView === 'mobile' ? 'flex flex-col gap-6' : 'grid grid-cols-[3fr_7fr] gap-8 items-center';
                    } else if (layout === '2-col-70-30') {
                      gridLayoutClass = deviceView === 'mobile' ? 'flex flex-col gap-6' : 'grid grid-cols-[7fr_3fr] gap-8 items-center';
                    } else if (layout === '3-col') {
                      gridLayoutClass = deviceView === 'mobile' ? 'flex flex-col gap-6' : 'grid grid-cols-3 gap-6';
                    } else if (layout === '4-col') {
                      gridLayoutClass = deviceView === 'mobile' ? 'flex flex-col gap-6' : 'grid grid-cols-4 gap-6';
                    }

                    return (
                      <div
                        key={container.id}
                        onDragOver={(e) => handleDragOver(e, section.id, container.id, container.elements.length)}
                        onDrop={(e) => handleDrop(e, section.id, container.id, container.elements.length)}
                        className={`relative rounded-xl transition-all ${gridLayoutClass} ${
                          container.elements.length === 0 ? 'border-2 border-dashed border-indigo-300 py-12 text-center bg-indigo-50/20' : ''
                        }`}
                      >
                        {/* Empty container prompt */}
                        {container.elements.length === 0 && (
                          <div className="col-span-full flex flex-col items-center justify-center text-slate-400 text-xs">
                            <Plus className="w-6 h-6 text-indigo-500 mb-1 animate-bounce" />
                            <span className="font-bold text-slate-600">Arraste um elemento ou formulário para cá</span>
                          </div>
                        )}

                        {/* Loop over Elements */}
                        {(() => {
                          const hasColumnAssignments = container.elements.some(el => el.column !== undefined && el.column > 1);
                          if (hasColumnAssignments) {
                            const colCount = layout === '3-col' ? 3 : (layout === '4-col' ? 4 : 2);
                            return Array.from({ length: colCount }).map((_, colIdx) => {
                              const colNum = colIdx + 1;
                              const colElements = container.elements.filter(el => (el.column || 1) === colNum);
                              return (
                                <div key={colNum} className="flex flex-col gap-4 w-full">
                                  {colElements.map((el, elIndex) => renderElementCard(el, elIndex, section))}
                                </div>
                              );
                            });
                          }
                          return container.elements.map((el, elIndex) => renderElementCard(el, elIndex, section));
                        })()}

                      </div>
                    );
                  })}

                </div>

              </section>
            );
          })}

          {/* Bottom Add Section CTA */}
          <div className="p-8 text-center bg-slate-50/50 border-t border-slate-200">
            <button
              onClick={() => onAddSection('Nova Seção', false)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-indigo-600 font-bold text-xs rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Mais Uma Seção na Página</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
