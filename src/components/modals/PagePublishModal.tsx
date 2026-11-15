import React, { useState } from 'react';
import { X, Globe, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { PageDocument, PageStatus } from '../../types/page';

interface PagePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageDocument;
  onPublish: (slug: string, status: PageStatus) => void;
}

export const PagePublishModal: React.FC<PagePublishModalProps> = ({
  isOpen,
  onClose,
  page,
  onPublish
}) => {
  const [slug, setSlug] = useState(page.slug || '');
  const [status, setStatus] = useState<PageStatus>(page.status || 'draft');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const fullPublicUrl = `${origin}/p/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPublicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    onPublish(cleanSlug, status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Publicar Landing Page</h3>
              <p className="text-[11px] text-slate-400">Torne sua página acessível ao público na internet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Status Toggle Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">Status da Página</div>
              <div className="text-[11px] text-slate-500">
                {status === 'published' 
                  ? 'A página está online e aberta para receber visitantes e leads.' 
                  : 'A página está offline e apenas visível no painel administrativo.'}
              </div>
            </div>

            <button
              onClick={() => setStatus(status === 'published' ? 'unpublished' : 'published')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                status === 'published'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
              }`}
            >
              {status === 'published' ? 'Online' : 'Despublicada'}
            </button>
          </div>

          {/* Slug input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Slug da URL Pública</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
              <span className="px-3 py-2 bg-slate-100 text-slate-500 font-mono text-xs border-r border-slate-200">
                {origin}/p/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="nome-da-sua-pagina"
                className="flex-1 px-3 py-2 text-xs font-mono outline-none bg-white"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Use apenas letras minúsculas, números e traços.
            </span>
          </div>

          {/* Public Link Preview Box */}
          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-700 truncate">
              {fullPublicUrl}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold flex items-center gap-1 text-[11px] shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <a
                href={fullPublicUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs"
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="h-14 border-t border-slate-200 px-6 flex items-center justify-end gap-2 bg-slate-50">
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
            Confirmar e Publicar
          </button>
        </div>
      </div>
    </div>
  );
};
