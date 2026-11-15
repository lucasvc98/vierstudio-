import { BoardDocument, BoardTemplateModel, BoardItem, BoardConnection } from '../types/board';

export const MIRO_STICKY_COLORS = [
  { id: 'yellow-light', bg: '#fff9b1', border: '#fef08a', text: '#713f12', label: 'Amarelo Claro' },
  { id: 'yellow-gold', bg: '#fef08a', border: '#fde047', text: '#713f12', label: 'Amarelo' },
  { id: 'orange', bg: '#fed7aa', border: '#fdba74', text: '#7c2d12', label: 'Laranja' },
  { id: 'coral', bg: '#fecdd3', border: '#fda4af', text: '#881337', label: 'Coral' },
  { id: 'pink', bg: '#fbcfe8', border: '#f472b6', text: '#831843', label: 'Rosa' },
  { id: 'magenta', bg: '#f472b6', border: '#ec4899', text: '#ffffff', label: 'Magenta' },
  { id: 'blue-light', bg: '#bae6fd', border: '#7dd3fc', text: '#0c4a6e', label: 'Azul Céu' },
  { id: 'blue', bg: '#93c5fd', border: '#60a5fa', text: '#1e3a8a', label: 'Azul' },
  { id: 'purple-light', bg: '#ddd6fe', border: '#c4b5fd', text: '#4c1d95', label: 'Lilás' },
  { id: 'purple', bg: '#c4b5fd', border: '#a78bfa', text: '#2e1065', label: 'Roxo' },
  { id: 'cyan', bg: '#a5f3fc', border: '#67e8f9', text: '#164e63', label: 'Ciano' },
  { id: 'teal', bg: '#99f6e4', border: '#5eead4', text: '#134e4a', label: 'Verde Água' },
  { id: 'green-light', bg: '#bbf7d0', border: '#86efac', text: '#14532d', label: 'Verde Claro' },
  { id: 'green', bg: '#86efac', border: '#4ade80', text: '#14532d', label: 'Verde' },
  { id: 'lime', bg: '#d9f99d', border: '#bef264', text: '#365314', label: 'Lima' },
  { id: 'white', bg: '#ffffff', border: '#e2e8f0', text: '#0f172a', label: 'Branco' },
  { id: 'dark', bg: '#18181b', border: '#27272a', text: '#f8fafc', label: 'Escuro' }
];

export const generateBoardId = (prefix = 'item'): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
};

export const createBlankBoard = (name = 'Novo Board Miro'): BoardDocument => {
  const now = new Date().toISOString();
  return {
    id: generateBoardId('board'),
    name,
    description: 'Espaço em branco para mapas mentais, diagramas e ideação.',
    category: 'custom',
    folder: 'Geral',
    items: [
      {
        id: generateBoardId('sticky'),
        type: 'sticky',
        x: 400,
        y: 300,
        width: 180,
        height: 180,
        content: {
          text: '💡 Comece sua ideia aqui!\n\nUse o botão de IA abaixo ou a barra lateral para criar nós e fluxos.'
        },
        style: {
          backgroundColor: '#fff9b1',
          borderColor: '#fef08a',
          color: '#713f12',
          fontSize: 14,
          fontWeight: 600,
          shadow: true
        }
      }
    ],
    connections: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: now,
    updatedAt: now
  };
};

