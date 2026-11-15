import { 
  PageDocument, 
  PageSection, 
  PageContainer, 
  PageElement, 
  PageElementType, 
  PageCategoryType, 
  PageContainerLayout 
} from '../types/page';

export const PAGE_CATEGORIES: { id: PageCategoryType | 'all'; label: string; description: string; icon: string }[] = [
  { id: 'all', label: 'Todos os Modelos', description: 'Explore todas as páginas profissionais', icon: 'grid' },
  { id: 'lead-capture', label: 'Captura de Leads', description: 'Gere listas qualificadas com iscas digitais', icon: 'target' },
  { id: 'sales', label: 'Página de Vendas', description: 'Apresente produtos e converta com alta persuasão', icon: 'shopping-bag' },
  { id: 'webinar', label: 'Webinar & Aulas', description: 'Inscrições para transmissões ao vivo e masterclasses', icon: 'video' },
  { id: 'registration', label: 'Inscrição & Eventos', description: 'Capte participantes para workshops e congressos', icon: 'calendar' },
  { id: 'thank-you', label: 'Página de Obrigado', description: 'Confirmação com instruções e link de WhatsApp VIP', icon: 'check-circle' },
  { id: 'upsell', label: 'Upsell & Oferta Única', description: 'Maximize o ticket médio logo após a compra', icon: 'trending-up' },
  { id: 'downsell', label: 'Downsell', description: 'Alternativa com condição facilitada para recuperação', icon: 'percent' },
  { id: 'launch', label: 'Lançamento', description: 'Páginas em fases para lançamentos meteorológicos ou semente', icon: 'rocket' },
  { id: 'digital-product', label: 'Produto Digital', description: 'E-books, cursos online e mentorias', icon: 'book-open' },
  { id: 'ecommerce', label: 'E-commerce', description: 'Showcases de catálogo físico e moda', icon: 'package' },
  { id: 'services', label: 'Serviços & Consultoria', description: 'Apresentação de soluções B2B e orçamentos', icon: 'briefcase' },
  { id: 'institutional', label: 'Institucional', description: 'Presença corporativa oficial de alto padrão', icon: 'building' },
  { id: 'booking', label: 'Agendamento', description: 'Marcação de reuniões e consultas diretas', icon: 'clock' },
  { id: 'blank', label: 'Página em Branco', description: 'Comece do zero com liberdade total de blocos', icon: 'plus-square' }
];

export const generateUniqueId = (prefix = 'el'): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
};

