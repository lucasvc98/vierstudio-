import React, { useState } from 'react';
import { X, Copy, Download, Check, Code, FileText, Sparkles } from 'lucide-react';
import { PageDocument } from '../../types/page';
import { compilePageHtml } from '../../utils/pageCompiler';

interface PageCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageDocument;
}

export const PageCodeModal: React.FC<PageCodeModalProps> = ({
  isOpen,
  onClose,
  page
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'tracking'>('html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullHtml = compilePageHtml(page, false);
  const customCss = page.tracking.customCss || '/* Nenhum CSS personalizado cadastrado */';
  const trackingCode = `<!-- Scripts e Pixels Configurados -->\n` +
    (page.tracking.metaPixelId ? `<!-- Meta Pixel ID: ${page.tracking.metaPixelId} -->\n` : '') +
    (page.tracking.gtmId ? `<!-- Google Tag Manager: ${page.tracking.gtmId} -->\n` : '') +
    (page.tracking.ga4Id ? `<!-- Google Analytics 4: ${page.tracking.ga4Id} -->\n` : '') +
    (page.tracking.customHeadScripts ? `\n<!-- Head Scripts Customizados -->\n${page.tracking.customHeadScripts}\n` : '');

  const getActiveCode = () => {
    if (activeTab === 'html') return fullHtml;
    if (activeTab === 'css') return customCss;
    return trackingCode;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${page.slug || 'landing-page'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ver Código da Landing Page</h3>
              <p className="text-[11px] text-slate-400">Código HTML5, CSS e scripts gerados para a página</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Action Buttons */}
        <div className="px-6 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'html'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              HTML Completo
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'css'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              CSS Global
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tracking'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Scripts & Tracking
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo HTML</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed select-text">
          <pre className="whitespace-pre-wrap break-all">
            {getActiveCode()}
          </pre>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-200 px-6 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 shrink-0">
          <span>Este código é 100% autônomo, sem dependências de frameworks no cliente.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
