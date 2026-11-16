import { Router } from 'express';
import { storage } from '../storage';
import { INITIAL_TEMPLATES } from '../../data/initialTemplates';
import { INITIAL_PAGE_TEMPLATES } from '../../data/initialPageTemplates';
import { INITIAL_BOARD_TEMPLATES } from '../../data/initialBoards';
import { compileEmailHtml } from '../../utils/emailCompiler';
import { generateAiPageDocument } from '../aiPageGenerator';
import { generateAiBoardContent } from '../aiBoardGenerator';
import { AiPageBriefingRequest } from '../../types/page';
import { AiBoardGenerateRequest } from '../../types/board';
import { uploadBase64ToCdn } from '../imageUploader';

export const apiRouter = Router();

// ===================== PROJETOS DE E-MAIL =====================
apiRouter.get('/projects', (_req, res) => {
  const projects = storage.getProjects();
  res.json({ success: true, projects });
});

apiRouter.get('/projects/:id', (req, res) => {
  const project = storage.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
  }
  res.json({ success: true, project });
});

apiRouter.post('/projects', (req, res) => {
  try {
    const project = req.body;
    if (!project || !project.id || !project.name) {
      return res.status(400).json({ success: false, message: 'Dados inválidos do projeto' });
    }
    const saved = storage.saveProject(project);
    res.json({ success: true, project: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/projects/:id/duplicate', (req, res) => {
  const copy = storage.duplicateProject(req.params.id);
  if (!copy) {
    return res.status(404).json({ success: false, message: 'Projeto original não encontrado' });
  }
  res.json({ success: true, project: copy });
});

apiRouter.put('/projects/:id/move', (req, res) => {
  const { folder } = req.body;
  if (!folder) {
    return res.status(400).json({ success: false, message: 'Nome da pasta é obrigatório' });
  }
  const updated = storage.moveProjectToFolder(req.params.id, folder);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
  }
  res.json({ success: true, project: updated });
});

apiRouter.delete('/projects/:id', (req, res) => {
  const deleted = storage.deleteProject(req.params.id);
  res.json({ success: deleted });
});

// ===================== PASTAS DE TEMPLATES =====================
apiRouter.get('/template-folders', (_req, res) => {
  const folders = storage.getTemplateFolders();
  res.json({ success: true, folders });
});

apiRouter.post('/template-folders', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nome da pasta é obrigatório' });
  }
  const folders = storage.addTemplateFolder(name);
  res.json({ success: true, folders });
});

apiRouter.delete('/template-folders/:name', (req, res) => {
  const folders = storage.deleteTemplateFolder(decodeURIComponent(req.params.name));
  res.json({ success: true, folders });
});

// ===================== TEMPLATES =====================
apiRouter.get('/templates', (_req, res) => {
  res.json({ success: true, templates: INITIAL_TEMPLATES });
});

apiRouter.get('/templates/:id', (req, res) => {
  const tmpl = INITIAL_TEMPLATES.find(t => t.id === req.params.id);
  if (!tmpl) {
    return res.status(404).json({ success: false, message: 'Template não encontrado' });
  }
  res.json({ success: true, template: tmpl });
});

// ===================== BLOCOS SALVOS =====================
apiRouter.get('/blocks', (_req, res) => {
  const blocks = storage.getSavedBlocks();
  res.json({ success: true, blocks });
});

apiRouter.post('/blocks', (req, res) => {
  const newBlock = req.body;
  if (!newBlock || !newBlock.id || !newBlock.name) {
    return res.status(400).json({ success: false, message: 'Dados inválidos do bloco' });
  }
  const saved = storage.addSavedBlock(newBlock);
  res.json({ success: true, block: saved });
});

apiRouter.delete('/blocks/:id', (req, res) => {
  const deleted = storage.deleteSavedBlock(req.params.id);
  res.json({ success: deleted });
});

// ===================== MÍDIA & ARQUIVOS =====================
apiRouter.get('/media', (_req, res) => {
  const assets = storage.getMediaAssets();
  const folders = storage.getFolders();
  res.json({ success: true, assets, folders });
});

