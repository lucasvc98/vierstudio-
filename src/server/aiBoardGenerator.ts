import { BoardItem, BoardConnection, AiBoardGenerateRequest, AiBoardGenerateResponse } from '../types/board';
import { generateBoardId, MIRO_STICKY_COLORS } from '../data/initialBoards';

function buildAiBoardPrompt(req: AiBoardGenerateRequest): string {
  if (req.type === 'mindmap') {
    return `Você é um especialista em mapas mentais e estratégia no estilo Miro.
Crie um mapa mental estruturado em português para o tema: "${req.prompt}".

Retorne APENAS um JSON no formato:
{
  "rootTitle": "Título do Nó Central",
  "branches": [
    {
      "title": "Nome do Ramo 1",
      "subItems": ["Ideia 1.1", "Ideia 1.2", "Ideia 1.3"]
    },
    {
      "title": "Nome do Ramo 2",
      "subItems": ["Ideia 2.1", "Ideia 2.2"]
    },
    {
      "title": "Nome do Ramo 3",
      "subItems": ["Ideia 3.1", "Ideia 3.2"]
    },
    {
      "title": "Nome do Ramo 4",
      "subItems": ["Ideia 4.1", "Ideia 4.2"]
    }
  ]
}`;
  }

  if (req.type === 'flowchart') {
    return `Você é um arquiteto de processos e fluxogramas no estilo Miro.
Crie um fluxograma detalhado com etapas, decisão (losango) e desfechos para o processo: "${req.prompt}".

Retorne APENAS um JSON no formato:
{
  "title": "Título do Fluxograma",
  "steps": [
    { "text": "Início: Descrição", "type": "start" },
    { "text": "Etapa 1: Ação", "type": "action" },
    { "text": "Etapa 2: Ação", "type": "action" },
    { "text": "Pergunta de Decisão?", "type": "decision" },
    { "text": "Caminho Sim: Ação", "type": "action_yes" },
    { "text": "Caminho Não: Ação", "type": "action_no" },
    { "text": "Fim: Conclusão", "type": "end" }
  ]
}`;
  }

  if (req.type === 'expand_node') {
    return `Você é um facilitador de brainstorming no Miro.
O usuário selecionou o item: "${req.selectedItemText || req.prompt}".
Gere de 3 a 5 ideias complementares, desdobramentos ou próximos passos em português.

Retorne APENAS um JSON no formato:
{
  "subItems": [
    "Desdobramento 1 com ação clara",
    "Desdobramento 2 com ação clara",
    "Desdobramento 3 com ação clara",
    "Desdobramento 4 com ação clara"
  ]
}`;
  }

  // brainstorm default
  return `Você é um facilitador de sessões de ideação e brainstorming ágil no Miro.
Gere de 6 a 8 post-its com ideias práticas, insights e soluções sobre: "${req.prompt}".

Retorne APENAS um JSON no formato:
{
  "topic": "Tema Central",
  "notes": [
    { "text": "Ideia ou Ação 1", "category": "Ação" },
    { "text": "Ideia ou Ação 2", "category": "Inovação" },
    { "text": "Ideia ou Ação 3", "category": "Estratégia" },
    { "text": "Ideia ou Ação 4", "category": "Métrica" },
    { "text": "Ideia ou Ação 5", "category": "Ação" },
    { "text": "Ideia ou Ação 6", "category": "Inovação" }
  ]
}`;
}

