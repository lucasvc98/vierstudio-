import {
  AiBriefingPlanInput,
  AiColorPaletteInput,
  AiPageBriefingRequest,
  PageCategoryType,
  PageContainerLayout,
  PageDocument,
  PageElement,
  PageSection
} from '../types/page';
import { generateUniqueId } from '../utils/pageDefaults';

interface AiGeneratedCopy {
  pageTitle: string;
  slug: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSubtext: string;
  };
  benefitsSection: {
    title: string;
    subtitle: string;
    items: { icon: string; title: string; description: string }[];
  };
  aboutSection: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    ctaText: string;
  };
  testimonials: {
    quote: string;
    author: string;
    role: string;
  }[];
  pricingSection: {
    title: string;
    subtitle: string;
    countdownLabel: string;
    plans: {
      badge?: string;
      planName: string;
      description: string;
      originalPrice?: string;
      price: string;
      installments?: string;
      features: string[];
      buttonText: string;
      checkoutUrl?: string;
    }[];
  };
  formSection: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  faq: {
    title: string;
    items: { question: string; answer: string }[];
  };
  finalCta: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  trustBadges: { title: string; desc: string }[];
}

const DEFAULT_FALLBACK_IMAGES: Record<PageCategoryType, { product: string; expert: string }> = {
  'sales': {
    product: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80'
  },
  'lead-capture': {
    product: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'digital-product': {
    product: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80'
  },
  'launch': {
    product: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'webinar': {
    product: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80'
  },
  'services': {
    product: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'ecommerce': {
    product: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=80'
  },
  'booking': {
    product: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&auto=format&fit=crop&q=80'
  },
  'registration': {
    product: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'thank-you': {
    product: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80'
  },
  'upsell': {
    product: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'downsell': {
    product: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'institutional': {
    product: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'events': {
    product: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  },
  'blank': {
    product: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1000&auto=format&fit=crop&q=80',
    expert: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80'
  }
};

function slugify(value: string): string {
  const clean = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const suffix = Date.now().toString(36).slice(-4);
  return `${clean || 'landing-page'}-${suffix}`;
}

function getContrastTextColor(hexColor: string): string {
  const clean = (hexColor || '#6366f1').replace('#', '');
  if (clean.length !== 6) return '#ffffff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#0f172a' : '#ffffff';
}

function escapeHtmlSafe(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parsePlanFeatures(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/\r?\n|;|•/)
    .map(item => item.trim().replace(/^[-*✓✔]\s*/, ''))
    .filter(Boolean);
}

function extractBriefingSentences(briefing: string): string[] {
  return (briefing || '')
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map(s => s.trim().replace(/^[-*•\d.)]+\s*/, ''))
    .filter(s => s.length >= 12);
}

function extractPriceHint(briefing: string): string | null {
  const match = (briefing || '').match(/R\$\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : null;
}

function buildSystemPrompt(req: AiPageBriefingRequest): string {
  const plansSummary = (req.plans || []).length > 0
    ? JSON.stringify(
        req.plans!.map(p => ({
          name: p.name,
          badge: p.badge,
          originalPrice: p.originalPrice,
          price: p.price,
          installments: p.installments,
          description: p.description,
          features: parsePlanFeatures(p.features),
          buttonText: p.buttonText
        })),
        null,
        2
      )
    : 'Nenhum plano estruturado foi informado manualmente (se o objetivo pedir planos/preços, sugira planos coerentes com o briefing).';

  return `Você é um copywriter sênior especialista em Landing Pages de alta conversão no Brasil e UX/CRO.
Com base estrita no briefing abaixo, gere um JSON válido em Português do Brasil com todos os textos persuasivos da página.

DADOS DO BRIEFING:
- Nome do Produto/Marca: ${req.productName}
- Objetivo da LP: ${req.objective}
- Tom de voz desejado: ${req.tone || 'Persuasivo e direto'}
- Nome do Expert/Empresa: ${req.expertName || 'Não informado'} ${req.expertRole ? `(${req.expertRole})` : ''}
- Briefing detalhado do usuário:
"""
${req.briefing}
"""
- Incluir seção de preços/planos? ${req.includePricing ? 'Sim' : 'Somente se fizer sentido'}
- Planos fornecidos pelo usuário (PRESERVE nomes e valores exatos quando informados, enriquecendo apenas descrições/benefícios se estiverem vazios):
${plansSummary}
- CTA sugerido pelo usuário: ${req.ctaText || 'Sugerir o melhor CTA para o objetivo'}
- WhatsApp configurado? ${req.whatsapp ? 'Sim' : 'Não'}

REGRAS DE COPY:
1. Escreva textos claros, persuasivos, específicos ao produto do briefing e livres de clichês genéricos vazios.
2. Retorne APENAS JSON puro (sem markdown \`\`\`json) seguindo exatamente esta estrutura:
{
  "pageTitle": "string curta",
  "slug": "slug-sem-acentos",
  "seo": { "metaTitle": "até 60 chars", "metaDescription": "até 155 chars" },
  "hero": {
    "badge": "etiqueta curta em caixa alta (3 a 5 palavras)",
    "headline": "título principal forte e específico (8 a 14 palavras)",
    "subheadline": "subtítulo de apoio claro em 1 a 2 frases",
    "ctaText": "texto do botão principal",
    "ctaSubtext": "subtexto de segurança/garantia curto"
  },
  "benefitsSection": {
    "title": "título da seção de benefícios",
    "subtitle": "subtítulo curto",
    "items": [
      { "icon": "emoji único", "title": "título curto", "description": "descrição persuasiva (1-2 frases)" }
    ]
  },
  "aboutSection": {
    "eyebrow": "SOBRE A SOLUÇÃO ou CONHEÇA O ESPECIALISTA",
    "title": "título envolvente sobre o produto ou expert",
    "paragraphs": ["parágrafo 1", "parágrafo 2"],
    "ctaText": "texto do botão"
  },
  "testimonials": [
    { "quote": "depoimento realista entre aspas", "author": "Nome Sobrenome", "role": "Perfil ou Cidade" }
  ],
  "pricingSection": {
    "title": "título da seção de planos/investimento",
    "subtitle": "subtítulo com ancoragem e garantia",
    "countdownLabel": "⚡ Condição especial por tempo limitado:",
    "plans": [
      {
        "badge": "MAIS ESCOLHIDO",
        "planName": "nome do plano",
        "description": "para quem é indicado",
        "originalPrice": "R$ 997,00",
        "price": "R$ 497,00",
        "installments": "ou 12x de R$ 49,60",
        "features": ["item 1", "item 2", "item 3", "item 4"],
        "buttonText": "texto do botão"
      }
    ]
  },
  "formSection": {
    "title": "título do formulário de captura/contato",
    "subtitle": "subtítulo explicando o próximo passo",
    "buttonText": "texto do botão de envio"
  },
  "faq": {
    "title": "Perguntas Frequentes",
    "items": [
      { "question": "pergunta específica ao produto?", "answer": "resposta objetiva" }
    ]
  },
  "finalCta": {
    "headline": "chamada final de decisão",
    "subheadline": "reforço da transformação ou garantia",
    "ctaText": "texto do botão final"
  },
  "trustBadges": [
    { "title": "título curto", "desc": "descrição curta" }
  ]
}
Garanta exatamente 6 itens em benefitsSection.items, 3 itens em testimonials, 4 itens em faq.items e 3 itens em trustBadges.`;
}

async function callGeminiApi(req: AiPageBriefingRequest, apiKey: string): Promise<AiGeneratedCopy> {
  const model = req.aiConfig?.model || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildSystemPrompt(req) }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API HTTP ${response.status}: ${errText.slice(0, 240)}`);
  }

  const json: any = await response.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Resposta vazia retornada pela API do Gemini.');
  }

  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned) as AiGeneratedCopy;
}

async function callOpenAiApi(req: AiPageBriefingRequest, apiKey: string): Promise<AiGeneratedCopy> {
  const model = req.aiConfig?.model || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é um especialista brasileiro em copywriting para Landing Pages. Responda apenas com JSON válido.' },
        { role: 'user', content: buildSystemPrompt(req) }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API HTTP ${response.status}: ${errText.slice(0, 240)}`);
  }

  const json: any = await response.json();
  const rawText = json?.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('Resposta vazia retornada pela API da OpenAI.');
  }

  return JSON.parse(rawText) as AiGeneratedCopy;
}

function generateSmartFallbackCopy(req: AiPageBriefingRequest): AiGeneratedCopy {
  const product = req.productName.trim() || 'Seu Produto';
  const expert = req.expertName?.trim() || '';
  const sentences = extractBriefingSentences(req.briefing);
  const priceFromBriefing = extractPriceHint(req.briefing);

  const isLeadLike = ['lead-capture', 'webinar', 'launch', 'booking', 'registration'].includes(req.objective);
  const isService = req.objective === 'services' || req.objective === 'booking';

  const objectiveBadges: Record<string, string> = {
    'sales': 'OFERTA EXCLUSIVA • RESULTADOS COMPROVADOS',
    'lead-capture': 'MATERIAL GRATUITO • ACESSO IMEDIATO',
    'digital-product': 'MÉTODO VALIDADO • ACESSO ONLINE',
    'launch': 'LISTA VIP • VAGAS LIMITADAS',
    'webinar': 'AULA AO VIVO E GRATUITA • INSCREVA-SE',
    'services': 'ATENDIMENTO ESPECIALIZADO • SOB MEDIDA',
    'ecommerce': 'EDIÇÃO ESPECIAL • ENVIO RÁPIDO',
    'booking': 'AGENDE SUA SESSÃO • ATENDIMENTO VIP'
  };

  const defaultHeadlineByObj: Record<string, string> = {
    'sales': `Transforme seus resultados com ${product} de forma rápida e segura`,
    'lead-capture': `Descubra como ${product} pode acelerar seus resultados hoje mesmo`,
    'digital-product': `Domine o método ${product} e alcance o próximo nível passo a passo`,
    'launch': `Garanta sua vaga antecipada no lançamento oficial de ${product}`,
    'webinar': `Participe da aula exclusiva de ${product} e dê o próximo passo`,
    'services': `${product}: soluções estratégicas desenhadas para o seu crescimento`,
    'ecommerce': `Conheça ${product}: qualidade superior feita para o seu dia a dia`,
    'booking': `Agende agora seu atendimento personalizado com ${expert || product}`
  };

  const defaultCtaByObj: Record<string, string> = {
    'sales': 'Quero Garantir Meu Acesso →',
    'lead-capture': 'Quero Receber Agora →',
    'digital-product': 'Quero Começar Agora →',
    'launch': 'Entrar na Lista VIP →',
    'webinar': 'Garantir Minha Vaga Gratuita →',
    'services': 'Solicitar Orçamento →',
    'ecommerce': 'Comprar Agora com Desconto →',
    'booking': 'Agendar Meu Horário →'
  };

  const mainPromise =
    sentences[0] ||
    `Uma solução completa criada para entregar resultados reais com praticidade, segurança e acompanhamento de ponta.`;
  const secondaryPromise =
    sentences[1] ||
    `Desenvolvido com foco total em experiência, retorno rápido e suporte dedicado para você ter tranquilidade em cada etapa.`;

  const defaultBenefits = [
    {
      icon: '🎯',
      title: 'Foco Total em Resultado',
      description: sentences[0] || `Estrutura pensada para quem busca eficiência e retorno real com ${product}.`
    },
    {
      icon: '⚡',
      title: 'Implementação Rápida',
      description: sentences[1] || `Comece a utilizar ${product} em poucos minutos, sem complicações técnicas.`
    },
    {
      icon: '🛡️',
      title: 'Segurança e Garantia',
      description: 'Processo transparente com suporte próximo e garantia total de satisfação.'
    },
    {
      icon: '💎',
      title: 'Qualidade Superior',
      description: sentences[2] || `Cada detalhe de ${product} foi desenhado para entregar alto padrão desde o primeiro contato.`
    },
    {
      icon: '📈',
      title: 'Escalável para Sua Realidade',
      description: isService
        ? 'Atendimento personalizado adaptado às metas e necessidades do seu negócio.'
        : 'Ideal tanto para quem está começando agora quanto para quem quer escalar resultados.'
    },
    {
      icon: '🤝',
      title: 'Suporte Humanizado',
      description: 'Conte com nossa equipe para tirar dúvidas e garantir que você aproveite 100% da solução.'
    }
  ];

  // Build plans from user inputs or fallback smart plans
  const userPlans = (req.plans || []).filter(p => p.name.trim() || p.price.trim());
  const builtPlans = userPlans.length > 0
    ? userPlans.map((p, idx) => {
        const feats = parsePlanFeatures(p.features);
        return {
          badge: p.badge?.trim() || (idx === 1 || (userPlans.length === 1) ? 'RECOMENDADO' : undefined),
          planName: p.name.trim() || `Plano ${idx + 1}`,
          description: p.description?.trim() || `Acesso completo ao pacote ${p.name || product}`,
          originalPrice: p.originalPrice?.trim() || undefined,
          price: p.price.trim() || priceFromBriefing || 'Consulte',
          installments: p.installments?.trim() || undefined,
          features: feats.length > 0
            ? feats
            : [
                `Acesso completo a ${product}`,
                'Suporte prioritário pela equipe',
                'Material e atualizações inclusas',
                'Garantia de satisfação'
              ],
          buttonText: p.buttonText?.trim() || req.ctaText?.trim() || 'Escolher Este Plano →',
          checkoutUrl: p.checkoutUrl?.trim() || req.ctaUrl?.trim() || '#contato'
        };
      })
    : [
        {
          badge: 'MAIS ESCOLHIDO',
          planName: `${product} Completo`,
          description: 'Pacote completo com acesso imediato e bônus exclusivos',
          originalPrice: priceFromBriefing ? undefined : 'R$ 997,00',
          price: priceFromBriefing || (isService ? 'Sob Consulta' : 'R$ 497,00'),
          installments: priceFromBriefing ? 'Condição especial por tempo limitado' : (isService ? 'Proposta personalizada para sua empresa' : 'ou 12x de R$ 49,60'),
          features: [
            `Acesso completo ao ${product}`,
            'Suporte dedicado para tirar dúvidas',
            'Bônus especiais de implementação',
            'Garantia incondicional de 7 dias'
          ],
          buttonText: req.ctaText?.trim() || defaultCtaByObj[req.objective] || 'Garantir Minha Vaga →',
          checkoutUrl: req.ctaUrl?.trim() || '#contato'
        }
      ];

  const aboutTitle = expert
    ? `Conheça ${expert}, especialista por trás de ${product}`
    : `Por que ${product} é a escolha certa para você?`;

  const aboutParagraphs = expert
    ? [
        `${expert}${req.expertRole ? ` (${req.expertRole})` : ''} desenvolveu ${product} após identificar as maiores dificuldades de quem busca resultados consistentes nesse mercado.`,
        secondaryPromise
      ]
    : [
        `${product} nasceu para simplificar o seu caminho e eliminar as barreiras que impedem você de alcançar o próximo nível.`,
        secondaryPromise
      ];

  return {
    pageTitle: product,
    slug: slugify(product),
    seo: {
      metaTitle: `${product} | Página Oficial`,
      metaDescription: mainPromise.slice(0, 155)
    },
    hero: {
      badge: objectiveBadges[req.objective] || 'OFERTA ESPECIAL',
      headline: defaultHeadlineByObj[req.objective] || `Conheça ${product} e transforme seus resultados`,
      subheadline: `${mainPromise} ${sentences[1] || ''}`.trim(),
      ctaText: req.ctaText?.trim() || defaultCtaByObj[req.objective] || 'Quero Saber Mais →',
      ctaSubtext: isLeadLike
        ? '100% gratuito • Seus dados estão seguros'
        : 'Compra segura • Acesso e suporte imediato'
    },
    benefitsSection: {
      title: `O que torna ${product} único`,
      subtitle: 'Confira os pilares e diferenciais pensados para gerar resultado real para você',
      items: defaultBenefits
    },
    aboutSection: {
      eyebrow: expert ? 'QUEM CONDUZ ESSE PROJETO' : 'SOBRE A SOLUÇÃO',
      title: aboutTitle,
      paragraphs: aboutParagraphs,
      ctaText: req.ctaText?.trim() || (isLeadLike ? 'Garantir Minha Vaga →' : 'Ver Planos e Condições →')
    },
    testimonials: [
      {
        quote: `"A experiência com ${product} superou todas as expectativas. A clareza e a velocidade nos resultados fizeram toda a diferença no nosso dia a dia."`,
        author: 'Mariana Duarte',
        role: 'Cliente Verificada • São Paulo, SP'
      },
      {
        quote: `"Antes eu perdia horas tentando resolver isso sozinho. Com ${product}, tudo ficou simples, organizado e com suporte incrível."`,
        author: 'Rafael Mendes',
        role: 'Empreendedor • Belo Horizonte, MG'
      },
      {
        quote: `"Vale cada centavo! Recomendo de olhos fechados para quem busca profissionalismo e retorno rápido."`,
        author: 'Camila Ferreira',
        role: 'Gestora • Curitiba, PR'
      }
    ],
    pricingSection: {
      title: `Escolha a melhor opção para começar com ${product}`,
      subtitle: 'Condições transparentes, acesso imediato e garantia total para sua tranquilidade.',
      countdownLabel: '⚡ Condição especial disponível por tempo limitado:',
      plans: builtPlans
    },
    formSection: {
      title: isLeadLike
        ? `Garanta sua inscrição em ${product}`
        : `Fale com nossa equipe sobre ${product}`,
      subtitle: 'Preencha seus dados abaixo e receba todas as informações diretamente no seu e-mail e WhatsApp.',
      buttonText: req.ctaText?.trim() || (isLeadLike ? 'Confirmar Minha Inscrição →' : 'Enviar Solicitação →')
    },
    faq: {
      title: 'Perguntas Frequentes (FAQ)',
      items: [
        {
          question: `Como funciona o acesso ao ${product}?`,
          answer: isService
            ? 'Assim que você preenche seus dados ou escolhe o plano, nossa equipe entra em contato rapidamente para iniciar o atendimento.'
            : 'Logo após a confirmação, você recebe todas as instruções e acesso imediatamente no seu e-mail e WhatsApp.'
        },
        {
          question: `${product} serve para quem está começando?`,
          answer: 'Sim! Toda a estrutura foi planejada para ser clara, intuitiva e aplicável desde o primeiro dia, mesmo sem experiência prévia.'
        },
        {
          question: 'Posso tirar dúvidas se precisar de ajuda?',
          answer: 'Com certeza. Você terá acesso ao nosso canal de suporte dedicado para acompanhar sua jornada.'
        },
        {
          question: 'Existe alguma garantia?',
          answer: 'Sim! Trabalhamos com transparência total e garantia de satisfação para que você tome sua decisão com segurança.'
        }
      ]
    },
    finalCta: {
      headline: `Pronto para dar o próximo passo com ${product}?`,
      subheadline: 'Aproveite esta condição agora e comece com o pé direito com suporte completo.',
      ctaText: req.ctaText?.trim() || defaultCtaByObj[req.objective] || 'Começar Agora →'
    },
    trustBadges: [
      { title: 'Ambiente Seguro', desc: 'Dados protegidos' },
      { title: 'Atendimento Rápido', desc: 'Suporte dedicado' },
      { title: 'Alta Satisfação', desc: 'Avaliado com 5 estrelas' }
    ]
  };
}

function mergeUserPlansIntoCopy(copy: AiGeneratedCopy, userPlans?: AiBriefingPlanInput[], fallbackCtaUrl?: string): AiGeneratedCopy {
  const validUserPlans = (userPlans || []).filter(p => p.name.trim() || p.price.trim());
  if (validUserPlans.length === 0) return copy;

  const mergedPlans = validUserPlans.map((up, idx) => {
    const aiPlan = copy.pricingSection?.plans?.[idx] || copy.pricingSection?.plans?.[0];
    const parsedFeats = parsePlanFeatures(up.features);
    return {
      badge: up.badge?.trim() || (idx === 1 || validUserPlans.length === 1 ? aiPlan?.badge || 'MAIS ESCOLHIDO' : undefined),
      planName: up.name.trim() || aiPlan?.planName || `Plano ${idx + 1}`,
      description: up.description?.trim() || aiPlan?.description || '',
      originalPrice: up.originalPrice?.trim() || undefined,
      price: up.price.trim() || aiPlan?.price || 'Consulte',
      installments: up.installments?.trim() || undefined,
      features: parsedFeats.length > 0 ? parsedFeats : (aiPlan?.features || ['Acesso completo', 'Suporte dedicado']),
      buttonText: up.buttonText?.trim() || aiPlan?.buttonText || 'Garantir Agora →',
      checkoutUrl: up.checkoutUrl?.trim() || fallbackCtaUrl?.trim() || '#contato'
    };
  });

  return {
    ...copy,
    pricingSection: {
      ...copy.pricingSection,
      plans: mergedPlans
    }
  };
}

function makeHeading(text: string, tag: 'h1' | 'h2' | 'h3', style: PageElement['style'], column?: number): PageElement {
  return {
    id: generateUniqueId('heading'),
    type: 'heading',
    column,
    content: { text, tag },
    style,
    advanced: { deviceVisibility: 'all', animation: 'none' }
  };
}

function makeParagraph(text: string, style: PageElement['style'], column?: number): PageElement {
  return {
    id: generateUniqueId('paragraph'),
    type: 'paragraph',
    column,
    content: { text },
    style,
    advanced: { deviceVisibility: 'all', animation: 'none' }
  };
}

function makeButton(
  text: string,
  url: string,
  primaryColor: string,
  textColor: string,
  subtext?: string,
  textAlign: 'left' | 'center' | 'right' = 'left',
  column?: number
): PageElement {
  return {
    id: generateUniqueId('button'),
    type: 'button',
    column,
    content: { text, url, target: url.startsWith('http') ? '_blank' : '_self', subtext },
    style: {
      backgroundColor: primaryColor,
      color: textColor,
      fontSize: 16,
      fontWeight: 700,
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 32,
      paddingRight: 32,
      borderRadius: 12,
      textAlign,
      marginBottom: 12
    },
    advanced: { deviceVisibility: 'all', trackingEvent: 'InitiateCheckout' }
  };
}

function assemblePageDocument(req: AiPageBriefingRequest, copy: AiGeneratedCopy): PageDocument {
  const p: AiColorPaletteInput = req.palette;
  const isDark = Boolean(p.isDark);
  const btnTextColor = getContrastTextColor(p.primaryColor);
  const cardBg = isDark ? '#18181b' : '#ffffff';
  const cardText = isDark ? '#f8fafc' : '#0f172a';
  const cardMuted = isDark ? '#a1a1aa' : '#475569';
  const cardBorder = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0';

  const fallbackImgs = DEFAULT_FALLBACK_IMAGES[req.objective] || DEFAULT_FALLBACK_IMAGES.sales;
  const productPhoto = req.productPhotoUrl?.trim() || fallbackImgs.product;
  const expertPhoto = req.expertPhotoUrl?.trim() || req.productPhotoUrl?.trim() || fallbackImgs.expert;
  const hasExplicitProductPhoto = Boolean(req.productPhotoUrl?.trim());
  const cleanWhatsapp = (req.whatsapp || '').replace(/\D/g, '');
  const hasPricing = Boolean(req.includePricing || (req.plans && req.plans.some(pl => pl.name.trim() || pl.price.trim())));
  const hasForm = Boolean(req.includeForm);
  const primaryActionTarget = req.ctaUrl?.trim() || (hasPricing ? '#planos' : (hasForm ? '#cadastro' : (cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : '#sobre')));

  const sections: PageSection[] = [];

  // 1. Header Navbar Section
  const headerSec: PageSection = {
    id: generateUniqueId('sec'),
    name: 'Cabeçalho da Marca',
    fullWidth: false,
    style: {
      backgroundColor: p.heroBgColor,
      paddingTop: 18,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '1-col',
        style: { paddingTop: 0, paddingBottom: 0, gap: 0 },
        elements: [
          {
            id: generateUniqueId('html-embed'),
            type: 'html-embed',
            content: {
              html: `
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
                  <div style="display:flex;align-items:center;gap:12px;">
                    ${req.logoUrl?.trim()
                      ? `<img src="${req.logoUrl.trim()}" alt="${escapeHtmlSafe(req.productName)}" style="max-height:42px;width:auto;object-fit:contain;border-radius:6px;" />`
                      : `<div style="width:36px;height:36px;border-radius:10px;background:${p.primaryColor};color:${btnTextColor};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;">${escapeHtmlSafe(req.productName.slice(0, 1).toUpperCase() || 'V')}</div>`
                    }
                    <span style="font-weight:800;font-size:18px;color:${p.heroTextColor};letter-spacing:-0.02em;">${escapeHtmlSafe(req.productName)}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:22px;font-size:13px;font-weight:600;color:${p.heroTextColor};opacity:0.85;">
                    <a href="#beneficios" style="color:inherit;">Benefícios</a>
                    <a href="#sobre" style="color:inherit;">Sobre</a>
                    ${hasPricing ? `<a href="#planos" style="color:inherit;">Planos</a>` : ''}
                    <a href="#faq" style="color:inherit;">Dúvidas</a>
                  </div>
                  <a href="${escapeHtmlSafe(primaryActionTarget)}" style="background:${p.primaryColor};color:${btnTextColor};padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;display:inline-block;">
                    ${escapeHtmlSafe(copy.hero.ctaText)}
                  </a>
                </div>
              `
            },
            style: { width: '100%', marginBottom: 0 }
          }
        ]
      }
    ]
  };
  sections.push(headerSec);

  // 2. Hero Section
  const putFormInHero = hasForm && !hasExplicitProductPhoto && ['lead-capture', 'webinar', 'launch', 'booking'].includes(req.objective);
  const heroElements: PageElement[] = [
    {
      id: generateUniqueId('html-embed'),
      type: 'html-embed',
      column: 1,
      content: {
        html: `<div style="display:inline-block;padding:6px 14px;border-radius:9999px;background:rgba(255,255,255,0.1);border:1px solid ${p.primaryColor};color:${p.secondaryColor === p.heroBgColor ? p.primaryColor : p.secondaryColor};font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtmlSafe(copy.hero.badge)}</div>`
      },
      style: { marginBottom: 14 }
    },
    makeHeading(
      copy.hero.headline,
      'h1',
      {
        fontSize: 40,
        fontWeight: 800,
        color: p.heroTextColor,
        textAlign: 'left',
        lineHeight: 1.15,
        marginBottom: 16
      },
      1
    ),
    makeParagraph(
      copy.hero.subheadline,
      {
        fontSize: 17,
        color: '#cbd5e1',
        textAlign: 'left',
        lineHeight: 1.6,
        marginBottom: 24
      },
      1
    ),
    makeButton(
      copy.hero.ctaText,
      primaryActionTarget,
      p.primaryColor,
      btnTextColor,
      copy.hero.ctaSubtext,
      'left',
      1
    )
  ];

  if (cleanWhatsapp) {
    heroElements.push({
      id: generateUniqueId('whatsapp'),
      type: 'whatsapp-button',
      column: 1,
      content: {
        text: 'Falar no WhatsApp Agora',
        phone: cleanWhatsapp,
        defaultMessage: `Olá! Tenho interesse em ${req.productName}.`,
        isFloating: false
      },
      style: {
        textAlign: 'left',
        marginTop: 4,
        marginBottom: 8
      },
      advanced: { deviceVisibility: 'all', trackingEvent: 'WhatsAppClick' }
    });
  }

  if (putFormInHero) {
    heroElements.push({
      id: generateUniqueId('form'),
      type: 'form',
      column: 2,
      content: {
        title: copy.formSection.title,
        subtitle: copy.formSection.subtitle,
        buttonText: copy.formSection.buttonText,
        buttonBg: p.primaryColor,
        buttonTextColor: btnTextColor,
        redirectUrl: '',
        fields: [
          { id: 'f-name', name: 'name', label: 'Nome Completo', placeholder: 'Digite seu nome...', type: 'text', required: true },
          { id: 'f-email', name: 'email', label: 'E-mail Principal', placeholder: 'seu.melhor@email.com', type: 'email', required: true },
          { id: 'f-phone', name: 'phone', label: 'WhatsApp com DDD', placeholder: '(11) 99999-9999', type: 'tel', required: true }
        ],
        lgpdText: 'Concordo em receber informações e aceito a Política de Privacidade.'
      },
      style: {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        paddingTop: 28,
        paddingBottom: 28,
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0'
      },
      advanced: { deviceVisibility: 'all', trackingEvent: 'Lead' }
    });
  } else {
    heroElements.push({
      id: generateUniqueId('image'),
      type: 'image',
      column: 2,
      content: {
        url: productPhoto,
        alt: req.productName
      },
      style: {
        width: '100%',
        borderRadius: 20,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        marginBottom: 0
      },
      advanced: { deviceVisibility: 'all' }
    });
  }

  sections.push({
    id: generateUniqueId('sec'),
    name: 'Hero Principal',
    fullWidth: false,
    style: {
      backgroundColor: p.heroBgColor,
      paddingTop: 64,
      paddingBottom: 72
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '2-col-equal',
        style: { paddingTop: 0, paddingBottom: 0, gap: 36 },
        elements: heroElements
      }
    ]
  });

  // 3. Trust Badges Strip
  sections.push({
    id: generateUniqueId('sec'),
    name: 'Selos de Confiança',
    fullWidth: false,
    style: {
      backgroundColor: p.surfaceColor,
      paddingTop: 24,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderColor: cardBorder
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '1-col',
        style: { paddingTop: 0, paddingBottom: 0, gap: 0 },
        elements: [
          {
            id: generateUniqueId('trust'),
            type: 'trust-badges',
            content: { items: copy.trustBadges.slice(0, 4) },
            style: { color: p.textColor, marginBottom: 0 }
          }
        ]
      }
    ]
  });

  // 4. Benefits Section (3-col grid)
  const benefitItems = copy.benefitsSection.items.slice(0, 6);
  const benefitCardsHtml = `
    <div id="beneficios" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
      ${benefitItems
        .map(
          (item) => `
          <div style="background:${cardBg};border:1px solid ${cardBorder};border-radius:18px;padding:24px;box-shadow:0 6px 16px -6px rgba(0,0,0,0.06);">
            <div style="width:44px;height:44px;border-radius:12px;background:${p.primaryColor}20;color:${p.primaryColor};display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px;">${escapeHtmlSafe(item.icon || '✨')}</div>
            <h3 style="font-size:17px;font-weight:800;color:${cardText};margin-bottom:8px;line-height:1.3;">${escapeHtmlSafe(item.title)}</h3>
            <p style="font-size:14px;color:${cardMuted};line-height:1.6;margin:0;">${escapeHtmlSafe(item.description)}</p>
          </div>`
        )
        .join('')}
    </div>
  `;

  sections.push({
    id: generateUniqueId('sec'),
    name: 'Benefícios & Diferenciais',
    fullWidth: false,
    style: {
      backgroundColor: p.backgroundColor,
      paddingTop: 72,
      paddingBottom: 72
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '1-col',
        style: { paddingTop: 0, paddingBottom: 0, gap: 16 },
        elements: [
          makeHeading(copy.benefitsSection.title, 'h2', {
            fontSize: 32,
            fontWeight: 800,
            color: p.textColor,
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 8
          }),
          makeParagraph(copy.benefitsSection.subtitle, {
            fontSize: 16,
            color: p.mutedTextColor,
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: 28
          }),
          {
            id: generateUniqueId('html-embed'),
            type: 'html-embed',
            content: { html: benefitCardsHtml },
            style: { width: '100%', marginBottom: 0 }
          }
        ]
      }
    ]
  });

  // 5. About Product / Expert Section
  const aboutElements: PageElement[] = [
    {
      id: generateUniqueId('image'),
      type: 'image',
      column: 1,
      content: {
        url: expertPhoto,
        alt: req.expertName || req.productName
      },
      style: {
        width: '100%',
        borderRadius: 20,
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.18)',
        marginBottom: 0
      }
    },
    {
      id: generateUniqueId('html-embed'),
      type: 'html-embed',
      column: 2,
      content: {
        html: `<div id="sobre" style="font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${p.primaryColor};">${escapeHtmlSafe(copy.aboutSection.eyebrow)}</div>`
      },
      style: { marginBottom: 8 }
    },
    makeHeading(
      copy.aboutSection.title,
      'h2',
      {
        fontSize: 30,
        fontWeight: 800,
        color: p.textColor,
        textAlign: 'left',
        lineHeight: 1.25,
        marginBottom: 14
      },
      2
    ),
    ...copy.aboutSection.paragraphs.map(para =>
      makeParagraph(
        para,
        {
          fontSize: 16,
          color: p.mutedTextColor,
          textAlign: 'left',
          lineHeight: 1.65,
          marginBottom: 14
        },
        2
      )
    ),
    makeButton(
      copy.aboutSection.ctaText,
      primaryActionTarget,
      p.primaryColor,
      btnTextColor,
      undefined,
      'left',
      2
    )
  ];

  sections.push({
    id: generateUniqueId('sec'),
    name: req.expertName ? 'Sobre o Especialista' : 'Sobre o Produto',
    fullWidth: false,
    style: {
      backgroundColor: p.surfaceColor,
      paddingTop: 72,
      paddingBottom: 72
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '2-col-equal',
        style: { paddingTop: 0, paddingBottom: 0, gap: 40 },
        elements: aboutElements
      }
    ]
  });

  // 6. Extra Product Photos Gallery (only if user uploaded extra photos)
  const validExtras = (req.extraPhotos || []).map(u => u.trim()).filter(Boolean).slice(0, 3);
  if (validExtras.length > 0) {
    const galleryLayout: PageContainerLayout =
      validExtras.length === 1 ? '1-col' : validExtras.length === 2 ? '2-col-equal' : '3-col';
    sections.push({
      id: generateUniqueId('sec'),
      name: 'Galeria do Produto',
      fullWidth: false,
      style: {
        backgroundColor: p.backgroundColor,
        paddingTop: 64,
        paddingBottom: 64
      },
      containers: [
        {
          id: generateUniqueId('cont'),
          layout: '1-col',
          style: { paddingTop: 0, paddingBottom: 16, gap: 8 },
          elements: [
            makeHeading(`Veja ${req.productName} em detalhes`, 'h2', {
              fontSize: 28,
              fontWeight: 800,
              color: p.textColor,
              textAlign: 'center',
              marginBottom: 20
            })
          ]
        },
        {
          id: generateUniqueId('cont'),
          layout: galleryLayout,
          style: { paddingTop: 0, paddingBottom: 0, gap: 20 },
          elements: validExtras.map((url, idx) => ({
            id: generateUniqueId('image'),
            type: 'image',
            column: idx + 1,
            content: { url, alt: `${req.productName} - Foto ${idx + 1}` },
            style: {
              width: '100%',
              borderRadius: 16,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
              marginBottom: 0
            }
          }))
        }
      ]
    });
  }

  // 7. Social Proof / Testimonials
  const testimonialAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  ];
  const testimonials = copy.testimonials.slice(0, 3);
  sections.push({
    id: generateUniqueId('sec'),
    name: 'Depoimentos & Prova Social',
    fullWidth: false,
    style: {
      backgroundColor: p.backgroundColor,
      paddingTop: 72,
      paddingBottom: 72
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '1-col',
        style: { paddingTop: 0, paddingBottom: 24, gap: 8 },
        elements: [
          makeHeading('Quem já experimentou aprova', 'h2', {
            fontSize: 32,
            fontWeight: 800,
            color: p.textColor,
            textAlign: 'center',
            marginBottom: 8
          }),
          makeParagraph(`Veja o impacto real de ${req.productName} na prática`, {
            fontSize: 16,
            color: p.mutedTextColor,
            textAlign: 'center',
            marginBottom: 12
          })
        ]
      },
      {
        id: generateUniqueId('cont'),
        layout: testimonials.length === 2 ? '2-col-equal' : '3-col',
        style: { paddingTop: 0, paddingBottom: 0, gap: 24 },
        elements: testimonials.map((t, idx) => ({
          id: generateUniqueId('testimonial'),
          type: 'testimonial',
          column: idx + 1,
          content: {
            quote: t.quote,
            author: t.author,
            role: t.role,
            rating: 5,
            avatar: testimonialAvatars[idx % testimonialAvatars.length]
          },
          style: {
            backgroundColor: cardBg,
            color: cardText,
            borderColor: cardBorder,
            borderWidth: 1,
            borderRadius: 18,
            paddingTop: 24,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
            marginBottom: 0
          }
        }))
      }
    ]
  });

  // 8. Pricing & Plans Section
  if (hasPricing && copy.pricingSection.plans.length > 0) {
    const plans = copy.pricingSection.plans.slice(0, 3);
    const pricingLayout: PageContainerLayout =
      plans.length === 1 ? '1-col' : plans.length === 2 ? '2-col-equal' : '3-col';

    const pricingHeaderEls: PageElement[] = [
      {
        id: generateUniqueId('html-embed'),
        type: 'html-embed',
        content: { html: '<div id="planos"></div>' },
        style: { marginBottom: 0 }
      },
      makeHeading(copy.pricingSection.title, 'h2', {
        fontSize: 32,
        fontWeight: 800,
        color: p.textColor,
        textAlign: 'center',
        marginBottom: 8
      }),
      makeParagraph(copy.pricingSection.subtitle, {
        fontSize: 16,
        color: p.mutedTextColor,
        textAlign: 'center',
        marginBottom: 20
      })
    ];

    if (req.includeCountdown) {
      pricingHeaderEls.push({
        id: generateUniqueId('countdown'),
        type: 'countdown',
        content: {
          label: copy.pricingSection.countdownLabel || '⚡ Oferta especial termina em:',
          targetHours: 24
        },
        style: {
          backgroundColor: p.heroBgColor,
          color: p.heroTextColor,
          paddingTop: 18,
          paddingBottom: 18,
          paddingLeft: 24,
          paddingRight: 24,
          borderRadius: 16,
          textAlign: 'center',
          marginBottom: 24
        }
      });
    }

    sections.push({
      id: generateUniqueId('sec'),
      name: 'Preços & Planos',
      fullWidth: false,
      style: {
        backgroundColor: p.surfaceColor,
        paddingTop: 72,
        paddingBottom: 80
      },
      containers: [
        {
          id: generateUniqueId('cont'),
          layout: '1-col',
          style: { paddingTop: 0, paddingBottom: 16, gap: 8 },
          elements: pricingHeaderEls
        },
        {
          id: generateUniqueId('cont'),
          layout: pricingLayout,
          style: { paddingTop: 0, paddingBottom: 0, gap: 24 },
          elements: plans.map((pl, idx) => {
            const isHighlighted = plans.length === 1 || Boolean(pl.badge) || (plans.length === 3 && idx === 1);
            return {
              id: generateUniqueId('pricing'),
              type: 'pricing-table',
              column: idx + 1,
              content: {
                badge: pl.badge || '',
                planName: pl.planName,
                description: pl.description,
                originalPrice: pl.originalPrice || '',
                price: pl.price,
                installments: pl.installments || '',
                features: pl.features,
                buttonText: pl.buttonText,
                checkoutUrl: pl.checkoutUrl || req.ctaUrl || '#cadastro',
                buttonBg: p.primaryColor,
                buttonTextColor: btnTextColor
              },
              style: {
                backgroundColor: cardBg,
                color: cardText,
                borderColor: isHighlighted ? p.primaryColor : cardBorder,
                borderWidth: isHighlighted ? 2 : 1,
                borderRadius: 22,
                paddingTop: 32,
                paddingBottom: 32,
                paddingLeft: 28,
                paddingRight: 28,
                textAlign: 'center',
                boxShadow: isHighlighted
                  ? '0 25px 40px -12px rgba(0, 0, 0, 0.16)'
                  : '0 8px 20px -6px rgba(0, 0, 0, 0.06)',
                marginBottom: 0
              },
              advanced: { deviceVisibility: 'all', trackingEvent: 'InitiateCheckout' }
            };
          })
        }
      ]
    });
  }

  // 9. Dedicated Lead Capture Form Section (if not already in hero)
  if (hasForm && !putFormInHero) {
    sections.push({
      id: generateUniqueId('sec'),
      name: 'Formulário de Cadastro',
      fullWidth: false,
      style: {
        backgroundColor: p.backgroundColor,
        paddingTop: 72,
        paddingBottom: 72
      },
      containers: [
        {
          id: generateUniqueId('cont'),
          layout: '2-col-equal',
          style: { paddingTop: 0, paddingBottom: 0, gap: 36 },
          elements: [
            {
              id: generateUniqueId('html-embed'),
              type: 'html-embed',
              column: 1,
              content: { html: '<div id="cadastro"></div>' },
              style: { marginBottom: 0 }
            },
            makeHeading(
              copy.formSection.title,
              'h2',
              {
                fontSize: 32,
                fontWeight: 800,
                color: p.textColor,
                textAlign: 'left',
                lineHeight: 1.2,
                marginBottom: 14
              },
              1
            ),
            makeParagraph(
              copy.formSection.subtitle,
              {
                fontSize: 16,
                color: p.mutedTextColor,
                textAlign: 'left',
                lineHeight: 1.6,
                marginBottom: 20
              },
              1
            ),
            {
              id: generateUniqueId('trust'),
              type: 'trust-badges',
              column: 1,
              content: { items: copy.trustBadges.slice(0, 2) },
              style: { color: p.textColor, textAlign: 'left', marginBottom: 0 }
            },
            {
              id: generateUniqueId('form'),
              type: 'form',
              column: 2,
              content: {
                title: 'Preencha seus dados',
                subtitle: 'Resposta rápida sem compromisso.',
                buttonText: copy.formSection.buttonText,
                buttonBg: p.primaryColor,
                buttonTextColor: btnTextColor,
                redirectUrl: '',
                fields: [
                  { id: 'f-name', name: 'name', label: 'Nome Completo', placeholder: 'Seu nome...', type: 'text', required: true },
                  { id: 'f-email', name: 'email', label: 'E-mail', placeholder: 'seu@email.com', type: 'email', required: true },
                  { id: 'f-phone', name: 'phone', label: 'WhatsApp', placeholder: '(11) 99999-9999', type: 'tel', required: true }
                ],
                lgpdText: 'Concordo com os termos de privacidade.'
              },
              style: {
                backgroundColor: '#ffffff',
                color: '#0f172a',
                paddingTop: 28,
                paddingBottom: 28,
                paddingLeft: 26,
                paddingRight: 26,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#e2e8f0'
              },
              advanced: { deviceVisibility: 'all', trackingEvent: 'Lead' }
            }
          ]
        }
      ]
    });
  }

  // 10. FAQ Section
  sections.push({
    id: generateUniqueId('sec'),
    name: 'Perguntas Frequentes (FAQ)',
    fullWidth: false,
    style: {
      backgroundColor: p.backgroundColor,
      paddingTop: 64,
      paddingBottom: 72
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '1-col',
        style: { paddingTop: 0, paddingBottom: 0, gap: 16 },
        elements: [
          {
            id: generateUniqueId('html-embed'),
            type: 'html-embed',
            content: { html: '<div id="faq"></div>' },
            style: { marginBottom: 0 }
          },
          {
            id: generateUniqueId('accordion'),
            type: 'accordion',
            content: {
              title: copy.faq.title,
              items: copy.faq.items
            },
            style: {
              backgroundColor: cardBg,
              color: cardText,
              borderColor: cardBorder,
              borderWidth: 1,
              borderRadius: 20,
              paddingTop: 28,
              paddingBottom: 28,
              paddingLeft: 28,
              paddingRight: 28,
              marginBottom: 0
            }
          }
        ]
      }
    ]
  });

  // 11. Final CTA + Footer Section
  const finalElements: PageElement[] = [
    makeHeading(copy.finalCta.headline, 'h2', {
      fontSize: 34,
      fontWeight: 800,
      color: p.heroTextColor,
      textAlign: 'center',
      lineHeight: 1.2,
      marginBottom: 12
    }),
    makeParagraph(copy.finalCta.subheadline, {
      fontSize: 17,
      color: '#cbd5e1',
      textAlign: 'center',
      lineHeight: 1.6,
      marginBottom: 26
    }),
    makeButton(
      copy.finalCta.ctaText,
      primaryActionTarget,
      p.primaryColor,
      btnTextColor,
      undefined,
      'center'
    ),
    {
      id: generateUniqueId('html-embed'),
      type: 'html-embed',
      content: {
        html: `
          <div style="margin-top:44px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:12px;color:#94a3b8;">
            <div style="display:flex;align-items:center;gap:8px;">
              ${req.logoUrl?.trim() ? `<img src="${req.logoUrl.trim()}" alt="" style="max-height:26px;width:auto;object-fit:contain;" />` : ''}
              <strong style="color:${p.heroTextColor};">${escapeHtmlSafe(req.productName)}</strong>
            </div>
            <div>© ${new Date().getFullYear()} ${escapeHtmlSafe(req.productName)}. Todos os direitos reservados.</div>
          </div>
        `
      },
      style: { width: '100%', marginBottom: 0 }
    }
  ];

  if (cleanWhatsapp) {
    finalElements.push({
      id: generateUniqueId('whatsapp'),
      type: 'whatsapp-button',
      content: {
        text: 'Dúvidas? Fale no WhatsApp',
        phone: cleanWhatsapp,
        defaultMessage: `Olá! Gostaria de saber mais sobre ${req.productName}.`,
        isFloating: true
      },
      style: { textAlign: 'right', marginBottom: 0 },
      advanced: { deviceVisibility: 'all', trackingEvent: 'WhatsAppClick' }
    });
  }

  sections.push({
    id: generateUniqueId('sec'),
    name: 'Chamada Final & Rodapé',
    fullWidth: false,
    style: {
      backgroundColor: p.heroBgColor,
      paddingTop: 72,
      paddingBottom: 40
    },
    containers: [
      {
        id: generateUniqueId('cont'),
        layout: '1-col',
        style: { paddingTop: 0, paddingBottom: 0, gap: 12 },
        elements: finalElements
      }
    ]
  });

  const slug = copy.slug ? `${copy.slug.replace(/[^a-z0-9-]/g, '')}-${Date.now().toString(36).slice(-3)}` : slugify(req.productName);
  const now = new Date().toISOString();

  return {
    id: generateUniqueId('page'),
    name: `${req.productName} (Criada com IA)`,
    slug,
    category: req.objective || 'sales',
    status: 'draft',
    folder: req.folder || 'Geral',
    publishedUrl: `/p/${slug}`,
    thumbnailData: req.productPhotoUrl?.trim() || req.expertPhotoUrl?.trim() || req.logoUrl?.trim() || productPhoto,
    seo: {
      metaTitle: copy.seo.metaTitle || `${req.productName} | Página Oficial`,
      metaDescription: copy.seo.metaDescription || copy.hero.subheadline,
      ogTitle: copy.seo.metaTitle || req.productName,
      ogDescription: copy.seo.metaDescription || copy.hero.subheadline,
      ogImage: req.productPhotoUrl?.trim() || req.expertPhotoUrl?.trim() || undefined,
      favicon: req.logoUrl?.trim() || undefined
    },
    tracking: {
      metaPixelEvents: ['PageView']
    },
    globalSettings: {
      primaryColor: p.primaryColor,
      secondaryColor: p.secondaryColor,
      fontFamily: 'Inter, sans-serif',
      textColor: p.textColor,
      backgroundColor: p.backgroundColor,
      maxWidth: 1140,
      containerPadding: 24
    },
    sections,
    version: 1,
    viewsCount: 0,
    conversionsCount: 0,
    createdAt: now,
    updatedAt: now
  };
}