// 1. Template: Fluxograma de Vendas (como na Imagem 2 do Miro enviada pelo usuário)
const createFlowchartTemplate = (): BoardDocument => {
  const now = new Date().toISOString();
  const id1 = 'flow-1';
  const id2 = 'flow-2';
  const id3 = 'flow-3';
  const id4 = 'flow-4';
  const id5 = 'flow-5';
  const id6 = 'flow-6';
  const id7 = 'flow-7';
  const id8 = 'flow-8';

  const items: BoardItem[] = [
    // Frame
    {
      id: 'frame-flow',
      type: 'frame',
      x: 100,
      y: 120,
      width: 1050,
      height: 520,
      content: { title: 'Fluxograma de Aquisição & Conversão' },
      style: {
        backgroundColor: 'rgba(248, 250, 252, 0.6)',
        borderColor: '#cbd5e1',
        borderWidth: 2,
        borderStyle: 'dashed',
        color: '#475569',
        fontSize: 16,
        fontWeight: 700
      }
    },
    // Nós
    {
      id: id1,
      type: 'shape',
      x: 160,
      y: 280,
      width: 150,
      height: 70,
      content: { text: 'Tráfego Pago\n(Meta / Google)', shapeType: 'rounded' },
      style: { backgroundColor: '#93c5fd', borderColor: '#60a5fa', color: '#1e3a8a', fontSize: 13, fontWeight: 700, shadow: true }
    },
    {
      id: id2,
      type: 'shape',
      x: 360,
      y: 280,
      width: 150,
      height: 70,
      content: { text: 'Landing Page\n(Oferta Principal)', shapeType: 'rounded' },
      style: { backgroundColor: '#fef08a', borderColor: '#fde047', color: '#713f12', fontSize: 13, fontWeight: 700, shadow: true }
    },
    {
      id: id3,
      type: 'shape',
      x: 560,
      y: 280,
      width: 150,
      height: 70,
      content: { text: 'Checkout\nde Pagamento', shapeType: 'rounded' },
      style: { backgroundColor: '#fed7aa', borderColor: '#fb923c', color: '#7c2d12', fontSize: 13, fontWeight: 700, shadow: true }
    },
    {
      id: id4,
      type: 'shape',
      x: 770,
      y: 270,
      width: 110,
      height: 90,
      content: { text: 'Pagou?', shapeType: 'diamond' },
      style: { backgroundColor: '#18181b', borderColor: '#27272a', color: '#ffffff', fontSize: 13, fontWeight: 800, shadow: true }
    },
    {
      id: id5,
      type: 'shape',
      x: 940,
      y: 200,
      width: 150,
      height: 70,
      content: { text: 'Oferta Upsell\n(Ticket Médio)', shapeType: 'rounded' },
      style: { backgroundColor: '#c4b5fd', borderColor: '#a78bfa', color: '#2e1065', fontSize: 13, fontWeight: 700, shadow: true }
    },
    {
      id: id6,
      type: 'shape',
      x: 940,
      y: 360,
      width: 150,
      height: 70,
      content: { text: 'WhatsApp VIP\nRecuperação', shapeType: 'rounded' },
      style: { backgroundColor: '#bbf7d0', borderColor: '#86efac', color: '#14532d', fontSize: 13, fontWeight: 700, shadow: true }
    },
    {
      id: id7,
      type: 'shape',
      x: 750,
      y: 460,
      width: 150,
      height: 60,
      content: { text: 'E-mail Remarketing\n(Boleto / Pix)', shapeType: 'rounded' },
      style: { backgroundColor: '#fecdd3', borderColor: '#fda4af', color: '#881337', fontSize: 12, fontWeight: 600, shadow: true }
    },
    {
      id: id8,
      type: 'sticky',
      x: 160,
      y: 400,
      width: 160,
      height: 140,
      content: { text: '📌 Dica de Conversão:\nMonitore o abandono de carrinho diariamente com o Pixel.' },
      style: { backgroundColor: '#fff9b1', borderColor: '#fef08a', color: '#713f12', fontSize: 12, fontWeight: 600, shadow: true }
    }
  ];

  const connections: BoardConnection[] = [
    { id: 'c1', fromId: id1, toId: id2, label: 'Acessos', color: '#64748b', width: 2, style: 'solid', arrowEnd: true },
    { id: 'c2', fromId: id2, toId: id3, label: 'Clique CTA', color: '#64748b', width: 2, style: 'solid', arrowEnd: true },
    { id: 'c3', fromId: id3, toId: id4, label: 'Submissão', color: '#64748b', width: 2, style: 'solid', arrowEnd: true },
    { id: 'c4', fromId: id4, toId: id5, label: 'Sim (Aprovado)', color: '#10b981', width: 2, style: 'solid', arrowEnd: true },
    { id: 'c5', fromId: id4, toId: id6, label: 'Não (Pendente)', color: '#f59e0b', width: 2, style: 'solid', arrowEnd: true },
    { id: 'c6', fromId: id6, toId: id7, label: 'Após 2h', color: '#ef4444', width: 2, style: 'dashed', arrowEnd: true }
  ];

  return {
    id: 'tmpl-flowchart',
    name: 'Fluxograma de Marketing & Vendas',
    description: 'Diagrama visual de funil com pontos de decisão, tráfego, checkout e recuperação.',
    category: 'flowchart',
    folder: 'Modelos Prontos',
    items,
    connections,
    viewport: { x: 50, y: 30, zoom: 0.9 },
    createdAt: now,
    updatedAt: now
  };
};

