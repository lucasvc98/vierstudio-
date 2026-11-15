-- =============================================================================
-- VIER TAMPLAT - SCRIPT DE MIGRAÇÃO 003
-- Criação de Pastas de Organização para Templates e E-mails
-- EC2 / Produção: Executar com psql ou ferramenta de migração compatível
-- =============================================================================

-- 1. TABELA DE PASTAS DE PROJETOS E TEMPLATES
CREATE TABLE IF NOT EXISTS project_folders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32) DEFAULT '#6366f1',
    icon VARCHAR(64) DEFAULT 'folder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_folders_user ON project_folders(user_id);

-- 2. ADIÇÃO DE COLUNA FOLDER_ID NA TABELA EMAIL_PROJECTS
ALTER TABLE email_projects 
ADD COLUMN IF NOT EXISTS folder VARCHAR(100) DEFAULT 'Geral';

ALTER TABLE email_projects 
ADD COLUMN IF NOT EXISTS folder_id VARCHAR(64) REFERENCES project_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_email_projects_folder ON email_projects(folder);

-- 3. PASTAS INICIAIS DE DEMONSTRAÇÃO
INSERT INTO project_folders (id, user_id, name, color, icon)
VALUES
    ('fold-geral', 'user-lucas-01', 'Geral', '#64748b', 'folder'),
    ('fold-campanhas', 'user-lucas-01', 'Campanhas 2026', '#6366f1', 'folder'),
    ('fold-ecommerce', 'user-lucas-01', 'E-commerce & Vendas', '#ec4899', 'folder'),
    ('fold-transacionais', 'user-lucas-01', 'Transacionais & Onboarding', '#059669', 'folder')
ON CONFLICT (id) DO NOTHING;