export async function generateAiPageDocument(
  req: AiPageBriefingRequest
): Promise<{ page: PageDocument; aiMode: 'gemini' | 'openai' | 'smart-engine'; warning?: string }> {
  const provider = req.aiConfig?.provider || 'auto';
  const userKey = req.aiConfig?.apiKey?.trim();
  const envGeminiKey = process.env.GEMINI_API_KEY?.trim();
  const envOpenAiKey = process.env.OPENAI_API_KEY?.trim();

  let copy: AiGeneratedCopy | null = null;
  let aiMode: 'gemini' | 'openai' | 'smart-engine' = 'smart-engine';
  let warning: string | undefined;

  if (provider === 'gemini' || (provider === 'auto' && (userKey?.startsWith('AIza') || (!userKey && envGeminiKey)))) {
    const keyToUse = userKey || envGeminiKey;
    if (!keyToUse) {
      throw new Error('Chave API do Gemini não informada.');
    }
    try {
      copy = await callGeminiApi(req, keyToUse);
      aiMode = 'gemini';
    } catch (err: any) {
      if (provider === 'gemini' && userKey) {
        throw err;
      }
      warning = `Fallback para motor inteligente local (${err.message})`;
    }
  } else if (provider === 'openai' || (provider === 'auto' && (userKey?.startsWith('sk-') || (!userKey && envOpenAiKey)))) {
    const keyToUse = userKey || envOpenAiKey;
    if (!keyToUse) {
      throw new Error('Chave API da OpenAI não informada.');
    }
    try {
      copy = await callOpenAiApi(req, keyToUse);
      aiMode = 'openai';
    } catch (err: any) {
      if (provider === 'openai' && userKey) {
        throw err;
      }
      warning = `Fallback para motor inteligente local (${err.message})`;
    }
  }

  if (!copy) {
    copy = generateSmartFallbackCopy(req);
    aiMode = 'smart-engine';
  }

  // Always preserve user's exact plan prices, names, features & checkout URLs when supplied
  const mergedCopy = mergeUserPlansIntoCopy(copy, req.plans, req.ctaUrl);
  const page = assemblePageDocument(req, mergedCopy);

  return { page, aiMode, warning };
}
