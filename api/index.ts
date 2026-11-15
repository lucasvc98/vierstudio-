import 'dotenv/config';
import express from 'express';
import { apiRouter } from '../src/server/routes/api';
import { storage } from '../src/server/storage';
import { compilePageHtml } from '../src/utils/pageCompiler';

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    platform: 'vierstudio SaaS',
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

// Mount full API router
app.use('/api', apiRouter);

// Public landing pages route
app.get('/p/:slug', (req, res) => {
  try {
    const page = storage.getPageProjectBySlug(req.params.slug);
    if (!page) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><title>Página Não Encontrada | vierstudio</title></head>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b;">
          <div style="text-align: center; max-width: 480px; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h1 style="font-size: 48px; margin: 0 0 8px 0; color: #6366f1;">404</h1>
            <h2 style="font-size: 20px; margin: 0 0 16px 0;">Página Não Encontrada ou Despublicada</h2>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">A landing page que você tentou acessar não existe ou não está ativa no momento.</p>
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Ir para o Vier Studio</a>
          </div>
        </body>
        </html>
      `);
    }

    if (page.status !== 'published') {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><title>Página em Rascunho | vierstudio</title></head>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fffbeb; color: #78350f;">
          <div style="text-align: center; max-width: 480px; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h1 style="font-size: 36px; margin: 0 0 8px 0; color: #f59e0b;">⏳ Página em Rascunho</h1>
            <p style="color: #92400e; font-size: 14px; margin-bottom: 24px;">Esta landing page foi salva como rascunho e ainda não foi publicada pelo criador.</p>
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Acessar Painel</a>
          </div>
        </body>
        </html>
      `);
    }

    storage.incrementPageView(page.id);
    const html = compilePageHtml(page);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    res.status(500).send(`Erro interno ao carregar página: ${err.message}`);
  }
});

export default app;
