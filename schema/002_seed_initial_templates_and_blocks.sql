-- =============================================================================
-- VIER TAMPLAT - SCRIPT DE MIGRAÇÃO 002
-- Seed de Dados Iniciais: Categorias, Planos, Usuário Demo e Configurações
-- EC2 / Produção: Executar com psql ou ferramenta de migração compatível
-- =============================================================================

-- Inserção de Planos Padrão
INSERT INTO plans (id, name, description, price_monthly, price_yearly, max_projects, max_templates, max_storage_mb, allow_custom_html, allow_vml_outlook, is_active)
VALUES 
    ('starter', 'Starter', 'Ideal para profissionais autônomos e iniciantes', 49.00, 490.00, 5, 3, 100, true, true, true),
    ('pro', 'Profissional', 'Para empresas, agências e profissionais de marketing exigentes', 99.00, 990.00, 50, 30, 2000, true, true, true),
    ('enterprise', 'Enterprise', 'Acesso ilimitado, suporte prioritário e recursos dedicados', 249.00, 2490.00, 9999, 9999, 20000, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Inserção de Categorias de Templates
INSERT INTO template_categories (id, name, slug, description, icon, display_order, is_active)
VALUES
    ('cat-ecommerce', 'E-commerce', 'ecommerce', 'Lançamentos de produto, cupons, Black Friday, carrinho abandonado e ofertas', 'shopping-bag', 1, true),
    ('cat-corporativo', 'Corporativo', 'corporativo', 'Newsletters empresariais, comunicados, convites, propostas e institucionais', 'briefcase', 2, true),
    ('cat-relacionamento', 'Relacionamento', 'relacionamento', 'Boas-vindas, aniversário, datas comemorativas, webinars e reengajamento', 'heart-handshake', 3, true),
    ('cat-promocional', 'Promocional', 'promocional', 'Campanhas de queima de estoque, flash sale, frete grátis e novidades', 'tag', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Inserção de Usuário Padrão Admin / Lucas
INSERT INTO users (id, name, email, role, company, plan_id)
VALUES 
    ('user-lucas-01', 'Lucas (Administrador)', 'lucas@viertamplat.com.br', 'admin', 'Vier Tamplat SaaS', 'enterprise')
ON CONFLICT (id) DO NOTHING;

-- Configurações Globais
INSERT INTO system_settings (key, value)
VALUES
    ('smtp_settings', '{"provider": "simulator", "senderName": "Vier Tamplat", "senderEmail": "contato@viertamplat.com.br"}'),
    ('general_settings', '{"platformName": "Vier Tamplat", "defaultWidth": 600, "allowPublicRegistration": true}')
ON CONFLICT (key) DO NOTHING;
