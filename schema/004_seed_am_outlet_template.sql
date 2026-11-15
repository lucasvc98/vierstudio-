-- =============================================================================
-- VIER TAMPLAT - SCRIPT DE MIGRAÇÃO 004
-- Inserção do Template Oficial AM Outlet Black Friday 5% OFF
-- EC2 / Produção: Executar com psql ou ferramenta de migração compatível
-- =============================================================================

INSERT INTO templates (
    id,
    name,
    category_id,
    description,
    badge,
    thumbnail_url,
    content_json,
    is_public,
    is_featured
)
VALUES (
    'tmpl-am-outlet-black-friday',
    'Black Friday AM Outlet — 5% em todo o site',
    'cat-ecommerce',
    'Template oficial AM Outlet: layout minimalista luxo, logo, banner Black Friday, cópia de alta conversão, vitrine de produtos e caixa de urgência.',
    'Black Friday Oficial',
    '/templates/am-outlet/banner-black-friday.jpg',
    '{"id":"doc-am-outlet-01","name":"Black Friday AM Outlet — 5% em todo o site","subject":"Black Friday AM Outlet — 5% em todo o site","preheader":"A Black Friday da AM Outlet começou: aproveite 5% de desconto em todo o site.","globalSettings":{"containerWidth":680,"bodyBgColor":"#ececec","contentBgColor":"#ffffff","defaultFontFamily":"Arial, Helvetica, sans-serif","defaultTextColor":"#4a4a4a","defaultHeadingColor":"#111111","defaultLinkColor":"#111111","defaultButtonBg":"#111111","defaultButtonTextColor":"#ffffff","defaultButtonRadius":4,"containerBorderWidth":0,"containerBorderColor":"#e7e7e7","containerRadius":0,"sectionSpacing":0}}'::jsonb,
    true,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    badge = EXCLUDED.badge,
    thumbnail_url = EXCLUDED.thumbnail_url,
    content_json = EXCLUDED.content_json;
