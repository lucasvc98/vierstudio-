import React, { useState } from 'react';
import { X, Upload, Code2, FileCode, Check, Eye, Folder, Sparkles, AlertCircle } from 'lucide-react';
import { EmailDocument } from '../../types/email';
import { parseHtmlToEmailDocument } from '../../utils/htmlParser';

interface ImportHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
  onImport: (project: EmailDocument) => void;
}

export const ImportHtmlModal: React.FC<ImportHtmlModalProps> = ({
  isOpen,
  onClose,
  folders,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [projectName, setProjectName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Geral');
  const [htmlContent, setHtmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm') && !file.type.includes('html')) {
      setErrorMsg('Por favor, selecione um arquivo válido com extensão .html ou .htm');
      return;
    }

    setErrorMsg('');
    setFileName(file.name);
    setFileSizeKb((file.size / 1024).toFixed(1));
    if (!projectName) {
      setProjectName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlContent.trim()) {
      setErrorMsg('Por favor, selecione um arquivo HTML ou cole o código fonte.');
      return;
    }

    try {
      const finalName = projectName.trim() || fileName.replace(/\.[^/.]+$/, '') || 'Template Importado HTML';
      const parsedDoc = parseHtmlToEmailDocument(htmlContent, finalName, selectedFolder);
      onImport(parsedDoc);
      onClose();
      // Reset state
      setHtmlContent('');
      setFileName('');
      setProjectName('');
      setErrorMsg('');
    } catch (err: any) {
      console.error('Failed to parse HTML', err);
      setErrorMsg(`Erro ao processar HTML: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Subir Novo Template com HTML</h2>
              <p className="text-xs text-slate-500">
                Importe templates prontos de e-mail marketing para editar e modelar no editor visual
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleImportSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Template / E-mail
              </label>
              <input
                type="text"
                placeholder="Ex: Campanha Especial Black Friday"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salvar na Pasta
              </label>
              <select
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {folders.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upload' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar Arquivo .HTML</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'paste' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Colar Código HTML</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div>
              <label 
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-300 text-slate-500 group-hover:text-indigo-600 flex items-center justify-center mb-2 shadow-2xs transition-colors">
                  <Upload className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                  {fileName ? (
                    <span className="text-indigo-600 font-semibold">{fileName} ({fileSizeKb} KB)</span>
                  ) : (
                    <span>Clique para selecionar ou arraste seu arquivo .html aqui</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos aceitos: arquivos .html ou .htm prontos
                </p>
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {htmlContent && (
                <div className="mt-3 flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Arquivo carregado com sucesso ({fileSizeKb} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                    className="flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isPreviewOpen ? 'Ocultar Prévia' : 'Ver Prévia'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASTE CODE */}
          {activeTab === 'paste' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Código Fonte do E-mail</label>
                {htmlContent && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isPreviewOpen ? 'Ocultar Prévia' : 'Ver Prévia'}</span>
                  </button>
                )}
              </div>
              <textarea
                rows={8}
                placeholder="<!DOCTYPE html><html><body>Cole aqui o código HTML do seu e-mail...</body></html>"
                value={htmlContent}
                onChange={e => setHtmlContent(e.target.value)}
                className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Optional Sandbox Preview */}
          {isPreviewOpen && htmlContent && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[11px] font-bold text-slate-600 flex justify-between items-center">
                <span>Prévia do HTML Importado</span>
                <span className="text-[10px] text-slate-400 font-mono">{htmlContent.length} caracteres</span>
              </div>
              <div className="h-48 overflow-y-auto bg-white">
                <iframe
                  srcDoc={htmlContent}
                  title="Prévia"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!htmlContent.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Importar e Abrir no Editor</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