export const createNewPageElement = (type: PageElementType): PageElement => {
  const id = generateUniqueId(type);

  switch (type) {
    case 'heading':
      return {
        id,
        type: 'heading',
        content: {
          text: 'O Título Principal Que Converte Seus Visitantes',
          tag: 'h1'
        },
        style: {
          fontSize: 38,
          fontWeight: 800,
          color: '#0f172a',
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: 16
        },
        advanced: { deviceVisibility: 'all', animation: 'none' }
      };

    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        content: {
          text: 'Apresente sua proposta única de valor com clareza. Destaque como sua solução resolve a principal dor do seu cliente de forma rápida e segura.'
        },
        style: {
          fontSize: 18,
          color: '#475569',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: 24
        },
        advanced: { deviceVisibility: 'all', animation: 'none' }
      };

    case 'button':
      return {
        id,
        type: 'button',
        content: {
          text: 'Garantir Minha Vaga Agora →',
          url: '#',
          target: '_self',
          subtext: 'Acesso imediato • 100% seguro'
        },
        style: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 700,
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: 12,
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
          hoverBackgroundColor: '#4f46e5'
        },
        advanced: { deviceVisibility: 'all', trackingEvent: 'InitiateCheckout' }
      };

    case 'whatsapp-button':
      return {
        id,
        type: 'whatsapp-button',
        content: {
          text: 'Falar no WhatsApp com Consultor',
          phone: '5511999999999',
          defaultMessage: 'Olá! Gostaria de mais informações sobre o produto.',
          isFloating: false
        },
        style: {
          backgroundColor: '#25D366',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 700,
          paddingTop: 14,
          paddingBottom: 14,
          paddingLeft: 28,
          paddingRight: 28,
          borderRadius: 9999,
          textAlign: 'center',
          boxShadow: '0 8px 20px -4px rgba(37, 211, 102, 0.4)'
        },
        advanced: { deviceVisibility: 'all', trackingEvent: 'WhatsAppClick' }
      };

    case 'image':
      return {
        id,
        type: 'image',
        content: {
          url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80',
          alt: 'Imagem ilustrativa de alta conversão',
          link: ''
        },
        style: {
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          marginBottom: 16
        },
        advanced: { deviceVisibility: 'all' }
      };

    case 'video':
      return {
        id,
        type: 'video',
        content: {
          provider: 'youtube', // 'youtube' | 'vimeo' | 'mp4'
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          embedId: 'dQw4w9WgXcQ',
          aspectRatio: '16:9',
          autoplay: false
        },
        style: {
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          marginBottom: 20
        },
        advanced: { deviceVisibility: 'all' }
      };

    case 'form':
      return {
        id,
        type: 'form',
        content: {
          title: 'Preencha seus dados para ter acesso imediato',
          subtitle: 'Enviaremos o material exclusivo diretamente no seu e-mail.',
          buttonText: 'Quero Receber Agora',
          redirectUrl: '/obrigado',
          fields: [
            { id: 'f-name', name: 'name', label: 'Nome Completo', placeholder: 'Digite seu nome...', type: 'text', required: true },
            { id: 'f-email', name: 'email', label: 'E-mail Principal', placeholder: 'seu.melhor@email.com', type: 'email', required: true },
            { id: 'f-phone', name: 'phone', label: 'WhatsApp com DDD', placeholder: '(11) 99999-9999', type: 'tel', required: true }
          ],
          lgpdText: 'Concordo em receber comunicações e aceito os Termos de Privacidade.'
        },
        style: {
          backgroundColor: '#ffffff',
          paddingTop: 32,
          paddingBottom: 32,
          paddingLeft: 28,
          paddingRight: 28,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)'
        },
        advanced: { deviceVisibility: 'all', trackingEvent: 'Lead' }
      };

    case 'countdown':
      return {
        id,
        type: 'countdown',
        content: {
          label: '⚡ Esta condição especial se encerra em:',
          targetHours: 24,
          daysLabel: 'Dias',
          hoursLabel: 'Horas',
          minutesLabel: 'Min',
          secondsLabel: 'Seg'
        },
        style: {
          backgroundColor: '#f8fafc',
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 20,
          paddingRight: 20,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#cbd5e1',
          textAlign: 'center',
          color: '#0f172a',
          marginBottom: 20
        },
        advanced: { deviceVisibility: 'all' }
      };

    case 'pricing-table':
      return {
        id,
        type: 'pricing-table',
        content: {
          badge: 'MAIS ESCOLHIDO',
          planName: 'Acesso Completo Pro',
          description: 'Ideal para quem busca resultados imediatos com suporte VIP',
          originalPrice: 'R$ 997,00',
          price: 'R$ 497,00',
          installments: 'ou 12x de R$ 49,60',
          features: [
            'Acesso vitalício à plataforma',
            'Mais de 50 templates prontos',
            'Suporte prioritário via WhatsApp',
            'Garantia incondicional de 7 dias',
            'Bônus: Masterclass de Tráfego Pago'
          ],
          buttonText: 'Quero Garantir Esta Oferta →',
          checkoutUrl: '#'
        },
        style: {
          backgroundColor: '#ffffff',
          paddingTop: 36,
          paddingBottom: 36,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#6366f1',
          boxShadow: '0 25px 35px -5px rgba(99, 102, 241, 0.15)',
          textAlign: 'center'
        },
        advanced: { deviceVisibility: 'all', trackingEvent: 'InitiateCheckout' }
      };

    case 'accordion':
      return {
        id,
        type: 'accordion',
        content: {
          title: 'Perguntas Frequentes (FAQ)',
          items: [
            {
              question: 'Como recebo o acesso após a confirmação?',
              answer: 'O envio é imediato via e-mail e WhatsApp assim que o pagamento for aprovado.'
            },
            {
              question: 'E se eu não gostar ou não for o que eu esperava?',
              answer: 'Você conta com 7 dias de garantia incondicional. Basta solicitar o reembolso com 1 clique.'
            },
            {
              question: 'Preciso ter conhecimentos prévios ou programar?',
              answer: 'Não! O método e as ferramentas foram pensadas para quem está começando do absoluto zero.'
            }
          ]
        },
        style: {
          backgroundColor: '#ffffff',
          borderRadius: 16,
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 24,
          paddingRight: 24,
          borderWidth: 1,
          borderColor: '#e2e8f0'
        },
        advanced: { deviceVisibility: 'all' }
      };

    case 'testimonial':
      return {
        id,
        type: 'testimonial',
        content: {
          quote: '"Triplicamos a taxa de conversão da nossa página em menos de 10 dias de uso. A facilidade para ajustar no mobile é sem comparação."',
          author: 'Mariana Duarte',
          role: 'Head de Growth • EduTech Brasil',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          rating: 5
        },
        style: {
          backgroundColor: '#f8fafc',
          paddingTop: 28,
          paddingBottom: 28,
          paddingLeft: 24,
          paddingRight: 24,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        },
        advanced: { deviceVisibility: 'all' }
      };

    case 'trust-badges':
      return {
        id,
        type: 'trust-badges',
        content: {
          items: [
            { title: 'Garantia Blindada', desc: '7 dias incondicionais', icon: 'shield-check' },
            { title: 'Pagamento Seguro', desc: 'Criptografia 256 bits', icon: 'lock' },
            { title: 'Acesso Imediato', desc: 'Liberação instantânea', icon: 'zap' }
          ]
        },
        style: {
          backgroundColor: 'transparent',
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 8,
          paddingRight: 8
        },
        advanced: { deviceVisibility: 'all' }
      };

    case 'spacer':
      return {
        id,
        type: 'spacer',
        content: { height: 48 },
        style: { height: 48 },
        advanced: { deviceVisibility: 'all' }
      };

    case 'divider':
      return {
        id,
        type: 'divider',
        content: { lineStyle: 'solid', thickness: 1 },
        style: {
          borderColor: '#e2e8f0',
          borderWidth: 1,
          marginTop: 24,
          marginBottom: 24
        },
        advanced: { deviceVisibility: 'all' }
      };

    case 'html-embed':
      return {
        id,
        type: 'html-embed',
        content: {
          html: '<div style="padding: 20px; background: #e0e7ff; border-radius: 8px; text-align: center; color: #3730a3; font-weight: bold;">⚡ Embed HTML / Widget Customizado</div>'
        },
        style: {
          width: '100%'
        },
        advanced: { deviceVisibility: 'all' }
      };

    default:
      return {
        id,
        type: 'paragraph',
        content: { text: 'Novo bloco de conteúdo' },
        style: { fontSize: 16, color: '#334155' },
        advanced: { deviceVisibility: 'all' }
      };
  }
};