// Built-in Smart Generator (local fallback)
function generateSmartBoard(req: AiBoardGenerateRequest): { items: BoardItem[]; connections: BoardConnection[] } {
  const items: BoardItem[] = [];
  const connections: BoardConnection[] = [];
  const prompt = req.prompt.trim() || 'Nova Ideia';

  if (req.type === 'mindmap') {
    const rootId = generateBoardId('node-root');
    const startX = 600;
    const startY = 400;

    // Central Root
    items.push({
      id: rootId,
      type: 'node',
      x: startX,
      y: startY,
      width: 220,
      height: 90,
      content: { text: `🎯 ${prompt}` },
      style: {
        backgroundColor: '#6366f1',
        borderColor: '#4f46e5',
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 800,
        shadow: true
      }
    });

    const branches = [
      {
        title: 'Estratégia & Metas',
        sub: ['Definir métricas-chave (KPIs)', 'Público-alvo & Persona', 'Cronograma de execução'],
        color: MIRO_STICKY_COLORS[6], // blue
        offset: { x: -380, y: -200 }
      },
      {
        title: 'Canais & Divulgação',
        sub: ['Tráfego pago (Meta/Google)', 'Conteúdo orgânico diário', 'Parcerias estratégicas'],
        color: MIRO_STICKY_COLORS[2], // orange
        offset: { x: 380, y: -200 }
      },
      {
        title: 'Oferta & Conversão',
        sub: ['Proposta de valor clara', 'Garantia incondicional', 'Gatilhos de urgência'],
        color: MIRO_STICKY_COLORS[12], // green
        offset: { x: -380, y: 180 }
      },
      {
        title: 'Retenção & Suporte',
        sub: ['Onboarding guiado', 'Comunidade ativa', 'Feedback e melhorias'],
        color: MIRO_STICKY_COLORS[9], // purple
        offset: { x: 380, y: 180 }
      }
    ];

    branches.forEach((b, bIdx) => {
      const branchId = generateBoardId(`branch-${bIdx}`);
      const bx = startX + b.offset.x;
      const by = startY + b.offset.y;

      items.push({
        id: branchId,
        type: 'node',
        x: bx,
        y: by,
        width: 190,
        height: 70,
        content: { text: b.title },
        style: {
          backgroundColor: b.color.bg,
          borderColor: b.color.border,
          color: b.color.text,
          fontSize: 14,
          fontWeight: 700,
          shadow: true
        }
      });

      connections.push({
        id: generateBoardId('conn'),
        fromId: rootId,
        toId: branchId,
        color: b.color.border,
        width: 3,
        style: 'solid',
        arrowEnd: true
      });

      // Sub post-its
      b.sub.forEach((subText, sIdx) => {
        const subId = generateBoardId(`sub-${bIdx}-${sIdx}`);
        const sx = bx + (b.offset.x < 0 ? -180 : 210);
        const sy = by - 50 + sIdx * 80;

        items.push({
          id: subId,
          type: 'sticky',
          x: sx,
          y: sy,
          width: 150,
          height: 70,
          content: { text: subText },
          style: {
            backgroundColor: '#ffffff',
            borderColor: b.color.border,
            color: '#1e293b',
            fontSize: 12,
            fontWeight: 600,
            shadow: true
          }
        });

        connections.push({
          id: generateBoardId('conn'),
          fromId: branchId,
          toId: subId,
          color: '#cbd5e1',
          width: 2,
          style: 'dashed'
        });
      });
    });

    return { items, connections };
  }

  if (req.type === 'flowchart') {
    const startX = 200;
    const startY = 300;

    const steps = [
      { text: `Início: ${prompt}`, type: 'pill', bg: '#93c5fd', color: '#1e3a8a' },
      { text: 'Etapa 1: Ativação & Coleta de Dados', type: 'rounded', bg: '#fef08a', color: '#713f12' },
      { text: 'Critérios Atendidos?', type: 'diamond', bg: '#18181b', color: '#ffffff' },
      { text: 'Avançar para Oferta Principal', type: 'rounded', bg: '#bbf7d0', color: '#14532d' },
      { text: 'Enviar Fluxo de Recuperação', type: 'rounded', bg: '#fed7aa', color: '#7c2d12' },
      { text: 'Fim: Sucesso Concluído', type: 'pill', bg: '#86efac', color: '#14532d' }
    ];

    const ids: string[] = [];

    // Step 0: Início
    const id0 = generateBoardId('step-0');
    ids.push(id0);
    items.push({
      id: id0,
      type: 'shape',
      x: startX,
      y: startY,
      width: 170,
      height: 60,
      content: { text: steps[0].text, shapeType: 'pill' },
      style: { backgroundColor: steps[0].bg, color: steps[0].color, fontSize: 13, fontWeight: 700, shadow: true }
    });

    // Step 1: Ação 1
    const id1 = generateBoardId('step-1');
    ids.push(id1);
    items.push({
      id: id1,
      type: 'shape',
      x: startX + 230,
      y: startY,
      width: 180,
      height: 70,
      content: { text: steps[1].text, shapeType: 'rounded' },
      style: { backgroundColor: steps[1].bg, color: steps[1].color, fontSize: 13, fontWeight: 700, shadow: true }
    });
    connections.push({ id: generateBoardId('conn'), fromId: id0, toId: id1, color: '#64748b', width: 2, arrowEnd: true });

    // Step 2: Decisão (Diamond)
    const id2 = generateBoardId('step-2');
    ids.push(id2);
    items.push({
      id: id2,
      type: 'shape',
      x: startX + 480,
      y: startY - 10,
      width: 130,
      height: 90,
      content: { text: steps[2].text, shapeType: 'diamond' },
      style: { backgroundColor: steps[2].bg, color: steps[2].color, fontSize: 12, fontWeight: 800, shadow: true }
    });
    connections.push({ id: generateBoardId('conn'), fromId: id1, toId: id2, color: '#64748b', width: 2, arrowEnd: true });

    // Step 3: Sim (Acima)
    const id3 = generateBoardId('step-3');
    ids.push(id3);
    items.push({
      id: id3,
      type: 'shape',
      x: startX + 680,
      y: startY - 90,
      width: 180,
      height: 70,
      content: { text: steps[3].text, shapeType: 'rounded' },
      style: { backgroundColor: steps[3].bg, color: steps[3].color, fontSize: 13, fontWeight: 700, shadow: true }
    });
    connections.push({ id: generateBoardId('conn'), fromId: id2, toId: id3, label: 'Sim', color: '#10b981', width: 2, arrowEnd: true });

    // Step 4: Não (Abaixo)
    const id4 = generateBoardId('step-4');
    ids.push(id4);
    items.push({
      id: id4,
      type: 'shape',
      x: startX + 680,
      y: startY + 90,
      width: 180,
      height: 70,
      content: { text: steps[4].text, shapeType: 'rounded' },
      style: { backgroundColor: steps[4].bg, color: steps[4].color, fontSize: 13, fontWeight: 700, shadow: true }
    });
    connections.push({ id: generateBoardId('conn'), fromId: id2, toId: id4, label: 'Não', color: '#f59e0b', width: 2, arrowEnd: true });

    // Step 5: Fim
    const id5 = generateBoardId('step-5');
    ids.push(id5);
    items.push({
      id: id5,
      type: 'shape',
      x: startX + 920,
      y: startY - 10,
      width: 170,
      height: 60,
      content: { text: steps[5].text, shapeType: 'pill' },
      style: { backgroundColor: steps[5].bg, color: steps[5].color, fontSize: 13, fontWeight: 700, shadow: true }
    });
    connections.push({ id: generateBoardId('conn'), fromId: id3, toId: id5, color: '#10b981', width: 2, arrowEnd: true });
    connections.push({ id: generateBoardId('conn'), fromId: id4, toId: id5, color: '#f59e0b', width: 2, style: 'dashed', arrowEnd: true });

    return { items, connections };
  }

  if (req.type === 'expand_node') {
    const parentId = req.selectedItemId || 'parent-node';
    const subIdeas = [
      `Aprofundar ${prompt}: métricas e acompanhamento`,
      `Implementar automação rápida para ${prompt}`,
      `Criar checklist prático e documentação`,
      `Testar variação A/B e coletar feedback`
    ];

    subIdeas.forEach((idea, idx) => {
      const newId = generateBoardId('sub-idea');
      const color = MIRO_STICKY_COLORS[(idx * 3 + 1) % MIRO_STICKY_COLORS.length];
      items.push({
        id: newId,
        type: 'sticky',
        x: 600 + (idx % 2 === 0 ? -180 : 180),
        y: 300 + Math.floor(idx / 2) * 160,
        width: 160,
        height: 120,
        content: { text: idea },
        style: {
          backgroundColor: color.bg,
          borderColor: color.border,
          color: color.text,
          fontSize: 13,
          fontWeight: 600,
          shadow: true
        }
      });

      connections.push({
        id: generateBoardId('conn'),
        fromId: parentId,
        toId: newId,
        color: color.border,
        width: 2,
        style: 'dashed',
        arrowEnd: true
      });
    });

    return { items, connections };
  }

  // Brainstorm Post-its cluster
  const notes = [
    { text: `💡 Proposta central: ${prompt}`, color: MIRO_STICKY_COLORS[0] },
    { text: '🎯 Identificar o público mais qualificado', color: MIRO_STICKY_COLORS[2] },
    { text: '⚡ Simplificar o funil de entrada em 3 passos', color: MIRO_STICKY_COLORS[4] },
    { text: '🚀 Automatizar mensagens e lembretes VIP', color: MIRO_STICKY_COLORS[6] },
    { text: '📊 Definir meta de conversão semanal', color: MIRO_STICKY_COLORS[8] },
    { text: '🤝 Coletar depoimentos e provas sociais', color: MIRO_STICKY_COLORS[12] },
    { text: '🛡️ Reforçar garantia e suporte humanizado', color: MIRO_STICKY_COLORS[10] },
    { text: '💰 Criar oferta irresistível com bônus', color: MIRO_STICKY_COLORS[14] }
  ];

  notes.forEach((n, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    items.push({
      id: generateBoardId('sticky'),
      type: 'sticky',
      x: 300 + col * 200,
      y: 250 + row * 180,
      width: 170,
      height: 140,
      content: { text: n.text },
      style: {
        backgroundColor: n.color.bg,
        borderColor: n.color.border,
        color: n.color.text,
        fontSize: 13,
        fontWeight: 600,
        shadow: true
      }
    });
  });

  return { items, connections };
}

