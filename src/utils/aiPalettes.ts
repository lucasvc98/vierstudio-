import { AiColorPaletteInput, PageCategoryType } from '../types/page';

export const AI_COLOR_PALETTES: AiColorPaletteInput[] = [
  {
    id: 'indigo-modern',
    name: 'Índigo Moderno',
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#0f172a',
    mutedTextColor: '#475569',
    heroBgColor: '#0f172a',
    heroTextColor: '#ffffff',
    isDark: false
  },
  {
    id: 'emerald-luxury',
    name: 'Esmeralda & Verde',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    backgroundColor: '#ffffff',
    surfaceColor: '#ecfdf5',
    textColor: '#064e3b',
    mutedTextColor: '#334155',
    heroBgColor: '#022c22',
    heroTextColor: '#ffffff',
    isDark: false
  },
  {
    id: 'black-gold',
    name: 'Black & Gold (Alto Ticket)',
    primaryColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    backgroundColor: '#09090b',
    surfaceColor: '#18181b',
    textColor: '#f8fafc',
    mutedTextColor: '#a1a1aa',
    heroBgColor: '#09090b',
    heroTextColor: '#ffffff',
    isDark: true
  },
  {
    id: 'corporate-blue',
    name: 'Azul Corporativo',
    primaryColor: '#2563eb',
    secondaryColor: '#0ea5e9',
    backgroundColor: '#ffffff',
    surfaceColor: '#f1f5f9',
    textColor: '#0f172a',
    mutedTextColor: '#475569',
    heroBgColor: '#0f172a',
    heroTextColor: '#ffffff',
    isDark: false
  },
  {
    id: 'rose-aesthetic',
    name: 'Rosé & Estética',
    primaryColor: '#e11d48',
    secondaryColor: '#fb7185',
    backgroundColor: '#ffffff',
    surfaceColor: '#fff1f2',
    textColor: '#1e293b',
    mutedTextColor: '#64748b',
    heroBgColor: '#4c0519',
    heroTextColor: '#ffffff',
    isDark: false
  },
  {
    id: 'orange-energy',
    name: 'Laranja Conversão',
    primaryColor: '#ea580c',
    secondaryColor: '#f97316',
    backgroundColor: '#ffffff',
    surfaceColor: '#fff7ed',
    textColor: '#1c1917',
    mutedTextColor: '#57534e',
    heroBgColor: '#1c1917',
    heroTextColor: '#ffffff',
    isDark: false
  }
];

export const AI_OBJECTIVE_OPTIONS: {
  id: PageCategoryType;
  label: string;
  shortDesc: string;
  defaultPricing: boolean;
  defaultForm: boolean;
}[] = [
  {
    id: 'sales',
    label: 'Página de Vendas',
    shortDesc: 'Apresentar oferta completa, planos e converter no checkout',
    defaultPricing: true,
    defaultForm: false
  },
  {
    id: 'lead-capture',
    label: 'Captura de Leads',
    shortDesc: 'Capturar contatos qualificados com formulário de cadastro',
    defaultPricing: false,
    defaultForm: true
  },
  {
    id: 'digital-product',
    label: 'Curso / Produto Digital',
    shortDesc: 'Vender mentorias, cursos online, e-books ou comunidades',
    defaultPricing: true,
    defaultForm: false
  },
  {
    id: 'services',
    label: 'Serviços & Consultoria',
    shortDesc: 'Apresentar empresa, autoridade e gerar pedidos de orçamento',
    defaultPricing: true,
    defaultForm: true
  },
  {
    id: 'launch',
    label: 'Lançamento / Lista VIP',
    shortDesc: 'Aquecer audiência para abertura de carrinho ou evento',
    defaultPricing: false,
    defaultForm: true
  },
  {
    id: 'webinar',
    label: 'Webinar & Aula Ao Vivo',
    shortDesc: 'Inscrição para masterclass, workshop ou aula gratuita',
    defaultPricing: false,
    defaultForm: true
  },
  {
    id: 'ecommerce',
    label: 'Produto Físico / E-commerce',
    shortDesc: 'Showcase de produto físico com fotos, kits e preços',
    defaultPricing: true,
    defaultForm: false
  },
  {
    id: 'booking',
    label: 'Agendamento / Clínica',
    shortDesc: 'Marcar consultas, avaliações ou reuniões pelo formulário/WhatsApp',
    defaultPricing: false,
    defaultForm: true
  }
];

export const AI_TONE_OPTIONS = [
  'Persuasivo & Direto (Foco em Conversão)',
  'Sofisticado & Premium (Alto Valor)',
  'Acolhedor & Consultivo (Empático)',
  'Moderno & Tech (Startup / SaaS)',
  'Urgência & Lançamento (Escassez)'
];
