import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Settings, 
  Trash2, 
  Copy, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Eye, 
  Smartphone, 
  Monitor, 
  Layers, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';
import { PageElement, PageSection, PageGlobalSettings, ElementStyle, AdvancedElementSettings } from '../../../types/page';

interface PageRightSidebarProps {
  selectedElement: PageElement | null;
  selectedSection: PageSection | null;
  onUpdateElement: (elementId: string, updates: Partial<PageElement>) => void;
  onUpdateSection: (sectionId: string, updates: Partial<PageSection>) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onOpenMediaManager: () => void;
  globalSettings: PageGlobalSettings;
}

export const PageRightSidebar: React.FC<PageRightSidebarProps> = ({
  selectedElement,
  selectedSection,
  onUpdateElement,
  onUpdateSection,
  onDeleteElement,
  onDuplicateElement,
  onDeleteSection,
  onOpenMediaManager,
  globalSettings
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

  if (!selectedElement && !selectedSection) {
    return (
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-6 text-center shrink-0 h-full select-none text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
          <Sliders className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-700 text-xs mb-1">Nenhum Item Selecionado</h4>
        <p className="text-[11px] leading-relaxed max-w-[200px]">
          Clique em qualquer título, imagem, botão, formulário ou seção para editar suas propriedades.
        </p>
      </aside>
    );
  }

  // Helper for updating element content
  const updateContent = (key: string, value: any) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      content: { ...selectedElement.content, [key]: value }
    });
  };

  // Helper for updating element style
  const updateStyle = (updates: Partial<ElementStyle>) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      style: { ...selectedElement.style, ...updates }
    });
  };

  // Helper for updating element advanced settings
  const updateAdvanced = (updates: Partial<AdvancedElementSettings>) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      advanced: { ...(selectedElement.advanced || {}), ...updates }
    });
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 h-full select-none shadow-2xs z-20">
      
      {/* Header with Title and Delete/Duplicate Actions */}
      <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between">
        <span className="font-bold text-xs text-slate-800 capitalize flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          {selectedElement ? `Elemento: ${selectedElement.type}` : `Seção: ${selectedSection?.name}`}
        </span>

        <div className="flex items-center gap-1">
          {selectedElement && (
            <>
              <button
                onClick={() => onDuplicateElement(selectedElement.id)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Duplicar elemento"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteElement(selectedElement.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir elemento"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {selectedSection && !selectedElement && (
            <button
              onClick={() => onDeleteSection(selectedSection.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir seção"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3 Tabs: Conteúdo | Estilo | Avançado */}
      <div className="flex items-center border-b border-slate-200 px-3 pt-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeTab === 'content'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Conteúdo</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeTab === 'style'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Estilo</span>
        </button>

        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeTab === 'advanced'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Avançado</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        
        {/* ===================== TAB 1: CONTEÚDO ===================== */}
        {activeTab === 'content' && (
          <>
            {/* If SECTION is selected */}
            {selectedSection && !selectedElement && (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome da Seção</label>
                  <input
                    type="text"
                    value={selectedSection.name}
                    onChange={e => onUpdateSection(selectedSection.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Largura Total (Full-Width)</span>
                  <input
                    type="checkbox"
                    checked={selectedSection.fullWidth}
                    onChange={e => onUpdateSection(selectedSection.id, { fullWidth: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* If ELEMENT is selected */}
            {selectedElement && (
              <>
                {/* Heading / Paragraph */}
                {(selectedElement.type === 'heading' || selectedElement.type === 'paragraph') && (
                  <div className="space-y-3">
                    {selectedElement.type === 'heading' && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tag HTML do Título</label>
                        <select
                          value={selectedElement.content.tag || 'h1'}
                          onChange={e => updateContent('tag', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="h1">H1 — Título Principal</option>
                          <option value="h2">H2 — Subtítulo Importante</option>
                          <option value="h3">H3 — Cabeçalho de Seção</option>
                          <option value="h4">H4 — Destaque</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Texto</label>
                      <textarea
                        rows={4}
                        value={selectedElement.content.text || ''}
                        onChange={e => updateContent('text', e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Button CTA */}
                {selectedElement.type === 'button' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Texto do Botão</label>
                      <input
                        type="text"
                        value={selectedElement.content.text || ''}
                        onChange={e => updateContent('text', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subtexto de Apoio</label>
                      <input
                        type="text"
                        value={selectedElement.content.subtext || ''}
                        onChange={e => updateContent('subtext', e.target.value)}
                        placeholder="Ex: Acesso imediato • 100% seguro"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Link de Destino / Checkout</label>
                      <input
                        type="text"
                        value={selectedElement.content.url || ''}
                        onChange={e => updateContent('url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* WhatsApp Button */}
                {selectedElement.type === 'whatsapp-button' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Texto do Botão</label>
                      <input
                        type="text"
                        value={selectedElement.content.text || ''}
                        onChange={e => updateContent('text', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Número com DDI e DDD</label>
                      <input
                        type="text"
                        value={selectedElement.content.phone || ''}
                        onChange={e => updateContent('phone', e.target.value)}
                        placeholder="Ex: 5511999999999"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mensagem Pré-configurada</label>
                      <textarea
                        rows={2}
                        value={selectedElement.content.defaultMessage || ''}
                        onChange={e => updateContent('defaultMessage', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Flutuante no canto inferior</span>
                      <input
                        type="checkbox"
                        checked={selectedElement.content.isFloating || false}
                        onChange={e => updateContent('isFloating', e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                    </div>
                  </div>
                )}

                {/* Image */}
                {selectedElement.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">URL da Imagem</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedElement.content.url || ''}
                          onChange={e => updateContent('url', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                        <button
                          onClick={onOpenMediaManager}
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100"
                          title="Escolher da Biblioteca de Arquivos"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Texto Alternativo (Alt SEO)</label>
                      <input
                        type="text"
                        value={selectedElement.content.alt || ''}
                        onChange={e => updateContent('alt', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Video */}
                {selectedElement.type === 'video' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ID do Vídeo do YouTube</label>
                      <input
                        type="text"
                        value={selectedElement.content.embedId || ''}
                        onChange={e => updateContent('embedId', e.target.value)}
                        placeholder="Ex: dQw4w9WgXcQ"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Form */}
                {selectedElement.type === 'form' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Título do Formulário</label>
                      <input
                        type="text"
                        value={selectedElement.content.title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subtítulo</label>
                      <input
                        type="text"
                        value={selectedElement.content.subtitle || ''}
                        onChange={e => updateContent('subtitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Texto do Botão de Envio</label>
                      <input
                        type="text"
                        value={selectedElement.content.buttonText || ''}
                        onChange={e => updateContent('buttonText', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Redirecionar após Envio (URL / Obrigado)</label>
                      <input
                        type="text"
                        value={selectedElement.content.redirectUrl || ''}
                        onChange={e => updateContent('redirectUrl', e.target.value)}
                        placeholder="/obrigado ou link do WhatsApp"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Countdown */}
                {selectedElement.type === 'countdown' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Texto de Urgência</label>
                      <input
                        type="text"
                        value={selectedElement.content.label || ''}
                        onChange={e => updateContent('label', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duração em Horas</label>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={selectedElement.content.targetHours || 24}
                        onChange={e => updateContent('targetHours', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Pricing Table */}
                {selectedElement.type === 'pricing-table' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Selo de Destaque (Badge)</label>
                      <input
                        type="text"
                        value={selectedElement.content.badge || ''}
                        onChange={e => updateContent('badge', e.target.value)}
                        placeholder="Ex: MAIS ESCOLHIDO"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nome do Plano</label>
                      <input
                        type="text"
                        value={selectedElement.content.planName || ''}
                        onChange={e => updateContent('planName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Descrição Curta</label>
                      <input
                        type="text"
                        value={selectedElement.content.description || ''}
                        onChange={e => updateContent('description', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Preço De</label>
                        <input
                          type="text"
                          value={selectedElement.content.originalPrice || ''}
                          onChange={e => updateContent('originalPrice', e.target.value)}
                          placeholder="R$ 997,00"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Preço Atual</label>
                        <input
                          type="text"
                          value={selectedElement.content.price || ''}
                          onChange={e => updateContent('price', e.target.value)}
                          placeholder="R$ 497,00"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Parcelamento / Condição</label>
                      <input
                        type="text"
                        value={selectedElement.content.installments || ''}
                        onChange={e => updateContent('installments', e.target.value)}
                        placeholder="ou 12x de R$ 49,60"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Benefícios (1 por linha)</label>
                      <textarea
                        rows={4}
                        value={(selectedElement.content.features || []).join('\n')}
                        onChange={e => updateContent('features', e.target.value.split('\n').filter(Boolean))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Texto do Botão</label>
                      <input
                        type="text"
                        value={selectedElement.content.buttonText || ''}
                        onChange={e => updateContent('buttonText', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Link de Checkout</label>
                      <input
                        type="text"
                        value={selectedElement.content.checkoutUrl || ''}
                        onChange={e => updateContent('checkoutUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Testimonial */}
                {selectedElement.type === 'testimonial' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Depoimento</label>
                      <textarea
                        rows={3}
                        value={selectedElement.content.quote || ''}
                        onChange={e => updateContent('quote', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nome do Cliente</label>
                      <input
                        type="text"
                        value={selectedElement.content.author || ''}
                        onChange={e => updateContent('author', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cargo / Empresa</label>
                      <input
                        type="text"
                        value={selectedElement.content.role || ''}
                        onChange={e => updateContent('role', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">URL do Avatar</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedElement.content.avatar || ''}
                          onChange={e => updateContent('avatar', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                        <button
                          onClick={onOpenMediaManager}
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100"
                          title="Escolher da Biblioteca"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Accordion / FAQ */}
                {selectedElement.type === 'accordion' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Título do FAQ</label>
                      <input
                        type="text"
                        value={selectedElement.content.title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">Perguntas e Respostas</label>
                        <button
                          type="button"
                          onClick={() => {
                            const items = [...(selectedElement.content.items || []), { question: 'Nova pergunta?', answer: 'Resposta aqui.' }];
                            updateContent('items', items);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </button>
                      </div>
                      {(selectedElement.content.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = (selectedElement.content.items || []).filter((_: any, i: number) => i !== idx);
                                updateContent('items', next);
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.question || ''}
                            onChange={e => {
                              const next = [...(selectedElement.content.items || [])];
                              next[idx] = { ...next[idx], question: e.target.value };
                              updateContent('items', next);
                            }}
                            placeholder="Pergunta..."
                            className="w-full px-2 py-1 border border-slate-200 rounded bg-white font-semibold"
                          />
                          <textarea
                            rows={2}
                            value={item.answer || ''}
                            onChange={e => {
                              const next = [...(selectedElement.content.items || [])];
                              next[idx] = { ...next[idx], answer: e.target.value };
                              updateContent('items', next);
                            }}
                            placeholder="Resposta..."
                            className="w-full px-2 py-1 border border-slate-200 rounded bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HTML Embed */}
                {selectedElement.type === 'html-embed' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Código HTML Personalizado</label>
                    <textarea
                      rows={6}
                      value={selectedElement.content.html || ''}
                      onChange={e => updateContent('html', e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ===================== TAB 2: ESTILO ===================== */}
        {activeTab === 'style' && (
          <>
            {/* If SECTION is selected */}
            {selectedSection && !selectedElement && (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cor de Fundo da Seção</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedSection.style.backgroundColor || '#ffffff'}
                      onChange={e => onUpdateSection(selectedSection.id, {
                        style: { ...selectedSection.style, backgroundColor: e.target.value }
                      })}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedSection.style.backgroundColor || '#ffffff'}
                      onChange={e => onUpdateSection(selectedSection.id, {
                        style: { ...selectedSection.style, backgroundColor: e.target.value }
                      })}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Espaçamento Superior (Padding Top: {selectedSection.style.paddingTop || 64}px)</label>
                  <input
                    type="range"
                    min="16"
                    max="160"
                    step="8"
                    value={selectedSection.style.paddingTop || 64}
                    onChange={e => onUpdateSection(selectedSection.id, {
                      style: { ...selectedSection.style, paddingTop: Number(e.target.value) }
                    })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Espaçamento Inferior (Padding Bottom: {selectedSection.style.paddingBottom || 64}px)</label>
                  <input
                    type="range"
                    min="16"
                    max="160"
                    step="8"
                    value={selectedSection.style.paddingBottom || 64}
                    onChange={e => onUpdateSection(selectedSection.id, {
                      style: { ...selectedSection.style, paddingBottom: Number(e.target.value) }
                    })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* If ELEMENT is selected */}
            {selectedElement && (
              <div className="space-y-3">
                {/* Font Size */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tamanho da Fonte ({selectedElement.style.fontSize || 16}px)</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={selectedElement.style.fontSize || 16}
                    onChange={e => updateStyle({ fontSize: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cor do Texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.style.color || '#0f172a'}
                      onChange={e => updateStyle({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedElement.style.color || '#0f172a'}
                      onChange={e => updateStyle({ color: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Background Color for Button/Card */}
                {(selectedElement.type === 'button' || selectedElement.type === 'form' || selectedElement.type === 'pricing-table' || selectedElement.type === 'testimonial' || selectedElement.type === 'accordion') && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cor de Fundo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.style.backgroundColor || '#6366f1'}
                        onChange={e => updateStyle({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElement.style.backgroundColor || '#6366f1'}
                        onChange={e => updateStyle({ backgroundColor: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Text Alignment */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alinhamento</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => updateStyle({ textAlign: align })}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-colors capitalize ${
                          selectedElement.style.textAlign === align
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Arredondamento dos Cantos ({selectedElement.style.borderRadius || 0}px)</label>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    value={selectedElement.style.borderRadius || 0}
                    onChange={e => updateStyle({ borderRadius: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Margin Bottom */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Margem Inferior ({selectedElement.style.marginBottom || 16}px)</label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="4"
                    value={selectedElement.style.marginBottom ?? 16}
                    onChange={e => updateStyle({ marginBottom: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ===================== TAB 3: AVANÇADO ===================== */}
        {activeTab === 'advanced' && selectedElement && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Posição da Coluna (Em Layouts Divididos)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map(colNum => (
                  <button
                    key={colNum}
                    type="button"
                    onClick={() => onUpdateElement(selectedElement.id, { column: colNum })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      (selectedElement.column || 1) === colNum
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Col {colNum}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Visibilidade por Dispositivo</label>
              <select
                value={selectedElement.advanced?.deviceVisibility || 'all'}
                onChange={e => updateAdvanced({ deviceVisibility: e.target.value as any })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Visível em Todos (Desktop, Tablet e Mobile)</option>
                <option value="desktop-only">Apenas no Desktop (Ocultar no Celular)</option>
                <option value="mobile-only">Apenas no Mobile (Ocultar no Desktop)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Evento de Rastreamento (Pixel / GA4)</label>
              <select
                value={selectedElement.advanced?.trackingEvent || ''}
                onChange={e => updateAdvanced({ trackingEvent: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Nenhum evento no clique</option>
                <option value="Lead">Disparar Evento Lead</option>
                <option value="InitiateCheckout">Disparar Evento InitiateCheckout</option>
                <option value="CompleteRegistration">Disparar Evento CompleteRegistration</option>
                <option value="WhatsAppClick">Disparar Evento WhatsAppClick</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Animação de Entrada</label>
              <select
                value={selectedElement.advanced?.animation || 'none'}
                onChange={e => updateAdvanced({ animation: e.target.value as any })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="none">Nenhuma animação</option>
                <option value="fade-in">Fade In (Suave)</option>
                <option value="slide-up">Slide Up (De baixo para cima)</option>
                <option value="zoom-in">Zoom In (Crescimento)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Classes CSS Personalizadas</label>
              <input
                type="text"
                placeholder="Ex: custom-hero-cta shadow-2xl"
                value={selectedElement.advanced?.classes || ''}
                onChange={e => updateAdvanced({ classes: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        )}

      </div>

    </aside>
  );
};
