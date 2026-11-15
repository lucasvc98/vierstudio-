import React, { useState, useEffect } from 'react';
import { X, Users, Download, Search, Mail, Phone, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import { PageLead } from '../../types/page';

interface LeadSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadSubmissionsModal: React.FC<LeadSubmissionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [leads, setLeads] = useState<PageLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadLeads();
    }
  }, [isOpen]);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    const name = (l.data.name || '').toLowerCase();
    const email = (l.data.email || '').toLowerCase();
    const phone = (l.data.phone || '').toLowerCase();
    const slug = (l.pageSlug || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q) || slug.includes(q);
  });

  const exportCsv = () => {
    if (leads.length === 0) return;
    const headers = ['Data', 'Página', 'Nome', 'Email', 'Telefone/WhatsApp', 'LGPD'];
    const rows = filteredLeads.map(l => [
      new Date(l.submittedAt).toLocaleString('pt-BR'),
      l.pageSlug,
      `"${l.data.name || ''}"`,
      `"${l.data.email || ''}"`,
      `"${l.data.phone || ''}"`,
      l.lgpdAccepted ? 'Sim' : 'Não'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-vierstudio-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                Leads Capturados pelos Formulários
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {leads.length} contatos
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Contatos recebidos em tempo real através das landing pages</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLeads}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search and Export */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou página..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 outline-none"
            />
          </div>

          <button
            onClick={exportCsv}
            disabled={leads.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <div className="font-bold text-sm text-slate-600">Nenhum lead encontrado</div>
              <p className="text-xs text-slate-400 mt-1">
                Quando os visitantes preencherem formulários nas suas páginas, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Data / Hora</th>
                    <th className="py-2.5 px-4">Página de Origem</th>
                    <th className="py-2.5 px-4">Nome</th>
                    <th className="py-2.5 px-4">E-mail</th>
                    <th className="py-2.5 px-4">Telefone / WhatsApp</th>
                    <th className="py-2.5 px-4 text-center">LGPD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(l.submittedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-indigo-600">
                        /p/{l.pageSlug}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {l.data.name || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {l.data.email || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {l.data.phone || l.data.whatsapp || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {l.lgpdAccepted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" /> Sim
                          </span>
                        ) : 'Não'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-200 px-6 flex items-center justify-between text-xs text-slate-500 bg-slate-50 shrink-0">
          <span>Dados em conformidade com a LGPD • Armazenamento criptografado</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-200 rounded-lg text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