apiRouter.post('/media', (req, res) => {
  try {
    const asset = req.body;
    if (!asset || !asset.name || !asset.url) {
      return res.status(400).json({ success: false, message: 'Dados da imagem incompletos' });
    }
    const fullAsset = {
      ...asset,
      id: asset.id || `media-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const saved = storage.addMediaAsset(fullAsset);
    res.json({ success: true, asset: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/media/folders', (req, res) => {
  const { folder } = req.body;
  if (!folder) {
    return res.status(400).json({ success: false, message: 'Nome da pasta é obrigatório' });
  }
  const folders = storage.addFolder(folder);
  res.json({ success: true, folders });
});

apiRouter.delete('/media/:id', (req, res) => {
  const deleted = storage.deleteMediaAsset(req.params.id);
  res.json({ success: deleted });
});

// ===================== UPLOAD DE IMAGEM & COMPATIBILIDADE BREVO/EMAIL =====================
apiRouter.post('/upload-image', async (req, res) => {
  try {
    const { base64, filename } = req.body;
    if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'Nenhuma imagem base64 válida fornecida' });
    }

    const result = await uploadBase64ToCdn(base64, filename || 'banner.jpg');
    res.json({
      success: true,
      url: result.url,
      localUrl: result.localUrl,
      sizeBytes: result.sizeBytes,
      filename: result.filename
    });
  } catch (err: any) {
    console.error('Erro em /api/upload-image:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/clean-base64-images', async (req, res) => {
  try {
    const doc = req.body;
    if (!doc || !doc.rows || !Array.isArray(doc.rows)) {
      return res.status(400).json({ success: false, message: 'Documento inválido' });
    }

    let replacedCount = 0;
    const clonedDoc = JSON.parse(JSON.stringify(doc));

    // Scan all rows, columns, blocks and globalSettings
    for (const row of clonedDoc.rows) {
      if (row.columns && Array.isArray(row.columns)) {
        for (const col of row.columns) {
          if (col.blocks && Array.isArray(col.blocks)) {
            for (const block of col.blocks) {
              if (block && block.content) {
                // Check all content properties for data:image
                for (const key of Object.keys(block.content)) {
                  const val = block.content[key];
                  if (typeof val === 'string') {
                    if (val.startsWith('data:image/')) {
                      try {
                        const resUpload = await uploadBase64ToCdn(val, `${block.type}-${key}.jpg`);
                        block.content[key] = resUpload.url;
                        replacedCount++;
                      } catch (e) {
                        console.warn(`Falha ao converter base64 no bloco ${block.id}:`, e);
                      }
                    } else if (val.includes('data:image/')) {
                      const base64Regex = /data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/g;
                      const matches = Array.from(new Set(val.match(base64Regex) || []));
                      let updatedVal = val;
                      for (const matchStr of matches) {
                        try {
                          const resUpload = await uploadBase64ToCdn(matchStr, `inline-html-img.jpg`);
                          updatedVal = updatedVal.split(matchStr).join(resUpload.url);
                          replacedCount++;
                        } catch (e) {
                          console.warn('Falha ao converter base64 embutido no HTML:', e);
                        }
                      }
                      block.content[key] = updatedVal;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Check thumbnailData
    if (typeof clonedDoc.thumbnailData === 'string' && clonedDoc.thumbnailData.startsWith('data:image/')) {
      try {
        const resUpload = await uploadBase64ToCdn(clonedDoc.thumbnailData, 'thumbnail.jpg');
        clonedDoc.thumbnailData = resUpload.url;
        replacedCount++;
      } catch (e) {}
    }

    // Check globalSettings bodyBgImage / contentBgImage
    if (clonedDoc.globalSettings) {
      if (typeof clonedDoc.globalSettings.bodyBgImage === 'string' && clonedDoc.globalSettings.bodyBgImage.startsWith('data:image/')) {
        try {
          const resUpload = await uploadBase64ToCdn(clonedDoc.globalSettings.bodyBgImage, 'body-bg.jpg');
          clonedDoc.globalSettings.bodyBgImage = resUpload.url;
          replacedCount++;
        } catch (e) {}
      }
      if (typeof clonedDoc.globalSettings.contentBgImage === 'string' && clonedDoc.globalSettings.contentBgImage.startsWith('data:image/')) {
        try {
          const resUpload = await uploadBase64ToCdn(clonedDoc.globalSettings.contentBgImage, 'content-bg.jpg');
          clonedDoc.globalSettings.contentBgImage = resUpload.url;
          replacedCount++;
        } catch (e) {}
      }
    }

    // Save cleaned project to storage if it has an id
    if (clonedDoc.id && replacedCount > 0) {
      try {
        storage.saveProject(clonedDoc);
      } catch (e) {}
    }

    res.json({
      success: true,
      doc: clonedDoc,
      replacedCount
    });
  } catch (err: any) {
    console.error('Erro em /api/clean-base64-images:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===================== EXPORTAÇÃO & COMPILAÇÃO HTML =====================
apiRouter.post('/export/compile', (req, res) => {
  try {
    const doc = req.body;
    if (!doc || !doc.rows) {
      return res.status(400).json({ success: false, message: 'Estrutura de e-mail inválida' });
    }
    const html = compileEmailHtml(doc);
    const sizeBytes = Buffer.byteLength(html, 'utf8');
    const sizeKb = (sizeBytes / 1024).toFixed(1);

    // Validações básicas de pre-flight
    const warnings: string[] = [];
    if (sizeBytes > 102400) {
      warnings.push(`Tamanho do HTML (${sizeKb} KB) excede 102 KB. O Gmail pode truncar este e-mail.`);
    }
    if (!doc.preheader || doc.preheader.trim() === '') {
      warnings.push('Preheader não configurado. Clientes de e-mail podem puxar texto aleatório do topo.');
    }

    res.json({
      success: true,
      html,
      stats: {
        sizeBytes,
        sizeKb: `${sizeKb} KB`,
        rowsCount: doc.rows.length,
        warnings
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Simulação de envio de e-mail de teste
apiRouter.post('/export/test-send', (req, res) => {
  const { recipientEmail, subject, doc } = req.body;
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return res.status(400).json({ success: false, message: 'E-mail do destinatário inválido' });
  }

  const html = compileEmailHtml(doc);
  const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);

  // Registro do teste
  res.json({
    success: true,
    message: `E-mail de teste simulado com sucesso para ${recipientEmail}!`,
    details: {
      recipient: recipientEmail,
      subject: subject || doc.subject || 'E-mail de Teste vierstudio',
      size: `${sizeKb} KB`,
      timestamp: new Date().toISOString(),
      provider: 'vierstudio Built-in SMTP Simulator (RFC 5322 Compliant)'
    }
  });
});

// ===================== SAAS & USUÁRIO =====================
apiRouter.get('/saas/me', (_req, res) => {
  const user = storage.getUser();
  res.json({ success: true, user });
});

apiRouter.get('/saas/plans', (_req, res) => {
  res.json({
    success: true,
    plans: [
      { id: 'starter', name: 'Starter', price: 'R$ 49/mês', maxProjects: 5, maxStorage: '100 MB', features: ['Editor Drag-and-drop', 'Exportação HTML básica', 'Suporte por e-mail'] },
      { id: 'pro', name: 'Profissional', price: 'R$ 99/mês', maxProjects: 50, maxStorage: '2 GB', features: ['Tudo do Starter', 'Botões VML Outlook', 'Templates Ilimitados', 'Testes de clipping Gmail', 'Exportação sem marca'] },
      { id: 'enterprise', name: 'Enterprise', price: 'R$ 249/mês', maxProjects: 9999, maxStorage: '20 GB', features: ['Tudo do Pro', 'Multi-usuários', 'API de disparo', 'Suporte VIP WhatsApp', 'SLA 99.9%'] }
    ]
  });
});

// ===================== PAGE BUILDER: PÁGINAS & LEADS =====================
apiRouter.get('/pages', (_req, res) => {
  const pages = storage.getPageProjects();
  res.json({ success: true, pages });
});

apiRouter.get('/pages/ai-status', (_req, res) => {
  res.json({
    success: true,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim())
  });
});

apiRouter.post('/pages/generate-ai', async (req, res) => {
  try {
    const briefing = req.body as AiPageBriefingRequest;
    if (!briefing || !briefing.productName?.trim() || !briefing.briefing?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Informe ao menos o nome do produto e o briefing da página.'
      });
    }

    const { page, aiMode, warning } = await generateAiPageDocument(briefing);
    const saved = storage.savePageProject(page);

    res.json({
      success: true,
      page: saved,
      aiMode,
      warning
    });
  } catch (err: any) {
    console.error('Erro ao gerar página com IA:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Erro interno ao gerar landing page com IA.'
    });
  }
});

apiRouter.get('/pages/:id', (req, res) => {
  const page = storage.getPageProjectById(req.params.id);
  if (!page) {
    return res.status(404).json({ success: false, message: 'Landing page não encontrada' });
  }
  res.json({ success: true, page });
});

apiRouter.get('/pages/by-slug/:slug', (req, res) => {
  const page = storage.getPageProjectBySlug(req.params.slug);
  if (!page) {
    return res.status(404).json({ success: false, message: 'Página não encontrada' });
  }
  res.json({ success: true, page });
});

apiRouter.post('/pages', (req, res) => {
  try {
    const page = req.body;
    if (!page || !page.id || !page.name || !page.slug) {
      return res.status(400).json({ success: false, message: 'Dados inválidos da página' });
    }
    const saved = storage.savePageProject(page);
    res.json({ success: true, page: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/pages/:id/duplicate', (req, res) => {
  const copy = storage.duplicatePageProject(req.params.id);
  if (!copy) {
    return res.status(404).json({ success: false, message: 'Página original não encontrada' });
  }
  res.json({ success: true, page: copy });
});

apiRouter.put('/pages/:id/move', (req, res) => {
  const { folder } = req.body;
  if (!folder) {
    return res.status(400).json({ success: false, message: 'Nome da pasta é obrigatório' });
  }
  const updated = storage.movePageProjectToFolder(req.params.id, folder);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Página não encontrada' });
  }
  res.json({ success: true, page: updated });
});

apiRouter.delete('/pages/:id', (req, res) => {
  const deleted = storage.deletePageProject(req.params.id);
  res.json({ success: deleted });
});

// Pastas de Landing Pages
apiRouter.get('/page-folders', (_req, res) => {
  const folders = storage.getPageFolders();
  res.json({ success: true, folders });
});

apiRouter.post('/page-folders', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nome da pasta é obrigatório' });
  }
  const folders = storage.addPageFolder(name.trim());
  res.json({ success: true, folders });
});

apiRouter.delete('/page-folders/:name', (req, res) => {
  const folders = storage.deletePageFolder(decodeURIComponent(req.params.name));
  res.json({ success: true, folders });
});

// Templates de Landing Pages
apiRouter.get('/page-templates', (_req, res) => {
  res.json({ success: true, templates: INITIAL_PAGE_TEMPLATES });
});

// Captura de Leads
apiRouter.get('/leads', (req, res) => {
  const pageId = req.query.pageId as string | undefined;
  const leads = storage.getPageLeads(pageId);
  res.json({ success: true, leads });
});

apiRouter.post('/leads', (req, res) => {
  try {
    const lead = req.body;
    if (!lead || !lead.pageId) {
      return res.status(400).json({ success: false, message: 'Dados incompletos do lead' });
    }
    const saved = storage.savePageLead(lead);
    res.json({ success: true, message: 'Lead capturado com sucesso!', lead: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===================== MAPAS MENTAIS & BOARDS (ESTILO MIRO) =====================
apiRouter.get('/boards', (_req, res) => {
  try {
    const boards = storage.getBoards();
    res.json({ success: true, boards });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/boards/:id', (req, res) => {
  try {
    const board = storage.getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board não encontrado' });
    }
    res.json({ success: true, board });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/boards', (req, res) => {
  try {
    const board = req.body;
    if (!board || !board.id || !board.name) {
      return res.status(400).json({ success: false, message: 'Dados inválidos do board' });
    }
    const saved = storage.saveBoard(board);
    res.json({ success: true, board: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/boards/:id/duplicate', (req, res) => {
  try {
    const copy = storage.duplicateBoard(req.params.id);
    if (!copy) {
      return res.status(404).json({ success: false, message: 'Board não encontrado para duplicar' });
    }
    res.json({ success: true, board: copy });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.delete('/boards/:id', (req, res) => {
  try {
    const deleted = storage.deleteBoard(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Board não encontrado para exclusão' });
    }
    res.json({ success: true, message: 'Board excluído com sucesso' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/board-folders', (_req, res) => {
  try {
    const folders = storage.getBoardFolders();
    res.json({ success: true, folders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/board-folders', (req, res) => {
  try {
    const { folder } = req.body;
    if (!folder || typeof folder !== 'string') {
      return res.status(400).json({ success: false, message: 'Nome da pasta inválido' });
    }
    const folders = storage.addBoardFolder(folder);
    res.json({ success: true, folders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.delete('/board-folders/:name', (req, res) => {
  try {
    const folders = storage.deleteBoardFolder(req.params.name);
    res.json({ success: true, folders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/board-templates', (_req, res) => {
  res.json({ success: true, templates: INITIAL_BOARD_TEMPLATES });
});

apiRouter.post('/boards/generate-ai', async (req, res) => {
  try {
    const request: AiBoardGenerateRequest = req.body;
    if (!request || !request.prompt) {
      return res.status(400).json({ success: false, message: 'Prompt é obrigatório para geração por IA' });
    }
    const result = await generateAiBoardContent(request);
    res.json({
      success: true,
      message: 'Conteúdo de mapa/fluxo gerado com sucesso!',
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Erro ao gerar mapa com IA' });
  }
});
