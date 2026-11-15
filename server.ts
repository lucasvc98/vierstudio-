import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes/api';
import { storage } from './src/server/storage';
import { compilePageHtml } from './src/utils/pageCompiler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parsing with generous limits for images and base64
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Security and CORS headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Healthcheck endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      platform: 'vierstudio SaaS',
      version: '1.0.0',
      timestamp: new Date().toISOString() 
    });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // ===================== ROTA PÚBLICA DE LANDING PAGES =====================
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

      // Increment view count
      page.viewsCount = (page.viewsCount || 0) + 1;
      storage.savePageProject(page);

      const html = compilePageHtml(page, false);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err: any) {
      console.error('Erro ao renderizar landing page:', err);
      res.status(500).send('Erro interno ao renderizar página.');
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Vite Dev Server middleware mode for ultra-fast HMR
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n================================================================`);
    console.log(` 🚀 VIERSTUDIO - Plataforma Profissional de E-mail Marketing`);
    console.log(` 🌐 Servidor ativo em: http://localhost:${PORT}`);
    console.log(` 📦 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    console.log(` 🗄️  Banco de Dados: Schema migrações prontas em schema/*.sql`);
    console.log(`================================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Erro fatal ao iniciar servidor vierstudio:', err);
  process.exit(1);
});
