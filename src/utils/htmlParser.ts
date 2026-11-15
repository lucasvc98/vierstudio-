import { EmailDocument, EmailRow, EmailColumn, EmailBlock, EmailBlockType } from '../types/email';
import { createNewRow, createNewBlock } from './defaults';

export function parseHtmlToEmailDocument(
  htmlContent: string,
  projectName = 'Template Importado',
  folderName = 'Geral'
): EmailDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // 1. Extrair título/assunto
  const titleEl = doc.querySelector('title');
  const subject = titleEl?.textContent?.trim() || projectName;

  // 2. Extrair preheader (geralmente uma div oculta no topo)
  let preheader = '';
  const hiddenDivs = doc.querySelectorAll('div[style*="display:none"], div[style*="display: none"], span[style*="display:none"]');
  for (const div of Array.from(hiddenDivs)) {
    const text = div.textContent?.replace(/[‎‏﻿\s]+/g, ' ').trim();
    if (text && text.length > 3) {
      preheader = text.slice(0, 150);
      break;
    }
  }

  // 3. Extrair cores de fundo globais
  const bodyEl = doc.body;
  const bodyBgColor = bodyEl ? (
    bodyEl.style.backgroundColor || 
    bodyEl.getAttribute('bgcolor') || 
    '#f4f5f8'
  ) : '#f4f5f8';

  // Buscar container principal de e-mail (geralmente tabela com width 600 ou class email-container)
  let containerWidth = 600;
  let contentBgColor = '#ffffff';

  const mainTable = doc.querySelector('table.email-container, table[width="600"], table[style*="max-width: 600"], table[style*="max-width:600"]');
  if (mainTable) {
    const widthAttr = mainTable.getAttribute('width');
    if (widthAttr && !isNaN(Number(widthAttr))) {
      containerWidth = Number(widthAttr);
    }
    const bg = (mainTable as HTMLElement).style.backgroundColor || mainTable.getAttribute('bgcolor');
    if (bg) contentBgColor = bg;
  }

  // 4. Analisar linhas e blocos
  const rows: EmailRow[] = [];

  // Buscar todas as linhas de tabelas principais ou seções
  const candidateRows = doc.querySelectorAll('table.email-container > tbody > tr, table.email-container > tr, table[width="600"] > tbody > tr, table[width="600"] > tr');
  
  if (candidateRows.length > 0) {
    candidateRows.forEach((tr, rIdx) => {
      const row = parseTableRowToEmailRow(tr as HTMLTableRowElement, rIdx);
      if (row && row.columns.some(c => c.blocks.length > 0)) {
        rows.push(row);
      }
    });
  } else {
    // Se não houver estrutura de tabela clássica, parsear nós diretos do body
    const bodyChildren = Array.from(doc.body.children).filter(el => {
      const style = el.getAttribute('style') || '';
      return !style.includes('display: none') && !style.includes('display:none');
    });

    if (bodyChildren.length > 0) {
      bodyChildren.forEach((child, idx) => {
        const blocks = parseElementToBlocks(child as HTMLElement);
        if (blocks.length > 0) {
          const row = createNewRow('1-col');
          row.id = `row-imp-${idx}`;
          row.columns[0].blocks = blocks;
          rows.push(row);
        }
      });
    }
  }

  // Fallback de segurança: se nenhuma linha for extraída, encapsular o HTML original
  if (rows.length === 0) {
    const fallbackRow = createNewRow('1-col');
    fallbackRow.id = `row-imp-fallback`;
    fallbackRow.columns[0].blocks = [
      {
        id: `blk-fallback-${Date.now()}`,
        type: 'html',
        content: { code: htmlContent },
        style: {},
        deviceVisibility: 'all'
      }
    ];
    rows.push(fallbackRow);
  }

  return {
    id: `proj-imp-${Date.now()}`,
    name: projectName,
    subject,
    preheader,
    folder: folderName,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    globalSettings: {
      containerWidth,
      bodyBgColor: bodyBgColor.startsWith('#') || bodyBgColor.startsWith('rgb') ? bodyBgColor : '#f4f5f8',
      contentBgColor: contentBgColor.startsWith('#') || contentBgColor.startsWith('rgb') ? contentBgColor : '#ffffff',
      defaultFontFamily: 'Arial, Helvetica, sans-serif',
      defaultTextColor: '#334155',
      defaultHeadingColor: '#0f172a',
      defaultLinkColor: '#6366f1',
      defaultButtonBg: '#6366f1',
      defaultButtonTextColor: '#ffffff',
      defaultButtonRadius: 6,
      containerBorderWidth: 0,
      containerBorderColor: '#e2e8f0',
      containerRadius: 8,
      sectionSpacing: 16
    },
    rows
  };
}

