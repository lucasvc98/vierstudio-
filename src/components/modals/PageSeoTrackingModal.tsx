import React, { useState } from 'react';
import { X, Search, Globe, Code, Check, ShieldCheck, Tag } from 'lucide-react';
import { PageDocument, PageSeoSettings, PageTrackingSettings } from '../../types/page';

interface PageSeoTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageDocument;
  onSaveSeoTracking: (seo: PageSeoSettings, tracking: PageTrackingSettings) => void;
}

export const PageSeoTrackingModal: React.FC<PageSeoTrackingModalProps> = ({
  isOpen,
  onClose,
  page,
  onSaveSeoTracking
}) => {
  const [activeTab, setActiveTab] = useState<'seo' | 'pixels' | 'custom-scripts'>('seo');
  const [seo, setSeo] = useState<PageSeoSettings>({ ...page.seo });
  const [tracking, setTracking] = useState<PageTrackingSettings>({ ...page.tracking });

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSeoTracking(seo, tracking);
    onClose();
  };

  const togglePixelEvent = (event: string) => {
    const current = tracking.metaPixelEvents || ['PageView'];
    if (current.includes(event)) {
      setTracking({ ...tracking, metaPixelEvents: current.filter(e => e !== event) });
    } else {
      setTracking({ ...tracking, metaPixelEvents: [...current, event] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">SEO & Rastreamento da Página</h3>
              <p className="text-[11px] text-slate-400">Configure Meta Pixel, Google Analytics, Tags e Otimização para Redes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('seo')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'seo' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
            }`}
          >
            SEO & Redes Sociais
          </button>
          <button
            onClick={() => setActiveTab('pixels')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'pixels' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
            }`}
          >
            Meta Pixel & Google Tags
          </button>
          <button
            onClick={() => setActiveTab('custom-scripts')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'custom-scripts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
            }`}
          >
            Scripts Customizados (Head/Body)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título da Página (Meta Title)</label>
                <input
                  type="text"
                  value={seo.metaTitle || ''}
                  onChange={e => setSeo({ ...seo, metaTitle: e.target.value })}
                  placeholder="Ex: Oferta Exclusiva | Minha Empresa"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
                <span className="text-[10px] text-slate-400">Recomendado: entre 40 e 60 caracteres.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição para Mecanismos de Busca (Meta Description)</label>
                <textarea
                  rows={3}
                  value={seo.metaDescription || ''}
                  onChange={e => setSeo({ ...seo, metaDescription: e.target.value })}
                  placeholder="Descreva em até 160 caracteres os benefícios desta página..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Imagem de Compartilhamento (Open Graph / WhatsApp / Facebook)</label>
                <input
                  type="text"
                  value={seo.ogImage || ''}
                  onChange={e => setSeo({ ...seo, ogImage: e.target.value })}
                  placeholder="https://exemplo.com/imagem-1200x630.jpg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="noIndexCheck"
                  checked={seo.noIndex || false}
                  onChange={e => setSeo({ ...seo, noIndex: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="noIndexCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Ocultar dos motores de busca (noindex / nofollow) — Ideal para páginas de obrigado ou upsell
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PIXELS & TAGS */}
          {activeTab === 'pixels' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                <div className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>Meta Pixel (Facebook & Instagram Ads)</span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID do Pixel</label>
                  <input
                    type="text"
                    value={tracking.metaPixelId || ''}
                    onChange={e => setTracking({ ...tracking, metaPixelId: e.target.value.trim() })}
                    placeholder="Ex: 123456789012345"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Eventos Padrão Ativos:</label>
                  <div className="flex flex-wrap gap-2">
                    {['PageView', 'Lead', 'CompleteRegistration', 'InitiateCheckout', 'Purchase'].map(evt => {
                      const isChecked = (tracking.metaPixelEvents || []).includes(evt);
                      return (
                        <button
                          key={evt}
                          type="button"
                          onClick={() => togglePixelEvent(evt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            isChecked 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {isChecked ? `✓ ${evt}` : `+ ${evt}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-900 text-sm">Google Tag Manager & Analytics</div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Google Tag Manager ID</label>
                  <input
                    type="text"
                    value={tracking.gtmId || ''}
                    onChange={e => setTracking({ ...tracking, gtmId: e.target.value.trim() })}
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Google Analytics 4 Measurement ID</label>
                  <input
                    type="text"
                    value={tracking.ga4Id || ''}
                    onChange={e => setTracking({ ...tracking, ga4Id: e.target.value.trim() })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">TikTok Pixel ID</label>
                <input
                  type="text"
                  value={tracking.tiktokPixelId || ''}
                  onChange={e => setTracking({ ...tracking, tiktokPixelId: e.target.value.trim() })}
                  placeholder="Ex: C8XXXXXXX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM SCRIPTS */}
          {activeTab === 'custom-scripts' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scripts no &lt;head&gt; (Verificação de Domínio / Metatags / CRMs)</label>
                <textarea
                  rows={4}
                  value={tracking.customHeadScripts || ''}
                  onChange={e => setTracking({ ...tracking, customHeadScripts: e.target.value })}
                  placeholder="<script>...</script>"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scripts no Final do &lt;body&gt; (Chatbots / Webhooks / n8n / Make)</label>
                <textarea
                  rows={4}
                  value={tracking.customBodyEndScripts || ''}
                  onChange={e => setTracking({ ...tracking, customBodyEndScripts: e.target.value })}
                  placeholder="<script>...</script>"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CSS Global Personalizado</label>
                <textarea
                  rows={3}
                  value={tracking.customCss || ''}
                  onChange={e => setTracking({ ...tracking, customCss: e.target.value })}
                  placeholder=".minha-classe { color: #f00; }"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="h-14 border-t border-slate-200 px-6 flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};
