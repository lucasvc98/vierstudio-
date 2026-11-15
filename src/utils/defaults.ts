import { EmailBlock, EmailBlockType, EmailRow, EmailDocument } from '../types/email';

export function createNewBlock(type: EmailBlockType): EmailBlock {
  const id = `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  switch (type) {
    case 'heading':
      return {
        id,
        type: 'heading',
        content: { text: 'Título em Destaque', level: 'h2' },
        style: { fontSize: 24, fontWeight: 700, textAlign: 'left', marginTop: 4, marginBottom: 8 },
        deviceVisibility: 'all'
      };

    case 'text':
      return {
        id,
        type: 'text',
        content: { html: 'Escreva sua mensagem aqui para se comunicar diretamente com seu cliente com clareza e autoridade.' },
        style: { fontSize: 15, lineHeight: 1.6, textAlign: 'left', marginTop: 4, marginBottom: 12 },
        deviceVisibility: 'all'
      };

    case 'button':
      return {
        id,
        type: 'button',
        content: { text: 'Clique Aqui', url: 'https://seusite.com.br', fullWidth: false },
        style: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          fontSize: 15,
          fontWeight: 600,
          borderRadius: 6,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 24,
          paddingRight: 24,
          textAlign: 'center',
          marginTop: 8,
          marginBottom: 8
        },
        deviceVisibility: 'all'
      };

    case 'image':
      return {
        id,
        type: 'image',
        content: {
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
          alt: 'Imagem ilustrativa',
          link: '',
          width: '100%'
        },
        style: { borderRadius: 8, textAlign: 'center', marginTop: 6, marginBottom: 12 },
        deviceVisibility: 'all'
      };

    case 'logo':
      return {
        id,
        type: 'logo',
        content: {
          url: '/logo.png',
          alt: 'Logotipo vierstudio',
          link: '#',
          width: 80
        },
        style: { textAlign: 'left', marginTop: 4, marginBottom: 8 },
        deviceVisibility: 'all'
      };

    case 'divider':
      return {
        id,
        type: 'divider',
        content: {},
        style: { borderColor: '#e2e8f0', borderWidth: 1, borderStyle: 'solid', marginTop: 12, marginBottom: 12 },
        deviceVisibility: 'all'
      };

    case 'spacer':
      return {
        id,
        type: 'spacer',
        content: {},
        style: { height: 24 },
        deviceVisibility: 'all'
      };

    case 'social':
      return {
        id,
        type: 'social',
        content: {
          items: [
            { platform: 'instagram', url: 'https://instagram.com' },
            { platform: 'facebook', url: 'https://facebook.com' },
            { platform: 'linkedin', url: 'https://linkedin.com' },
            { platform: 'whatsapp', url: 'https://whatsapp.com' }
          ]
        },
        style: { textAlign: 'center', marginTop: 12, marginBottom: 12 },
        deviceVisibility: 'all'
      };

    case 'video':
      return {
        id,
        type: 'video',
        content: {
          thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://youtube.com',
          title: 'Assistir ao vídeo de demonstração'
        },
        style: { textAlign: 'center', marginTop: 12, marginBottom: 12 },
        deviceVisibility: 'all'
      };

    case 'coupon':
      return {
        id,
        type: 'coupon',
        content: {
          code: '{{cupom}}',
          discount: '25% DE DESCONTO',
          description: 'Aproveite esta condição exclusiva válida por tempo limitado.'
        },
        style: { backgroundColor: '#f5f3ff', borderColor: '#8b5cf6' },
        deviceVisibility: 'all'
      };

    case 'product':
      return {
        id,
        type: 'product',
        content: {
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
          title: 'Produto em Destaque',
          oldPrice: 'R$ 399,00',
          price: 'R$ 199,00',
          buttonText: 'Garantir Oferta',
          buttonUrl: '#'
        },
        style: {},
        deviceVisibility: 'all'
      };

    case 'nav':
      return {
        id,
        type: 'nav',
        content: {
          links: [
            { label: 'Início', url: '#' },
            { label: 'Coleção', url: '#' },
            { label: 'Promoções', url: '#' },
            { label: 'Contato', url: '#' }
          ]
        },
        style: { textAlign: 'center', marginTop: 8, marginBottom: 8 },
        deviceVisibility: 'all'
      };

    case 'hero':
      return {
        id,
        type: 'hero',
        content: {
          imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80',
          title: 'Novidades Exclusivas para Você',
          subtitle: 'Confira as últimas atualizações preparadas especialmente para nossa comunidade.',
          ctaText: 'Acessar Agora',
          ctaUrl: '#'
        },
        style: {},
        deviceVisibility: 'all'
      };

    case 'footer':
      return {
        id,
        type: 'footer',
        content: {
          companyName: 'vierstudio Inc.',
          address: 'Av. Paulista, 1000 - São Paulo, SP',
          unsubscribeUrl: '{{unsubscribe_link}}'
        },
        style: {},
        deviceVisibility: 'all'
      };

    case 'signature':
      return {
        id,
        type: 'signature',
        content: {
          name: 'Lucas Silveira',
          role: 'Head de Operações',
          company: 'vierstudio SaaS',
          phone: '+55 (11) 98765-4321',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        },
        style: {},
        deviceVisibility: 'all'
      };

    case 'html':
      return {
        id,
        type: 'html',
        content: { code: '<div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; font-family: sans-serif; font-size: 13px; color: #475569;">Bloco HTML Customizado</div>' },
        style: {},
        deviceVisibility: 'all'
      };

    default:
      return {
        id,
        type: 'text',
        content: { html: 'Novo bloco' },
        style: {},
        deviceVisibility: 'all'
      };
  }
}

export function createProductShowcaseRow(columnsCount: number = 3): EmailRow {
  const rowId = `row-showcase-${Date.now()}`;
  let layout: EmailRow['layout'] = '3-col';
  if (columnsCount === 1) layout = '1-col';
  else if (columnsCount === 2) layout = '2-col-equal';
  else if (columnsCount === 4) layout = '4-col';

  const widthPct = Math.round((100 / columnsCount) * 1000) / 1000;

  const sampleProducts = [
    {
      title: 'CAMISETAS',
      desc: 'Versatilidade com acabamento premium.',
      img: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_9997-66be88d6a98713955c17879257591779-640-0.webp'
    },
    {
      title: 'LOAFERS',
      desc: 'Elegância e conforto em cada passo.',
      img: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_9345-aa0c59bde831b0659d17875312406767-640-0.webp'
    },
    {
      title: 'COLETES',
      desc: 'Camadas marcantes para composições premium.',
      img: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_2599-359b4eb742e7340b4117816300103197-640-0.webp'
    },
    {
      title: 'ACESSÓRIOS',
      desc: 'Detalhes que definem presença e estilo.',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const columns = Array.from({ length: columnsCount }).map((_, idx) => {
    const p = sampleProducts[idx % sampleProducts.length];
    const colId = `col-${rowId}-${idx}`;
    return {
      id: colId,
      widthPercentage: widthPct,
      style: {
        backgroundColor: '#f5f5f5',
        paddingTop: 0,
        paddingBottom: 20,
        paddingLeft: 12,
        paddingRight: 12
      },
      blocks: [
        {
          id: `blk-img-${colId}`,
          type: 'image' as const,
          content: {
            url: p.img,
            alt: p.title,
            link: '#',
            width: '100%'
          },
          style: { borderRadius: 0, marginTop: 0, marginBottom: 18 },
          deviceVisibility: 'all' as const
        },
        {
          id: `blk-title-${colId}`,
          type: 'heading' as const,
          content: { text: p.title, level: 'h3' },
          style: {
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 17,
            lineHeight: 1.25,
            fontWeight: 700,
            color: '#111111',
            textAlign: 'center' as const,
            marginTop: 0,
            marginBottom: 7
          },
          deviceVisibility: 'all' as const
        },
        {
          id: `blk-desc-${colId}`,
          type: 'text' as const,
          content: { html: p.desc, text: p.desc },
          style: {
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 13,
            lineHeight: 1.45,
            color: '#666666',
            textAlign: 'center' as const,
            marginTop: 0,
            marginBottom: 15
          },
          deviceVisibility: 'all' as const
        },
        {
          id: `blk-cta-${colId}`,
          type: 'text' as const,
          content: {
            html: '<div style="text-align: center;"><a href="#" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; font-weight: 800; letter-spacing: 1px; color: #111111; text-decoration: none; border-bottom: 2px solid #b88a2a; padding-bottom: 4px; display: inline-block;">VER MODELOS</a></div>',
            text: 'VER MODELOS'
          },
          style: { textAlign: 'center' as const, marginTop: 0, marginBottom: 0 },
          deviceVisibility: 'all' as const
        }
      ]
    };
  });

  return {
    id: rowId,
    layout,
    style: {
      backgroundColor: '#ffffff',
      paddingTop: 16,
      paddingBottom: 24,
      paddingLeft: 12,
      paddingRight: 12
    },
    columns
  };
}

export function createNewRow(layout: EmailRow['layout']): EmailRow {
  const rowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  let columnsCount = 1;
  let percentages: number[] = [100];

  switch (layout) {
    case '1-col':
      columnsCount = 1;
      percentages = [100];
      break;
    case '2-col-equal':
      columnsCount = 2;
      percentages = [50, 50];
      break;
    case '2-col-30-70':
      columnsCount = 2;
      percentages = [30, 70];
      break;
    case '2-col-70-30':
      columnsCount = 2;
      percentages = [70, 30];
      break;
    case '3-col':
      columnsCount = 3;
      percentages = [33.33, 33.33, 33.34];
      break;
    case '4-col':
      columnsCount = 4;
      percentages = [25, 25, 25, 25];
      break;
  }

  const columns = Array.from({ length: columnsCount }).map((_, idx) => ({
    id: `col-${rowId}-${idx}`,
    widthPercentage: percentages[idx],
    style: {
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
      verticalAlign: 'top' as const
    },
    blocks: []
  }));

  return {
    id: rowId,
    layout,
    style: {
      backgroundColor: '#ffffff',
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 24,
      paddingRight: 24
    },
    columns
  };
}

export function createBlankDocument(name = 'Novo E-mail Sem Título'): EmailDocument {
  const blankDoc: EmailDocument = {
    id: `doc-${Date.now()}`,
    name,
    subject: 'Assunto do E-mail Atraente',
    preheader: 'Texto de pré-visualização que instiga o clique...',
    globalSettings: {
      containerWidth: 600,
      bodyBgColor: '#f1f5f9',
      contentBgColor: '#ffffff',
      defaultFontFamily: 'Arial, Helvetica, sans-serif',
      defaultTextColor: '#334155',
      defaultHeadingColor: '#0f172a',
      defaultLinkColor: '#6366f1',
      defaultButtonBg: '#6366f1',
      defaultButtonTextColor: '#ffffff',
      defaultButtonRadius: 6,
      containerBorderWidth: 1,
      containerBorderColor: '#e2e8f0',
      containerRadius: 8,
      sectionSpacing: 16
    },
    rows: [
      {
        id: `row-${Date.now()}-1`,
        layout: '1-col',
        style: { backgroundColor: '#ffffff', paddingTop: 24, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
        columns: [
          {
            id: `col-${Date.now()}-1`,
            widthPercentage: 100,
            style: {},
            blocks: [
              createNewBlock('logo')
            ]
          }
        ]
      },
      {
        id: `row-${Date.now()}-2`,
        layout: '1-col',
        style: { backgroundColor: '#ffffff', paddingTop: 16, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 },
        columns: [
          {
            id: `col-${Date.now()}-2`,
            widthPercentage: 100,
            style: {},
            blocks: [
              createNewBlock('heading'),
              createNewBlock('text'),
              createNewBlock('button')
            ]
          }
        ]
      },
      {
        id: `row-${Date.now()}-3`,
        layout: '1-col',
        style: { backgroundColor: '#f8fafc', paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 },
        columns: [
          {
            id: `col-${Date.now()}-3`,
            widthPercentage: 100,
            style: {},
            blocks: [
              createNewBlock('footer')
            ]
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft'
  };

  return blankDoc;
}