function parseTableRowToEmailRow(tr: HTMLTableRowElement, index: number): EmailRow | null {
  const cells = Array.from(tr.querySelectorAll(':scope > td, :scope > th'));
  if (cells.length === 0) return null;

  const row = createNewRow(cells.length === 2 ? '2-col-equal' : cells.length === 3 ? '3-col' : '1-col');
  row.id = `row-imp-${index}-${Date.now().toString(36)}`;
  
  // Pegar background da linha
  const trBg = tr.style.backgroundColor || tr.getAttribute('bgcolor');
  if (trBg) row.style.backgroundColor = trBg;

  // Analisar células
  cells.forEach((cell, cIdx) => {
    if (cIdx < row.columns.length) {
      const blocks = parseElementToBlocks(cell as HTMLElement);
      row.columns[cIdx].blocks = blocks;
    }
  });

  return row;
}

function parseElementToBlocks(el: HTMLElement): EmailBlock[] {
  const blocks: EmailBlock[] = [];
  const textContent = el.textContent?.trim();

  // 1. Procurar por imagens
  const images = el.querySelectorAll('img');
  if (images.length === 1 && !el.querySelector('h1, h2, h3, p, a.btn, a[style*="background"]')) {
    const img = images[0];
    const src = img.getAttribute('src') || '';
    if (src) {
      const isLogo = src.toLowerCase().includes('logo') || (img.getAttribute('width') && Number(img.getAttribute('width')) < 200);
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: isLogo ? 'logo' : 'image',
        content: {
          url: src,
          alt: img.getAttribute('alt') || 'Imagem',
          link: (img.closest('a') as HTMLAnchorElement)?.getAttribute('href') || '',
          width: img.getAttribute('width') || '100%'
        },
        style: {
          textAlign: (el.getAttribute('align') as any) || 'center',
          borderRadius: 6
        },
        deviceVisibility: 'all'
      });
      return blocks;
    }
  }

  // 2. Procurar botões (tags <a> com estilo de botão ou background)
  const buttons = el.querySelectorAll('a[style*="background"], a.btn, a[style*="padding"]');
  if (buttons.length > 0 && (!textContent || textContent.length < 50)) {
    buttons.forEach(btn => {
      const btnEl = btn as HTMLAnchorElement;
      const text = btnEl.textContent?.trim();
      const href = btnEl.getAttribute('href') || '#';
      const bg = btnEl.style.backgroundColor || '#6366f1';
      const color = btnEl.style.color || '#ffffff';

      if (text) {
        blocks.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'button',
          content: { text, url: href, fullWidth: false },
          style: {
            backgroundColor: bg,
            color,
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 6,
            textAlign: 'center'
          },
          deviceVisibility: 'all'
        });
      }
    });
    if (blocks.length > 0) return blocks;
  }

  // 3. Procurar títulos (h1, h2, h3, h4)
  const headings = el.querySelectorAll('h1, h2, h3, h4');
  if (headings.length > 0) {
    headings.forEach(h => {
      const hEl = h as HTMLElement;
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'heading',
        content: {
          text: hEl.textContent?.trim() || 'Título',
          level: h.tagName.toLowerCase() as any
        },
        style: {
          fontSize: h.tagName === 'H1' ? 28 : h.tagName === 'H2' ? 22 : 18,
          fontWeight: 700,
          color: hEl.style.color || '#0f172a',
          textAlign: (hEl.style.textAlign as any) || 'left'
        },
        deviceVisibility: 'all'
      });
    });
  }

  // 4. Procurar parágrafos
  const paragraphs = el.querySelectorAll('p');
  if (paragraphs.length > 0) {
    paragraphs.forEach(p => {
      const pEl = p as HTMLElement;
      const html = pEl.innerHTML.trim();
      if (html) {
        blocks.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'text',
          content: { html, text: pEl.textContent || '' },
          style: {
            fontSize: 15,
            color: pEl.style.color || '#475569',
            textAlign: (pEl.style.textAlign as any) || 'left',
            lineHeight: 1.6
          },
          deviceVisibility: 'all'
        });
      }
    });
  }

  // Se nenhum bloco específico foi extraído, mas há conteúdo textual ou HTML relevante
  if (blocks.length === 0) {
    const rawHtml = el.innerHTML.trim();
    if (rawHtml) {
      // Se for apenas texto simples com formatações
      if (!rawHtml.includes('<table') && !rawHtml.includes('<img') && !rawHtml.includes('<div')) {
        blocks.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'text',
          content: { html: rawHtml, text: el.textContent || '' },
          style: { fontSize: 15, lineHeight: 1.6 },
          deviceVisibility: 'all'
        });
      } else {
        // Bloco HTML personalizado para manter formatação intacta
        blocks.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'html',
          content: { code: rawHtml },
          style: {},
          deviceVisibility: 'all'
        });
      }
    }
  }

  return blocks;
}
