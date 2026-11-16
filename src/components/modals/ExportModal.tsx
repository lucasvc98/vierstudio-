import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Code2, Check, AlertTriangle, ShieldCheck, ExternalLink, Sparkles, Cloud } from 'lucide-react';
import { EmailDocument } from '../../types/email';
import { compileEmailHtml } from '../../utils/emailCompiler';
import { hasBase64Images, cleanDocumentBase64Images } from '../../utils/cloudImageUploader';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: EmailDocument;
  onUpdateDocument?: (doc: EmailDocument) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  document: initialDoc,
  onUpdateDocument 
}) => {
  const [activeDoc, setActiveDoc] = useState<EmailDocument>(initialDoc);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'platforms'>('code');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveDoc(initialDoc);
  }, [initialDoc]);

  // Se houver imagens Base64, dispara automaticamente a conversão para CDN público
  // para garantir que o Brevo e outras plataformas aceitem o template de primeira
  useEffect(() => {
    if (isOpen && hasBase64Images(activeDoc)) {
      handleAutoConvert();
    }
  }, [isOpen]);

  const handleAutoConvert = async () => {
    setIsConverting(true);
    try {
      const { doc: cleanedDoc, replacedCount } = await cleanDocumentBase64Images(activeDoc);
      if (replacedCount > 0) {
        setActiveDoc(cleanedDoc);
        if (onUpdateDocument) {
          onUpdateDocument(cleanedDoc);
        }
        setConversionMessage(`✓ ${replacedCount} imagem(ns) hospedada(s) com sucesso na nuvem! 100% compatível com o Brevo.`);
        setTimeout(() => setConversionMessage(null), 4000);
      }
    } catch (err) {
      console.warn('Erro ao converter imagens automaticamente:', err);
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen) return null;

  const compiledHtml = compileEmailHtml(activeDoc);
  const sizeBytes = new Blob([compiledHtml]).size;
  const sizeKb = (sizeBytes / 1024).toFixed(1);
  const isGmailSafe = sizeBytes < 102400; // 102KB limit
  const containsBase64 = hasBase64Images(activeDoc);

  const handleCopy = async () => {
    try {
      let htmlToCopy = compiledHtml;
      if (containsBase64) {
        setIsConverting(true);
        const { doc: cleaned, replacedCount } = await cleanDocumentBase64Images(activeDoc);
        if (replacedCount > 0) {
          setActiveDoc(cleaned);
          if (onUpdateDocument) onUpdateDocument(cleaned);
          htmlToCopy = compileEmailHtml(cleaned);
        }
        setIsConverting(false);
      }
      await navigator.clipboard.writeText(htmlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = async () => {
    let docToDownload = activeDoc;
    if (containsBase64) {
      setIsConverting(true);
      const { doc: cleaned, replacedCount } = await cleanDocumentBase64Images(activeDoc);
      if (replacedCount > 0) {
        setActiveDoc(cleaned);
        if (onUpdateDocument) onUpdateDocument(cleaned);
        docToDownload = cleaned;
      }
      setIsConverting(false);
    }
    const htmlString = compileEmailHtml(docToDownload);
    const filename = `${docToDownload.name.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'email'}.html`;
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Exportar E-mail HTML</h2>
                <span className="text-[11px] font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
                  Pronto para Disparo
                </span>
              </div>
              <p className="text-xs text-slate-500">HTML autônomo baseado em tabelas inline compatível com Gmail, Outlook e Apple Mail</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'HTML Copiado!' : 'Copiar HTML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Baixar Arquivo .html</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quality & Metrics Banner */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="text-slate-400">Peso do Arquivo:</span>
              <span className="font-mono font-semibold text-slate-900">{sizeKb} KB</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isGmailSafe ? (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Seguro contra Clipping do Gmail (&lt; 102 KB)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> Atenção: Acima de 102 KB. Reduza blocos ou imagens.
                </span>
              )}
            </div>

            <div className="text-slate-500">
              VML Outlook: <span className="text-indigo-600 font-semibold">Ativado</span>
            </div>

            <div>
              {containsBase64 ? (
                <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Imagens Base64 detectadas
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> 100% Compatível com Brevo & Mailchimp
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'code' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Código HTML
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'preview' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pré-visualização
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'platforms' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Instruções de Importação
            </button>
          </div>
        </div>

        {/* Warning Banner for Brevo / Base64 */}
        {containsBase64 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Aviso Brevo/Mailchimp:</span> O Brevo rejeita imagens em Base64. Clique ao lado para converter e hospedar na nuvem em alta velocidade.
              </div>
            </div>
            <button
              onClick={handleAutoConvert}
              disabled={isConverting}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Hospedando Imagens...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Converter para URLs Públicas (Brevo)</span>
                </>
              )}
            </button>
          </div>
        )}

        {conversionMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{conversionMessage}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-950 text-slate-100 flex flex-col font-mono text-xs">
          {activeTab === 'code' && (
            <div className="relative flex-1 overflow-auto bg-slate-900 rounded-xl p-4 border border-slate-800 text-slate-200 select-all">
              <pre className="whitespace-pre font-mono leading-relaxed">
                <code>{compiledHtml}</code>
              </pre>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex-1 bg-white rounded-xl overflow-hidden border border-slate-800">
              <iframe 
                srcDoc={compiledHtml} 
                title="Preview" 
                className="w-full h-full border-0" 
                sandbox="allow-same-origin allow-popups"
              />
            </div>
          )}

          {activeTab === 'platforms' && (
            <div className="flex-1 bg-white text-slate-800 rounded-xl p-6 overflow-y-auto font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Como utilizar seu HTML nas principais ferramentas de e-mail marketing:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="font-bold text-slate-900 text-sm mb-1">Brevo (Sendinblue)</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Vá em Campanhas &gt; Criar Campanha.</li>
                    <li>No passo de Design, escolha <strong>Colar código / Usar meu HTML</strong>.</li>
                    <li>Cole o código copiado e clique em Salvar.</li>
                  </ol>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="font-bold text-slate-900 text-sm mb-1">RD Station Marketing</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Acesse E-mail &gt; Criar E-mail.</li>
                    <li>Selecione a aba <strong>Importar HTML</strong>.</li>
                    <li>Cole o código gerado pelo vierstudio.</li>
                  </ol>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="font-bold text-slate-900 text-sm mb-1">Mailchimp</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Em Email Templates, clique em <strong>Create Template</strong>.</li>
                    <li>Selecione <strong>Code your own &gt; Paste in code</strong>.</li>
                    <li>Substitua pelo código exportado do vierstudio.</li>
                  </ol>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="font-bold text-slate-900 text-sm mb-1">ActiveCampaign</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Crie uma nova campanha e selecione <strong>Criar do zero</strong>.</li>
                    <li>Escolha o modo <strong>Código personalizado</strong>.</li>
                    <li>Cole o código HTML e prossiga para o disparo.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Variáveis como <code className="text-violet-600 font-bold">&#123;&#123;nome&#125;&#125;</code> são preservadas no código final para mesclagem automática na sua ferramenta.</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
