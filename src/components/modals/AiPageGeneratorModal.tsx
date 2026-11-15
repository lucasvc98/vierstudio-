import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Target,
  Palette,
  Image as ImageIcon,
  CreditCard,
  Upload,
  FolderOpen,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Settings,
  AlertCircle,
  MessageCircle,
  FileText
} from 'lucide-react';
import {
  AiBriefingPlanInput,
  AiColorPaletteInput,
  AiPageBriefingRequest,
  AiProviderMode,
  PageCategoryType,
  PageDocument
} from '../../types/page';
import { AI_COLOR_PALETTES, AI_OBJECTIVE_OPTIONS, AI_TONE_OPTIONS } from '../../utils/aiPalettes';
import { FileManagerModal } from './FileManagerModal';

interface AiPageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
  onPageGenerated: (page: PageDocument, aiMode?: string) => void;
}

type MediaSlotTarget =
  | { kind: 'logo' }
  | { kind: 'product' }
  | { kind: 'expert' }
  | { kind: 'extra'; index: number };

const createEmptyPlan = (idx = 1): AiBriefingPlanInput => ({
  id: `plan-${Date.now()}-${idx}`,
  name: idx === 1 ? 'Plano Completo' : `Plano ${idx}`,
  badge: idx === 1 ? 'MAIS ESCOLHIDO' : '',
  originalPrice: '',
  price: '',
  installments: '',
  description: '',
  features: '',
  buttonText: 'Garantir Minha Vaga →',
  checkoutUrl: ''
});