export const createNewContainer = (layout: PageContainerLayout = '1-col'): PageContainer => {
  return {
    id: generateUniqueId('cont'),
    layout,
    style: {
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 16,
      gap: 24
    },
    elements: []
  };
};

export const createNewSection = (name = 'Nova Seção', fullWidth = false): PageSection => {
  const container = createNewContainer('1-col');
  return {
    id: generateUniqueId('sec'),
    name,
    fullWidth,
    style: {
      backgroundColor: '#ffffff',
      paddingTop: 64,
      paddingBottom: 64,
      paddingLeft: 24,
      paddingRight: 24
    },
    containers: [container]
  };
};

export const createBlankPageDocument = (
  name = 'Nova Landing Page', 
  category: PageCategoryType = 'blank'
): PageDocument => {
  const defaultSlug = `pagina-${Date.now().toString(36)}`;
  
  // Hero section
  const heroSec = createNewSection('Seção Principal (Hero)', false);
  const heroHeading = createNewPageElement('heading');
  heroHeading.content.text = 'Sua Oferta Irresistível Começa Aqui';
  
  const heroPara = createNewPageElement('paragraph');
  heroPara.content.text = 'Explique em poucas frases o benefício transformador do seu produto ou serviço para o cliente.';
  
  const heroBtn = createNewPageElement('button');
  
  heroSec.containers[0].elements = [heroHeading, heroPara, heroBtn];

  return {
    id: generateUniqueId('page'),
    name,
    slug: defaultSlug,
    category,
    status: 'draft',
    folder: 'Geral',
    publishedUrl: `/p/${defaultSlug}`,
    seo: {
      metaTitle: `${name} | vierstudio`,
      metaDescription: 'Acesse esta página exclusiva construída no Vier Studio.',
      ogTitle: name,
      ogDescription: 'Acesse esta página exclusiva construída no Vier Studio.'
    },
    tracking: {
      metaPixelEvents: ['PageView']
    },
    globalSettings: {
      primaryColor: '#6366f1',
      secondaryColor: '#ec4899',
      fontFamily: 'Inter, sans-serif',
      textColor: '#0f172a',
      backgroundColor: '#ffffff',
      maxWidth: 1140,
      containerPadding: 24
    },
    sections: [heroSec],
    version: 1,
    viewsCount: 0,
    conversionsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
