import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Mail, Info } from 'lucide-react';
import { EmailDocument } from '../../types/email';
import { compileEmailHtml } from '../../utils/emailCompiler';

interface EmailTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: EmailDocument;
}

interface TestCheckItem {
  id: string;
  title: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export const EmailTesterModal: React.FC<EmailTesterModalProps> = ({ isOpen, onClose, document: doc }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  if (!isOpen) return null;

  const compiledHtml = compileEmailHtml(doc);
  const sizeBytes = new Blob([compiledHtml]).size;
  const sizeKb = (sizeBytes / 1024).toFixed(1);

  // Run comprehensive pre-flight validations
  const checks: TestCheckItem[] = [];

  // 1. Gmail clipping check (102KB threshold)
  if (sizeBytes < 102400) {
    checks.push({
      id: 'weight',
      title: 'Tamanho do Arquivo HTML',
      status: 'pass',
      message: `Tamanho seguro de ${sizeKb} KB (abaixo do limite de 102 KB do Gmail que causaria truncamento).`
    });
  } else {
    checks.push({
      id: 'weight',
      title: 'Tamanho do Arquivo HTML',
      status: 'fail',
      message: `Atenção: O e-mail possui ${sizeKb} KB e pode ser cortado pelo Gmail ("[Mensagem cortada]"). Recomenda-se reduzir seções ou imagens.`
    });
  }

  // 2. Preheader inspection
  if (doc.preheader && doc.preheader.trim().length > 5) {
    checks.push({
      id: 'preheader',
      title: 'Texto de Pré-visualização (Preheader)',
      status: 'pass',
      message: `Configurado com sucesso: "${doc.preheader.slice(0, 50)}${doc.preheader.length > 50 ? '...' : ''}"`
    });
  } else {
    checks.push({
      id: 'preheader',
      title: 'Texto de Pré-visualização (Preheader)',
      status: 'warn',
      message: 'Preheader vazio. Os clientes de e-mail podem puxar texto técnico ou links do cabeçalho como descrição na caixa de entrada.'
    });
  }

  // 3. Inspect all blocks for missing alt tags, empty buttons, or invalid links
  let missingAlts = 0;
  let emptyButtons = 0;
  let localImages = 0;
  let totalBlocks = 0;

  doc.rows.forEach(row => {
    row.columns.forEach(col => {
      col.blocks.forEach(blk => {
        totalBlocks++;
        if (blk.type === 'image' || blk.type === 'logo') {
          if (!blk.content.alt || blk.content.alt.trim() === '') {
            missingAlts++;
          }
          if (blk.content.url && (blk.content.url.startsWith('file://') || blk.content.url.startsWith('blob:'))) {
            localImages++;
          }
        }
        if (blk.type === 'button') {
          if (!blk.content.url || blk.content.url === '#' || blk.content.url.trim() === '') {
            emptyButtons++;
          }
        }
      });
    });
  });

  // Alt tag check
  if (missingAlts === 0) {
    checks.push({
      id: 'alts',
      title: 'Acessibilidade de Imagens (Texto Alternativo)',
      status: 'pass',
      message: 'Todas as imagens possuem texto alternativo preenchido para acessibilidade e leitores de tela.'
    });
  } else {
    checks.push({
      id: 'alts',
      title: 'Acessibilidade de Imagens (Texto Alternativo)',
      status: 'warn',
      message: `${missingAlts} imagem(ns) sem texto alternativo (alt tag).`
    });
  }

  // Button Links check
  if (emptyButtons === 0) {
    checks.push({
      id: 'buttons',
      title: 'Destinos dos Botões de Ação (CTAs)',
      status: 'pass',
      message: 'Todos os botões possuem links de destino configurados.'
    });
  } else {
    checks.push({
      id: 'buttons',
      title: 'Destinos dos Botões de Ação (CTAs)',
      status: 'warn',
      message: `${emptyButtons} botão(ões) estão com URL vazia ou '#' padrão.`
    });
  }

  // Public HTTPS images check
  if (localImages === 0) {
    checks.push({
      id: 'images-https',
      title: 'Origem das Imagens (HTTPS Público)',
      status: 'pass',
      message: 'Todas as imagens utilizam protocolos compatíveis com clientes de e-mail.'
    });
  } else {
    checks.push({
      id: 'images-https',
      title: 'Origem das Imagens (HTTPS Público)',
      status: 'fail',
      message: `${localImages} imagem(ns) estão apontando para caminhos locais ou temporários que não serão vistos pelos destinatários.`
    });
  }

  // Handle Test Dispatch
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Por favor, informe um endereço de e-mail válido para o teste.');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/export/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          subject: `[TESTE] ${doc.subject || doc.name}`,
          doc
        })
      });
      const data = await res.json();
      setSendResult({
        success: data.success,
        message: data.message || 'E-mail de teste disparado com sucesso!',
        details: data.details
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: `Falha ao enviar: ${err.message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Validador Pré-Disparo & Envio de Teste</h2>
              <p className="text-xs text-slate-500">Auditoria técnica de compatibilidade e simulação de entrega</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Diagnostic list */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Diagnóstico de Compatibilidade</h3>
            <div className="space-y-2.5">
              {checks.map(check => (
                <div 
                  key={check.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                    check.status === 'pass' 
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                      : check.status === 'warn' 
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950' 
                      : 'bg-rose-50/60 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="mt-0.5">
                    {check.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {check.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                    {check.status === 'fail' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                  </div>
                  <div>
                    <div className="font-bold">{check.title}</div>
                    <div className="opacity-90 mt-0.5">{check.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Send Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              Disparar E-mail de Teste Real
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Receba o HTML compilado exatamente como seus clientes verão no leitor de e-mail.
            </p>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destinatário do Teste</label>
                <div className="flex gap-2">
                  <input 
                    type="email"
                    placeholder="seuemail@empresa.com.br"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    required
                    className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    {isSending ? 'Enviando...' : 'Enviar Teste'}
                  </button>
                </div>
              </div>
            </form>

            {sendResult && (
              <div className={`mt-4 p-3.5 rounded-lg text-xs border ${
                sendResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {sendResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {sendResult.message}
                </div>
                {sendResult.details && (
                  <div className="text-[11px] opacity-80 space-y-0.5 mt-2 pt-2 border-t border-emerald-200">
                    <div>Provedor: {sendResult.details.provider}</div>
                    <div>Horário: {new Date(sendResult.details.timestamp).toLocaleTimeString()}</div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Fechar Validador
          </button>
        </div>

      </div>
    </div>
  );
};