export const AiPageGeneratorModal: React.FC<AiPageGeneratorModalProps> = ({
  isOpen,
  onClose,
  folders,
  onPageGenerated
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Produto, Objetivo e Briefing
  const [productName, setProductName] = useState('');
  const [expertName, setExpertName] = useState('');
  const [expertRole, setExpertRole] = useState('');
  const [objective, setObjective] = useState<PageCategoryType>('sales');
  const [tone, setTone] = useState<string>(AI_TONE_OPTIONS[0]);
  const [folder, setFolder] = useState<string>('Geral');
  const [briefing, setBriefing] = useState('');

  // Step 2: Logo, Fotos e Paleta de Cores
  const [logoUrl, setLogoUrl] = useState('');
  const [productPhotoUrl, setProductPhotoUrl] = useState('');
  const [expertPhotoUrl, setExpertPhotoUrl] = useState('');
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);
  const [palette, setPalette] = useState<AiColorPaletteInput>(AI_COLOR_PALETTES[0]);

  // Step 3: Preços, Planos e Conversão
  const [includePricing, setIncludePricing] = useState(true);
  const [includeForm, setIncludeForm] = useState(false);
  const [includeCountdown, setIncludeCountdown] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [plans, setPlans] = useState<AiBriefingPlanInput[]>([createEmptyPlan(1)]);

  // AI Engine Config
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProviderMode>('auto');
  const [customApiKey, setCustomApiKey] = useState('');
  const [serverAiStatus, setServerAiStatus] = useState<{ hasGeminiKey: boolean; hasOpenAiKey: boolean }>({
    hasGeminiKey: false,
    hasOpenAiKey: false
  });

  // UI & Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStage, setGeneratingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<MediaSlotTarget | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    const savedKey = localStorage.getItem('vierstudio_ai_api_key') || '';
    const savedProv = (localStorage.getItem('vierstudio_ai_provider') as AiProviderMode) || 'auto';
    setCustomApiKey(savedKey);
    setAiProvider(savedProv);

    fetch('/api/pages/ai-status')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setServerAiStatus({
            hasGeminiKey: Boolean(data.hasGeminiKey),
            hasOpenAiKey: Boolean(data.hasOpenAiKey)
          });
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleObjectiveChange = (nextObj: PageCategoryType) => {
    setObjective(nextObj);
    const meta = AI_OBJECTIVE_OPTIONS.find(o => o.id === nextObj);
    if (meta) {
      setIncludePricing(meta.defaultPricing);
      setIncludeForm(meta.defaultForm);
    }
  };

  const handleFillExample = () => {
    setProductName('Método Acelera Vendas 360');
    setExpertName('Camila Vasconcelos');
    setExpertRole('Estrategista de Vendas & Growth');
    setObjective('sales');
    setTone(AI_TONE_OPTIONS[0]);
    setBriefing(
      'Treinamento online completo para donos de pequenos negócios e prestadores de serviço estruturarem funis de vendas previsíveis no WhatsApp e Instagram.\n' +
        '- Público-alvo: empreendedores que faturam pouco ou dependem apenas de indicação.\n' +
        '- Principais benefícios: scripts prontos de atendimento, tráfego pago direto ao ponto, aulas práticas de 15 minutos e planilha de controle.\n' +
        '- Garantia incondicional de 7 dias e suporte em comunidade VIP.'
    );
    setIncludePricing(true);
    setIncludeForm(true);
    setIncludeCountdown(true);
    setWhatsapp('5511999999999');
    setCtaText('Quero Estruturar Minhas Vendas →');
    setPlans([
      {
        id: 'ex-1',
        name: 'Acesso Essencial',
        badge: '',
        originalPrice: 'R$ 497,00',
        price: 'R$ 297,00',
        installments: 'ou 12x de R$ 29,70',
        description: 'Ideal para começar no ritmo certo com as aulas gravadas',
        features: 'Acesso completo por 1 ano\nScripts prontos para WhatsApp\nPlanilha de funil e metas\nGarantia de 7 dias',
        buttonText: 'Começar no Essencial →',
        checkoutUrl: '#cadastro'
      },
      {
        id: 'ex-2',
        name: 'Mentoria VIP + Bônus',
        badge: 'MAIS ESCOLHIDO',
        originalPrice: 'R$ 1.297,00',
        price: 'R$ 597,00',
        installments: 'ou 12x de R$ 59,70',
        description: 'Acompanhamento próximo, grupo exclusivo e análise de página',
        features: 'Tudo do Acesso Essencial\n4 encontros ao vivo de tira-dúvidas\nGrupo VIP de networking\nAnálise individual do seu funil',
        buttonText: 'Garantir Vaga VIP →',
        checkoutUrl: '#cadastro'
      }
    ]);
  };

  const handleFileUpload = (slotKey: string, folderName: string, onUrl: (url: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlot(slotKey);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            folder: folderName,
            url: dataUrl,
            sizeBytes: file.size,
            mimeType: file.type || 'image/png',
            altText: file.name.replace(/\.[^/.]+$/, '')
          })
        });
        const data = await res.json();
        onUrl(data.success && data.asset?.url ? data.asset.url : dataUrl);
      } catch {
        onUrl(dataUrl);
      } finally {
        setUploadingSlot(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFromMediaManager = (url: string) => {
    if (!mediaTarget) return;
    if (mediaTarget.kind === 'logo') setLogoUrl(url);
    else if (mediaTarget.kind === 'product') setProductPhotoUrl(url);
    else if (mediaTarget.kind === 'expert') setExpertPhotoUrl(url);
    else if (mediaTarget.kind === 'extra') {
      setExtraPhotos(prev => {
        const next = [...prev];
        next[mediaTarget.index] = url;
        return next;
      });
    }
    setMediaTarget(null);
  };

  const handlePlanChange = (id: string, field: keyof AiBriefingPlanInput, value: string) => {
    setPlans(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleAddPlan = () => {
    if (plans.length >= 3) return;
    setPlans(prev => [...prev, createEmptyPlan(prev.length + 1)]);
  };

  const handleRemovePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleGeneratePage = async () => {
    if (!productName.trim()) {
      setErrorMessage('Por favor, informe o nome do produto, serviço ou marca.');
      setStep(1);
      return;
    }
    if (!briefing.trim()) {
      setErrorMessage('Por favor, preencha o briefing para a IA criar os textos e a página.');
      setStep(1);
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);

    if (customApiKey.trim()) {
      localStorage.setItem('vierstudio_ai_api_key', customApiKey.trim());
    } else {
      localStorage.removeItem('vierstudio_ai_api_key');
    }
    localStorage.setItem('vierstudio_ai_provider', aiProvider);

    const stages = [
      'Analisando briefing e objetivo da página...',
      'Escrevendo headlines, benefícios e quebra de objeções...',
      'Aplicando paleta de cores, logo, fotos e planos...',
      'Montando seções responsivas no Vier Page Builder...'
    ];
    let stageIdx = 0;
    setGeneratingStage(stages[0]);
    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setGeneratingStage(stages[stageIdx]);
    }, 1300);

    try {
      const payload: AiPageBriefingRequest = {
        productName: productName.trim(),
        objective,
        briefing: briefing.trim(),
        tone,
        expertName: expertName.trim() || undefined,
        expertRole: expertRole.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        productPhotoUrl: productPhotoUrl.trim() || undefined,
        expertPhotoUrl: expertPhotoUrl.trim() || undefined,
        extraPhotos: extraPhotos.map(u => u.trim()).filter(Boolean),
        plans: includePricing ? plans : [],
        includePricing,
        includeForm,
        includeCountdown,
        whatsapp: whatsapp.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        ctaUrl: ctaUrl.trim() || undefined,
        folder: folder || 'Geral',
        palette,
        aiConfig: {
          provider: aiProvider,
          apiKey: customApiKey.trim() || undefined
        }
      };

      const res = await fetch('/api/pages/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.page) {
        throw new Error(data.message || 'Falha ao gerar página com IA.');
      }

      onPageGenerated(data.page, data.aiMode);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao gerar a página.');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGeneratingStage('');
    }
  };

  const renderImageSlot = (
    title: string,
    subtitle: string,
    slotKey: string,
    urlValue: string,
    onChangeUrl: (val: string) => void,
    folderName: string,
    target: MediaSlotTarget
  ) => (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-slate-800">{title}</div>
          <div className="text-[11px] text-slate-500">{subtitle}</div>
        </div>
        {urlValue && (
          <button
            type="button"
            onClick={() => onChangeUrl('')}
            className="text-[11px] text-red-500 hover:text-red-600 font-semibold"
          >
            Remover
          </button>
        )}
      </div>

      {urlValue && (
        <div className="h-24 w-full rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1">
          <img src={urlValue} alt={title} className="max-h-full max-w-full object-contain rounded" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer transition-colors">
          {uploadingSlot === slotKey ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <Upload className="w-3.5 h-3.5 text-indigo-600" />}
          <span>{uploadingSlot === slotKey ? 'Enviando...' : 'Enviar Foto'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload(slotKey, folderName, onChangeUrl)}
          />
        </label>

        <button
          type="button"
          onClick={() => setMediaTarget(target)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-700 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Biblioteca</span>
        </button>

        <input
          type="text"
          value={urlValue}
          onChange={e => onChangeUrl(e.target.value)}
          placeholder="ou cole a URL da imagem..."
          className="flex-1 min-w-[160px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-4">
        <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                  Criador de Páginas com IA
                  <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">
                    Briefing Inteligente
                  </span>
                </h2>
                <p className="text-xs text-indigo-100">
                  Preencha o briefing e a IA cria textos persuasivos, seções, planos, cores e layout completos
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {[
                { id: 1 as const, label: '1. Briefing & Objetivo', icon: FileText },
                { id: 2 as const, label: '2. Logo, Fotos & Cores', icon: Palette },
                { id: 3 as const, label: '3. Planos, Preços & IA', icon: CreditCard }
              ].map(tab => {
                const Icon = tab.icon;
                const active = step === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStep(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFillExample}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preencher Exemplo</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* ==================== STEP 1 ==================== */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome do Produto / Marca / Serviço *
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder="Ex: Método Venda Direta, Clínica BellaVita, Vinko Log..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome do Expert / Empresa
                      </label>
                      <input
                        type="text"
                        value={expertName}
                        onChange={e => setExpertName(e.target.value)}
                        placeholder="Ex: Dra. Ana Paula"
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Especialidade / Cargo
                      </label>
                      <input
                        type="text"
                        value={expertRole}
                        onChange={e => setExpertRole(e.target.value)}
                        placeholder="Ex: Mentora Financeira"
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Objective Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Objetivo da Landing Page</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {AI_OBJECTIVE_OPTIONS.map(opt => {
                      const isSel = objective === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleObjectiveChange(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSel
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className={`text-xs font-bold ${isSel ? 'text-indigo-700' : 'text-slate-800'}`}>
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                            {opt.shortDesc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tone & Folder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tom de Voz da Copy
                    </label>
                    <select
                      value={tone}
                      onChange={e => setTone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                    >
                      {AI_TONE_OPTIONS.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Salvar na Pasta
                    </label>
                    <select
                      value={folder}
                      onChange={e => setFolder(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                    >
                      {Array.from(new Set(['Geral', ...folders])).map(f => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Briefing Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Briefing Completo da Página *
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Conte para a IA tudo sobre o produto/serviço, público-alvo, principais dores que resolve, diferenciais, bônus, garantia e o que o visitante deve fazer.
                  </p>
                  <textarea
                    rows={6}
                    value={briefing}
                    onChange={e => setBriefing(e.target.value)}
                    placeholder="Ex: É uma mentoria de 8 semanas para dentistas aumentarem o faturamento da clínica usando tráfego local e atendimento no WhatsApp. Público: donos de clínicas pequenas. Diferenciais: entrega scripts prontos, acompanhamento semanal e garantia de 15 dias..."
                    className="w-full px-3.5 py-3 text-xs leading-relaxed border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* ==================== STEP 2 ==================== */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderImageSlot(
                    'Logo da Marca',
                    'Aparece no cabeçalho, rodapé e ícone da aba (favicon)',
                    'logo',
                    logoUrl,
                    setLogoUrl,
                    'Logos',
                    { kind: 'logo' }
                  )}

                  {renderImageSlot(
                    'Foto Principal do Produto / Oferta',
                    'Destaque na abertura (Hero) da página. Se vazio, usamos foto padrão.',
                    'product',
                    productPhotoUrl,
                    setProductPhotoUrl,
                    'Produtos',
                    { kind: 'product' }
                  )}

                  {renderImageSlot(
                    'Foto do Expert / Equipe',
                    'Usada na seção "Sobre o Especialista / Sobre Nós"',
                    'expert',
                    expertPhotoUrl,
                    setExpertPhotoUrl,
                    'Equipe',
                    { kind: 'expert' }
                  )}

                  {/* Extra Photos Gallery */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Fotos Extras / Galeria (Opcional)</div>
                        <div className="text-[11px] text-slate-500">Até 3 fotos adicionais do produto ou resultados</div>
                      </div>
                      {extraPhotos.length < 3 && (
                        <button
                          type="button"
                          onClick={() => setExtraPhotos(prev => [...prev, ''])}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Foto
                        </button>
                      )}
                    </div>

                    {extraPhotos.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setExtraPhotos([''])}
                        className="w-full py-3 border border-dashed border-slate-300 rounded-lg text-[11px] font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        + Adicionar foto de galeria / detalhe do produto
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {extraPhotos.map((exUrl, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <label className="p-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100" title="Upload">
                              <Upload className="w-3.5 h-3.5 text-indigo-600" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload(`extra-${idx}`, 'Produtos', (url) => {
                                  setExtraPhotos(prev => prev.map((item, i) => (i === idx ? url : item)));
                                })}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setMediaTarget({ kind: 'extra', index: idx })}
                              className="p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-100"
                              title="Biblioteca"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="text"
                              value={exUrl}
                              onChange={e =>
                                setExtraPhotos(prev => prev.map((item, i) => (i === idx ? e.target.value : item)))
                              }
                              placeholder={`URL da foto extra ${idx + 1}...`}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => setExtraPhotos(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Palette Selector */}
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Paleta de Cores da Página
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Escolha uma paleta pronta ou personalize as cores exatamente com a identidade da sua marca.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AI_COLOR_PALETTES.map(pal => {
                      const active = palette.id === pal.id;
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => setPalette(pal)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                            active
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">{pal.name}</div>
                            <div className="text-[10px] text-slate-400">{pal.isDark ? 'Tema Escuro' : 'Tema Claro'}</div>
                          </div>
                          <div className="flex items-center -space-x-1">
                            <span className="w-4 h-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: pal.heroBgColor }} />
                            <span className="w-4 h-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: pal.primaryColor }} />
                            <span className="w-4 h-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: pal.secondaryColor }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {[
                      { key: 'primaryColor' as const, label: 'Cor Principal (Botões)' },
                      { key: 'secondaryColor' as const, label: 'Cor Secundária' },
                      { key: 'heroBgColor' as const, label: 'Fundo Hero/Topo' },
                      { key: 'backgroundColor' as const, label: 'Fundo da Página' },
                      { key: 'textColor' as const, label: 'Cor dos Textos' }
                    ].map(c => (
                      <div key={c.key}>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1 truncate">{c.label}</label>
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                          <input
                            type="color"
                            value={palette[c.key]}
                            onChange={e =>
                              setPalette(prev => ({
                                ...prev,
                                id: 'custom',
                                name: 'Personalizada',
                                [c.key]: e.target.value
                              }))
                            }
                            className="w-6 h-6 rounded cursor-pointer border-0"
                          />
                          <span className="text-[10px] font-mono text-slate-600">{palette[c.key]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP 3 ==================== */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Conversion toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Tabela de Preços/Planos</div>
                      <div className="text-[10px] text-slate-500">Exibir cards de oferta</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includePricing}
                      onChange={e => setIncludePricing(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Formulário de Leads</div>
                      <div className="text-[10px] text-slate-500">Capturar nome, e-mail e WhatsApp</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeForm}
                      onChange={e => setIncludeForm(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Contador de Urgência</div>
                      <div className="text-[10px] text-slate-500">Timer regressivo na oferta</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeCountdown}
                      onChange={e => setIncludeCountdown(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </label>
                </div>

                {/* WhatsApp & CTA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="5511999999999"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Texto do Botão Principal (Opcional)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={e => setCtaText(e.target.value)}
                      placeholder="Deixe vazio para a IA criar"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Link do Checkout / Destino (Opcional)
                    </label>
                    <input
                      type="text"
                      value={ctaUrl}
                      onChange={e => setCtaUrl(e.target.value)}
                      placeholder="https://pay.kiwify.com.br/..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Dynamic Plans Builder */}
                {includePricing && (
                  <div className="space-y-3 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">Preços & Planos da Oferta</h4>
                        <p className="text-[11px] text-slate-500">
                          Preencha seus planos (até 3 lado a lado) ou deixe em branco para a IA sugerir com base no briefing.
                        </p>
                      </div>
                      {plans.length < 3 && (
                        <button
                          type="button"
                          onClick={handleAddPlan}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Plano</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {plans.map((plan, idx) => (
                        <div key={plan.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-indigo-700">Plano #{idx + 1}</span>
                            {plans.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePlan(plan.id)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remover
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome do Plano</label>
                              <input
                                type="text"
                                value={plan.name}
                                onChange={e => handlePlanChange(plan.id, 'name', e.target.value)}
                                placeholder="Ex: Plano Pro"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Selo (Badge)</label>
                              <input
                                type="text"
                                value={plan.badge || ''}
                                onChange={e => handlePlanChange(plan.id, 'badge', e.target.value)}
                                placeholder="Ex: MAIS ESCOLHIDO"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Descrição Curta</label>
                              <input
                                type="text"
                                value={plan.description || ''}
                                onChange={e => handlePlanChange(plan.id, 'description', e.target.value)}
                                placeholder="Ideal para..."
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Preço De (Opcional)</label>
                              <input
                                type="text"
                                value={plan.originalPrice || ''}
                                onChange={e => handlePlanChange(plan.id, 'originalPrice', e.target.value)}
                                placeholder="Ex: R$ 997,00"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Preço Atual</label>
                              <input
                                type="text"
                                value={plan.price}
                                onChange={e => handlePlanChange(plan.id, 'price', e.target.value)}
                                placeholder="Ex: R$ 497,00"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Parcelamento</label>
                              <input
                                type="text"
                                value={plan.installments || ''}
                                onChange={e => handlePlanChange(plan.id, 'installments', e.target.value)}
                                placeholder="Ex: ou 12x de R$ 49,60"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                O que está incluso (1 item por linha — vazio = IA sugere)
                              </label>
                              <textarea
                                rows={3}
                                value={plan.features}
                                onChange={e => handlePlanChange(plan.id, 'features', e.target.value)}
                                placeholder={"Acesso imediato\nSuporte via WhatsApp\nGarantia de 7 dias"}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Texto do Botão</label>
                                <input
                                  type="text"
                                  value={plan.buttonText || ''}
                                  onChange={e => handlePlanChange(plan.id, 'buttonText', e.target.value)}
                                  placeholder="Garantir Minha Vaga →"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Link de Checkout do Plano</label>
                                <input
                                  type="text"
                                  value={plan.checkoutUrl || ''}
                                  onChange={e => handlePlanChange(plan.id, 'checkoutUrl', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advanced AI Key Drawer */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAiSettings(!showAiSettings)}
                    className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Configurações do Motor de IA (Opcional)</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {serverAiStatus.hasGeminiKey
                        ? 'Gemini ativo no servidor'
                        : serverAiStatus.hasOpenAiKey
                        ? 'OpenAI ativo no servidor'
                        : customApiKey
                        ? 'Chave personalizada informada'
                        : 'Motor Inteligente Integrado ativo'}
                    </span>
                  </button>

                  {showAiSettings && (
                    <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Provedor de IA</label>
                        <select
                          value={aiProvider}
                          onChange={e => setAiProvider(e.target.value as AiProviderMode)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="auto">Automático (Usa Gemini/OpenAI se houver chave, senão Motor Local)</option>
                          <option value="gemini">Google Gemini (Gemini 2.5 Flash)</option>
                          <option value="openai">OpenAI (GPT-4o Mini)</option>
                          <option value="smart-engine">Motor Inteligente Local (Sem API externa)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Chave API Gemini ou OpenAI (Opcional)
                        </label>
                        <input
                          type="password"
                          value={customApiKey}
                          onChange={e => setCustomApiKey(e.target.value)}
                          placeholder="AIza... ou sk-... (opcional)"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              )}
              {isGenerating && (
                <span className="text-xs font-semibold text-indigo-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {generatingStage || 'Gerando página...'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {step < 3 && (
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>{step === 1 ? 'Personalizar Fotos & Cores' : 'Definir Preços & Planos'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGeneratePage}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando Landing Page...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Página Completa com IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Media Library Picker */}
      <FileManagerModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelectImage={handleSelectFromMediaManager}
      />
    </>
  );
};