// 2. Template: Mapa Mental de Lançamento & Produto
const createMindmapTemplate = (): BoardDocument => {
  const now = new Date().toISOString();
  const rootId = 'mm-root';
  const b1 = 'mm-b1';
  const b2 = 'mm-b2';
  const b3 = 'mm-b3';
  const b4 = 'mm-b4';

  const sub1 = 'mm-sub1';
  const sub2 = 'mm-sub2';
  const sub3 = 'mm-sub3';
  const sub4 = 'mm-sub4';

  const items: BoardItem[] = [
    {
      id: rootId,
      type: 'node',
      x: 500,
      y: 350,
      width: 200,
      height: 90,
      content: { text: '🚀 Lançamento\ndo Produto' },
      style: { backgroundColor: '#6366f1', borderColor: '#4f46e5', color: '#ffffff', fontSize: 18, fontWeight: 900, shadow: true }
    },
    // Ramos Nível 1
    {
      id: b1,
      type: 'node',
      x: 180,
      y: 200,
      width: 170,
      height: 70,
      content: { text: '🎯 1. Tráfego & Captação' },
      style: { backgroundColor: '#93c5fd', borderColor: '#60a5fa', color: '#1e3a8a', fontSize: 14, fontWeight: 700, shadow: true }
    },
    {
      id: b2,
      type: 'node',
      x: 820,
      y: 200,
      width: 170,
      height: 70,
      content: { text: '🔥 2. Conteúdo & Aquecimento' },
      style: { backgroundColor: '#fed7aa', borderColor: '#fb923c', color: '#7c2d12', fontSize: 14, fontWeight: 700, shadow: true }
    },
    {
      id: b3,
      type: 'node',
      x: 180,
      y: 500,
      width: 170,
      height: 70,
      content: { text: '💰 3. Oferta & Checkout' },
      style: { backgroundColor: '#bbf7d0', borderColor: '#86efac', color: '#14532d', fontSize: 14, fontWeight: 700, shadow: true }
    },
    {
      id: b4,
      type: 'node',
      x: 820,
      y: 500,
      width: 170,
      height: 70,
      content: { text: '🤝 4. Suporte & Onboarding' },
      style: { backgroundColor: '#c4b5fd', borderColor: '#a78bfa', color: '#2e1065', fontSize: 14, fontWeight: 700, shadow: true }
    },
    // Sub-ramos
    {
      id: sub1,
      type: 'sticky',
      x: 40,
      y: 120,
      width: 140,
      height: 120,
      content: { text: '• Meta Ads (Reels)\n• Google Search\n• Parcerias e Co-labs' },
      style: { backgroundColor: '#bae6fd', color: '#0c4a6e', fontSize: 12, fontWeight: 600, shadow: true }
    },
    {
      id: sub2,
      type: 'sticky',
      x: 1020,
      y: 120,
      width: 150,
      height: 120,
      content: { text: '• Lives Semanais\n• E-mails de Histórias\n• Grupo VIP WhatsApp' },
      style: { backgroundColor: '#fff9b1', color: '#713f12', fontSize: 12, fontWeight: 600, shadow: true }
    },
    {
      id: sub3,
      type: 'sticky',
      x: 40,
      y: 560,
      width: 140,
      height: 120,
      content: { text: '• Bônus Exclusivo 24h\n• Garantia Blindada\n• Parcelamento 12x' },
      style: { backgroundColor: '#d9f99d', color: '#365314', fontSize: 12, fontWeight: 600, shadow: true }
    },
    {
      id: sub4,
      type: 'sticky',
      x: 1020,
      y: 560,
      width: 150,
      height: 120,
      content: { text: '• Boas-vindas personalizadas\n• Comunidade no Discord\n• Suporte humanizado' },
      style: { backgroundColor: '#fbcfe8', color: '#831843', fontSize: 12, fontWeight: 600, shadow: true }
    }
  ];

  const connections: BoardConnection[] = [
    { id: 'cm1', fromId: rootId, toId: b1, color: '#3b82f6', width: 3, style: 'solid', arrowEnd: true },
    { id: 'cm2', fromId: rootId, toId: b2, color: '#f97316', width: 3, style: 'solid', arrowEnd: true },
    { id: 'cm3', fromId: rootId, toId: b3, color: '#10b981', width: 3, style: 'solid', arrowEnd: true },
    { id: 'cm4', fromId: rootId, toId: b4, color: '#8b5cf6', width: 3, style: 'solid', arrowEnd: true },
    { id: 'cs1', fromId: b1, toId: sub1, color: '#93c5fd', width: 2, style: 'dashed' },
    { id: 'cs2', fromId: b2, toId: sub2, color: '#fde047', width: 2, style: 'dashed' },
    { id: 'cs3', fromId: b3, toId: sub3, color: '#86efac', width: 2, style: 'dashed' },
    { id: 'cs4', fromId: b4, toId: sub4, color: '#c4b5fd', width: 2, style: 'dashed' }
  ];

  return {
    id: 'tmpl-mindmap',
    name: 'Mapa Mental de Lançamento',
    description: 'Estrutura radial completa dividida em fases: captação, conteúdo, oferta e onboarding.',
    category: 'mindmap',
    folder: 'Modelos Prontos',
    items,
    connections,
    viewport: { x: 80, y: 40, zoom: 0.85 },
    createdAt: now,
    updatedAt: now
  };
};

