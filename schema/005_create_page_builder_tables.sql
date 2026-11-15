-- =============================================================================
-- VIER STUDIO - SCRIPT DE MIGRAÇÃO 005
-- Módulo Vier Page Builder: Criação das tabelas de Landing Pages, Leads, 
-- Templates Oficiais e Pastas de Páginas
-- 
-- ATENÇÃO AMBIENTE EC2 (AMAZON):
-- Executar este script via psql ou ferramenta de migração compatível no banco
-- PostgreSQL da instância EC2. Não há instruções destrutivas ou quebras nas
-- tabelas existentes de e-mail marketing.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PASTAS DE LANDING PAGES
CREATE TABLE IF NOT EXISTS page_folders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_folders_user ON page_folders(user_id);

-- 2. TABELA DE PROJETOS DE LANDING PAGES
CREATE TABLE IF NOT EXISTS landing_pages (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(64) DEFAULT 'lead-capture',
    status VARCHAR(32) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
    folder VARCHAR(100) DEFAULT 'Geral',
    folder_id VARCHAR(64) REFERENCES page_folders(id) ON DELETE SET NULL,
    published_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    thumbnail_data TEXT,
    json_content JSONB NOT NULL,
    compiled_html TEXT,
    seo_settings JSONB DEFAULT '{}'::jsonb,
    tracking_settings JSONB DEFAULT '{}'::jsonb,
    global_settings JSONB DEFAULT '{}'::jsonb,
    version INT DEFAULT 1,
    views_count INT DEFAULT 0,
    conversions_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_user ON landing_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_status ON landing_pages(status);
CREATE INDEX IF NOT EXISTS idx_landing_pages_category ON landing_pages(category);

-- 3. TABELA DE LEADS CAPTURADOS PELOS FORMULÁRIOS DAS PÁGINAS
CREATE TABLE IF NOT EXISTS page_leads (
    id VARCHAR(64) PRIMARY KEY,
    page_id VARCHAR(64) NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    page_slug VARCHAR(255) NOT NULL,
    form_id VARCHAR(64) DEFAULT 'default-form',
    data JSONB NOT NULL,
    lgpd_accepted BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_leads_page_id ON page_leads(page_id);
CREATE INDEX IF NOT EXISTS idx_page_leads_created_at ON page_leads(created_at);

-- 4. TABELA DE TEMPLATES OFICIAIS DE LANDING PAGES
CREATE TABLE IF NOT EXISTS page_templates (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    badge VARCHAR(64),
    json_content JSONB NOT NULL,
    compiled_html TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_templates_category ON page_templates(category);

-- 5. SEED INICIAL DE PASTAS PADRÃO PARA LANDING PAGES
INSERT INTO page_folders (id, user_id, name, color)
VALUES
    ('pfold-geral', 'user-lucas-01', 'Geral', '#64748b'),
    ('pfold-captura', 'user-lucas-01', 'Páginas de Captura', '#6366f1'),
    ('pfold-vendas', 'user-lucas-01', 'Páginas de Vendas', '#ec4899'),
    ('pfold-lancamentos', 'user-lucas-01', 'Lançamentos 2026', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;
