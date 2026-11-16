-- =============================================================================
-- VIER TAMPLAT / VIER STUDIO - SCRIPT DE MIGRAÇÃO 007
-- Otimização e Segurança de Hospedagem de Imagens & Compatibilidade Brevo
-- EC2 / Produção: Executar com psql ou ferramenta de migração PostgreSQL
-- =============================================================================

-- 1. EVOLUÇÃO DA TABELA DE MÍDIA (media_assets)
-- Adiciona colunas para controle de CDN pública, checksum de integridade e auditoria
ALTER TABLE media_assets 
    ADD COLUMN IF NOT EXISTS public_cdn_url TEXT,
    ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(64) DEFAULT 'local_cdn',
    ADD COLUMN IF NOT EXISTS checksum_sha256 VARCHAR(64),
    ADD COLUMN IF NOT EXISTS is_published_for_email BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_media_assets_published ON media_assets(is_published_for_email);
CREATE INDEX IF NOT EXISTS idx_media_assets_checksum ON media_assets(checksum_sha256);

-- 2. TABELA DE BACKUPS DE TEMPLATES ANTES DE MIGRAÇÕES DE IMAGENS
-- Garante recuperação de versão anterior caso qualquer migração de Base64 precise ser revertida
CREATE TABLE IF NOT EXISTS email_template_backups (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES email_projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) DEFAULT 'base64_migration',
    json_content_backup JSONB NOT NULL,
    replaced_images_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_template_backups_project ON email_template_backups(project_id);

-- Comentário explicativo para administradores de banco no EC2
COMMENT ON TABLE email_template_backups IS 'Armazena snapshots de templates antes de conversões automáticas de Base64 para URLs públicas CDN.';
