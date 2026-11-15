-- =============================================================================
-- VIER STUDIO - SCRIPT DE MIGRAÇÃO 006
-- Módulo Miro Mind Maps & Flowcharts: Criação das tabelas de Boards, Pastas,
-- Conexões e Templates de Mapas Mentais
-- 
-- ATENÇÃO AMBIENTE EC2 (AMAZON):
-- Executar este script via psql ou ferramenta de migração compatível no banco
-- PostgreSQL da instância EC2. Não há instruções destrutivas ou quebras nas
-- tabelas existentes de e-mail marketing ou page builder.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PASTAS DE BOARDS / MAPAS MENTAIS
CREATE TABLE IF NOT EXISTS board_folders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32) DEFAULT '#f59e0b',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_board_folders_user ON board_folders(user_id);

-- 2. TABELA DE BOARDS / MAPAS MENTAIS (ESTILO MIRO)
CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) DEFAULT 'custom',
    folder VARCHAR(100) DEFAULT 'Geral',
    folder_id VARCHAR(64) REFERENCES board_folders(id) ON DELETE SET NULL,
    thumbnail_url TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    connections JSONB NOT NULL DEFAULT '[]'::jsonb,
    viewport JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_boards_user ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_folder ON boards(folder);
CREATE INDEX IF NOT EXISTS idx_boards_category ON boards(category);

-- 3. TABELA DE TEMPLATES DE BOARDS (FLUXOGRAMAS, RETROSPECTIVAS, MAPAS)
CREATE TABLE IF NOT EXISTS board_templates (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    badge VARCHAR(64),
    thumbnail_url TEXT,
    document JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_board_templates_category ON board_templates(category);

-- 4. SEED DE PASTAS PADRÃO
INSERT INTO board_folders (id, user_id, name, color)
VALUES
    ('bfold-geral', 'user-lucas-01', 'Geral', '#f59e0b'),
    ('bfold-modelos', 'user-lucas-01', 'Modelos Prontos', '#3b82f6'),
    ('bfold-projetos', 'user-lucas-01', 'Projetos', '#10b981'),
    ('bfold-estrategia', 'user-lucas-01', 'Estratégia 2026', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;