export async function generateAiBoardContent(req: AiBoardGenerateRequest): Promise<AiBoardGenerateResponse> {
  const provider = req.provider || 'auto';
  const apiKey = req.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();

  // Try external LLM if key is available
  if (apiKey && (provider === 'gemini' || (provider === 'auto' && apiKey.startsWith('AIza')))) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildAiBoardPrompt(req) }] }],
          generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const json: any = await res.json();
        const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim());
          const { items, connections } = formatLlmOutput(parsed, req);
          return { success: true, items, connections, aiMode: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('Gemini board generation fallback to smart engine:', err);
    }
  }

  // Local Smart Engine fallback
  const { items, connections } = generateSmartBoard(req);
  return {
    success: true,
    items,
    connections,
    aiMode: 'smart-engine'
  };
}

function formatLlmOutput(data: any, req: AiBoardGenerateRequest): { items: BoardItem[]; connections: BoardConnection[] } {
  // If mindmap output
  if (data.branches && Array.isArray(data.branches)) {
    const rootId = generateBoardId('node-root');
    const startX = 600;
    const startY = 400;

    const items: BoardItem[] = [
      {
        id: rootId,
        type: 'node',
        x: startX,
        y: startY,
        width: 220,
        height: 90,
        content: { text: `🎯 ${data.rootTitle || req.prompt}` },
        style: {
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 800,
          shadow: true
        }
      }
    ];
    const connections: BoardConnection[] = [];

    const angleStep = (2 * Math.PI) / Math.max(1, data.branches.length);
    data.branches.forEach((b: any, bIdx: number) => {
      const angle = bIdx * angleStep;
      const bx = Math.round(startX + Math.cos(angle) * 360);
      const by = Math.round(startY + Math.sin(angle) * 240);
      const branchId = generateBoardId(`branch-${bIdx}`);
      const color = MIRO_STICKY_COLORS[(bIdx * 3 + 1) % MIRO_STICKY_COLORS.length];

      items.push({
        id: branchId,
        type: 'node',
        x: bx,
        y: by,
        width: 180,
        height: 70,
        content: { text: b.title || `Ramo ${bIdx + 1}` },
        style: {
          backgroundColor: color.bg,
          borderColor: color.border,
          color: color.text,
          fontSize: 14,
          fontWeight: 700,
          shadow: true
        }
      });

      connections.push({
        id: generateBoardId('conn'),
        fromId: rootId,
        toId: branchId,
        color: color.border,
        width: 3,
        arrowEnd: true
      });

      if (Array.isArray(b.subItems)) {
        b.subItems.forEach((sub: string, sIdx: number) => {
          const subId = generateBoardId('sub');
          const sx = bx + (bx < startX ? -160 : 190);
          const sy = by - 30 + sIdx * 65;
          items.push({
            id: subId,
            type: 'sticky',
            x: sx,
            y: sy,
            width: 140,
            height: 60,
            content: { text: sub },
            style: {
              backgroundColor: '#ffffff',
              borderColor: color.border,
              color: '#0f172a',
              fontSize: 12,
              fontWeight: 600,
              shadow: true
            }
          });
          connections.push({
            id: generateBoardId('conn'),
            fromId: branchId,
            toId: subId,
            color: '#cbd5e1',
            width: 2,
            style: 'dashed'
          });
        });
      }
    });

    return { items, connections };
  }

  // Fallback to smart board
  return generateSmartBoard(req);
}
