# vierstudio — Plataforma Profissional SaaS (E-mails, Landing Pages & Miro Mind Maps)

O **vierstudio** é uma plataforma SaaS modular de alta performance que combina três produtos em um único ecossistema:
1. **Editor Profissional de E-mails Marketing HTML Bulletproof** (Outlook VML, Gmail clipping test, Brevo, Mailchimp, RD Station).
2. **Page Builder com IA** (Criação de Landing Pages completas baseadas em briefing, publicação instantânea em `/p/:slug`, formulários e captura de leads).
3. **Mapas Mentais & Diagramas estilo Miro com IA** (Tela infinita, sticky notes com 16 cores Miro, conectores bezier com setas, fluxo de decisão e barra flutuante de IA).

---

## 🚀 Módulos e Funcionalidades

### 1. E-mails Bulletproof
- Editor Drag-and-drop no-code (Canva/BEE style).
- Blocos salvos e reutilizáveis.
- Compilador HTML 100% inline com tabelas aninhadas e VML para Microsoft Outlook.
- Validação pré-disparo de limite de peso (102 KB Gmail) e simulador SMTP RFC 5322.

### 2. Page Builder & Criador de Páginas com IA
- Criação no-code de Landing Pages responsivas (Hero, Oferta, Preços, Depoimentos, FAQ, Formulários).
- **Criador com IA a partir de briefing**: preencha o objetivo da LP, fotos, logo, preços, paleta de cores e gere uma página pronta em segundos.
- Publicação com 1 clique e rota pública em `/p/:slug`.
- Modal de captura de Leads e conversões em tempo real.

### 3. Mapas Mentais & Diagramas estilo Miro
- Canvas infinito com pan (espaço/botão do meio) e zoom suave.
- Notas adesivas (Sticky Notes) autênticas com a paleta oficial Miro de 16 cores.
- Formas de fluxograma: retângulos, círculos, losangos de decisão, pílulas e quadros (frames).
- Conectores inteligentes bezier automáticos.
- Barra flutuante inferior de IA: `+ O que faremos a seguir?` e expansão de nós selecionados.

---

## 🛠️ Tecnologias
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite 6, Lucide React.
- **Backend:** Express, TypeScript, Serverless API (Vercel ready).
- **Banco de Dados:** PostgreSQL (scripts de migração em `schema/`) + Fallback local/tmp JSON.
- **Inteligência Artificial:** Google Gemini API / OpenAI API / Smart Local Engine.

---

## 📦 Como Executar Localmente

### 1. Instalar dependências:
```bash
npm install
```

### 2. Iniciar servidor em desenvolvimento:
```bash
npm run dev
```
Acesse em: `http://localhost:3000`.

### 3. Build de produção:
```bash
npm run build
```

---

## ☁️ Deploy no Vercel

O repositório já inclui `vercel.json` e o manipulador serverless `api/index.ts` configurados para roteamento do frontend SPA e rotas de API `/api/*` e `/p/:slug`.

```bash
npx vercel
```
Ou conecte o repositório GitHub diretamente no painel do [Vercel](https://vercel.com/new).

---

## 🗄️ Banco de Dados & Scripts SQL (Amazon EC2)

Os scripts de migração do PostgreSQL estão em `schema/`:
- `001_create_vier_tamplat_tables.sql`: Tabelas de e-mails, usuários e planos.
- `002_seed_initial_templates_and_blocks.sql`: Dados iniciais e blocos.
- `003_add_template_folders.sql`: Pastas de templates.
- `004_seed_am_outlet_template.sql`: Template AM Outlet.
- `005_create_page_builder_tables.sql`: Tabelas de Landing Pages e Leads.
- `006_create_mindmap_boards_tables.sql`: Tabelas de Boards e Mapas Mentais (Miro).
