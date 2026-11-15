-- =============================================================================
-- VIER TAMPLAT - SCRIPT DE MIGRAÇÃO 001
-- Criação da estrutura de tabelas PostgreSQL para o SaaS Vier Tamplat
-- EC2 / Produção: Executar com psql ou ferramenta de migração compatível
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(32) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
    avatar_url TEXT,
    company VARCHAR(255),
    plan_id VARCHAR(64) DEFAULT 'pro',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE PLANOS SAAS
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly NUMERIC(10,2) DEFAULT 0,
    price_yearly NUMERIC(10,2) DEFAULT 0,
    max_projects INT DEFAULT 10,
    max_templates INT DEFAULT 5,
    max_storage_mb INT DEFAULT 500,
    allow_custom_html BOOLEAN DEFAULT TRUE,
    allow_vml_outlook BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE CATEGORIAS DE TEMPLATES
CREATE TABLE IF NOT EXISTS template_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(64),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE PROJETOS DE E-MAIL DOS USUÁRIOS
CREATE TABLE IF NOT EXISTS email_projects (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'favorite')),
    category_id VARCHAR(64) REFERENCES template_categories(id) ON DELETE SET NULL,
    thumbnail_data TEXT,
    json_content JSONB NOT NULL,
    compiled_html TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_projects_user_id ON email_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_email_projects_status ON email_projects(status);

-- 5. TABELA DE MODELOS PRONTOS (TEMPLATES OFICIAIS E PÚBLICOS)
CREATE TABLE IF NOT EXISTS official_templates (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(64) REFERENCES template_categories(id) ON DELETE SET NULL,
    badge VARCHAR(64),
    thumbnail_url TEXT,
    json_content JSONB NOT NULL,
    compiled_html TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_official_templates_cat ON official_templates(category_id);

-- 6. TABELA DE BLOCOS REUTILIZÁVEIS E SALVOS
CREATE TABLE IF NOT EXISTS saved_blocks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) DEFAULT 'custom',
    preview_icon VARCHAR(64) DEFAULT 'layout',
    block_data JSONB NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_blocks_user ON saved_blocks(user_id);

-- 7. TABELA DE ARQUIVOS E GERENCIADOR DE MÍDIA
CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    folder_path VARCHAR(255) DEFAULT '/',
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    width INT,
    height INT,
    alt_text VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_assets_user_folder ON media_assets(user_id, folder_path);

-- 8. TABELA DE LOGS DE TESTE E AUDITORIA
CREATE TABLE IF NOT EXISTS email_test_logs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES email_projects(id) ON DELETE SET NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    status VARCHAR(32) DEFAULT 'sent',
    provider_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABELA DE CONFIGURAÇÕES GLOBAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