// 3. Template: Retrospectiva dos 4 Ls (Miro clássico da foto 1)
const createRetrospectiveTemplate = (): BoardDocument => {
  const now = new Date().toISOString();
  const cols = [
    { title: 'Liked (O que gostamos)', bg: '#bbf7d0', color: '#14532d', x: 100 },
    { title: 'Learned (O que aprendemos)', bg: '#bae6fd', color: '#0c4a6e', x: 380 },
    { title: 'Lacked (O que faltou)', bg: '#fed7aa', color: '#7c2d12', x: 660 },
    { title: 'Longed for (O que desejamos)', bg: '#fbcfe8', color: '#831843', x: 940 }
  ];

  const items: BoardItem[] = [];

  cols.forEach((col, idx) => {
    // Header frame
    items.push({
      id: `frame-${idx}`,
      type: 'frame',
      x: col.x,
      y: 100,
      width: 250,
      height: 600,
      content: { title: col.title },
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        borderStyle: 'solid',
        color: '#0f172a',
        fontSize: 14,
        fontWeight: 800
      }
    });

    // Sample post-its inside
    items.push({
      id: `sticky-${idx}-1`,
      type: 'sticky',
      x: col.x + 25,
      y: 170,
      width: 200,
      height: 140,
      content: { text: idx === 0 ? 'Entrega antecipada do projeto com qualidade excelente.' : idx === 1 ? 'Melhor alinhamento diário diminui retrabalho.' : idx === 2 ? 'Documentação clara dos passos técnicos.' : 'Automação das tarefas repetitivas.' },
      style: { backgroundColor: col.bg, color: col.color, fontSize: 13, fontWeight: 600, shadow: true }
    });

    items.push({
      id: `sticky-${idx}-2`,
      type: 'sticky',
      x: col.x + 25,
      y: 330,
      width: 200,
      height: 140,
      content: { text: idx === 0 ? 'Colaboração exemplar do time de marketing.' : idx === 1 ? 'Novas métricas de conversão na landing page.' : idx === 2 ? 'Tempo de teste antes do lançamento oficial.' : 'Treinamento sobre uso de IA nos processos.' },
      style: { backgroundColor: col.bg, color: col.color, fontSize: 13, fontWeight: 600, shadow: true }
    });
  });

  return {
    id: 'tmpl-retrospective',
    name: 'Retrospectiva dos 4 Ls',
    description: 'Framework ágil para times avaliarem sprints e ciclos de trabalho em 4 colunas.',
    category: 'brainstorm',
    folder: 'Modelos Prontos',
    items,
    connections: [],
    viewport: { x: 50, y: 30, zoom: 0.9 },
    createdAt: now,
    updatedAt: now
  };
};

export const INITIAL_BOARD_TEMPLATES: BoardTemplateModel[] = [
  {
    id: 'tmpl-flowchart',
    name: 'Fluxograma de Marketing & Vendas',
    category: 'flowchart',
    categoryLabel: 'Fluxograma',
    description: 'Diagrama visual de processos, decisões e rotas de conversão com setas interativas.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    badge: 'POPULAR',
    board: createFlowchartTemplate()
  },
  {
    id: 'tmpl-mindmap',
    name: 'Mapa Mental de Lançamento',
    category: 'mindmap',
    categoryLabel: 'Mapa Mental',
    description: 'Visão radial expansível para estruturar produtos, estratégias e pilares.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
    badge: 'IA ASSIST',
    board: createMindmapTemplate()
  },
  {
    id: 'tmpl-retrospective',
    name: 'Retrospectiva dos 4 Ls',
    category: 'brainstorm',
    categoryLabel: 'Brainstorm',
    description: 'Colunas de post-its coloridos para dinâmicas, retrospectivas e ideação.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    badge: 'ÁGIL',
    board: createRetrospectiveTemplate()
  }
];

export const INITIAL_BOARDS: BoardDocument[] = [
  createFlowchartTemplate(),
  createMindmapTemplate(),
  createRetrospectiveTemplate()
];
