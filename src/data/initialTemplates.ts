import { TemplateModel, EmailDocument } from '../types/email';

export const INITIAL_TEMPLATES: TemplateModel[] = [
  // ================= MONETTER & PH - MERCADO FINANCEIRO / SUPER LIVE =================
  {
    id: 'tmpl-monetter-superlive-ph',
    name: 'Monetter — Já teve prejuízo no trading? (Super Live com PH)',
    category: 'promocional',
    categoryLabel: 'Mercado Financeiro',
    description: 'Template oficial de alta conversão para o nicho de trading e mercado financeiro. Chamada exclusiva para o Grupo VIP e Super Live com o PH, recuperação de loss e 10 premiações.',
    badge: 'Super Live Exclusiva',
    thumbnailUrl: 'https://files.catbox.moe/tn263p.jpg',
    document: {
      id: 'doc-monetter-superlive-01',
      name: 'Monetter — Já teve prejuízo no trading? (Super Live com PH)',
      subject: 'Já teve prejuízo no trading? 👀 (Super Live com PH nos dias 19 e 20/11)',
      preheader: 'PH vai revelar na Super Live erros que muitos traders cometem e como virar a chave. +10 premiações ao vivo.',
      folder: 'Campanhas 2026',
      globalSettings: {
        containerWidth: 600,
        bodyBgColor: '#080a0f',
        contentBgColor: '#0f141f',
        defaultFontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
        defaultTextColor: '#cbd5e1',
        defaultHeadingColor: '#ffffff',
        defaultLinkColor: '#ff6b00',
        defaultButtonBg: '#ff6b00',
        defaultButtonTextColor: '#ffffff',
        defaultButtonRadius: 8,
        containerBorderWidth: 1,
        containerBorderColor: '#1e293b',
        containerRadius: 12,
        sectionSpacing: 0
      },
      createdAt: '2026-11-15T15:55:00Z',
      updatedAt: '2026-11-15T15:55:00Z',
      rows: [
        // 1. Barra de Topo / Marca Monetter
        {
          id: 'row-monetter-header',
          layout: '1-col',
          style: {
            backgroundColor: '#0f141f',
            paddingTop: 18,
            paddingBottom: 16,
            paddingLeft: 24,
            paddingRight: 24
          },
          columns: [
            {
              id: 'col-monetter-header',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                {
                  id: 'blk-monetter-header-text',
                  type: 'header',
                  content: {
                    brandText: 'MONETTER',
                    sloganText: '• NEGOCIE MAIS ATIVOS',
                    badgeText: '🔴 SUPER LIVE VIP',
                    badgeUrl: '#',
                    brandColor: '#ffffff',
                    sloganColor: '#ff6b00',
                    badgeBg: '#ff6b00',
                    badgeTextColor: '#ffffff'
                  },
                  style: { marginTop: 0, marginBottom: 0 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // 2. Banner Hero Principal (Imagem Oficial enviada)
        {
          id: 'row-monetter-banner',
          layout: '1-col',
          style: {
            backgroundColor: '#0f141f',
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0
          },
          columns: [
            {
              id: 'col-monetter-banner',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                {
                  id: 'blk-monetter-hero-img',
                  type: 'image',
                  content: {
                    url: 'https://files.catbox.moe/tn263p.jpg',
                    alt: 'Já teve prejuízo no trading com essas corretoras? Não perca a Super Live com o PH nos dias 19 e 20/11',
                    link: 'https://chat.whatsapp.com/exemplo-grupo-vip-ph',
                    width: '100%'
                  },
                  style: {
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // 3. Título / Pergunta Provocativa
        {
          id: 'row-monetter-headline',
          layout: '1-col',
          style: {
            backgroundColor: '#0f141f',
            paddingTop: 32,
            paddingBottom: 10,
            paddingLeft: 28,
            paddingRight: 28
          },
          columns: [
            {
              id: 'col-monetter-headline',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                {
                  id: 'blk-monetter-title',
                  type: 'heading',
                  content: {
                    text: 'Já teve prejuízo no trading? 👀',
                    level: 1
                  },
                  style: {
                    color: '#ffffff',
                    fontSize: 26,
                    fontWeight: 800,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    marginTop: 0,
                    marginBottom: 8
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // 4. Copy do Evento & Box de Horários
        {
          id: 'row-monetter-body',
          layout: '1-col',
          style: {
            backgroundColor: '#0f141f',
            paddingTop: 4,
            paddingBottom: 20,
            paddingLeft: 28,
            paddingRight: 28
          },
          columns: [
            {
              id: 'col-monetter-body',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                {
                  id: 'blk-monetter-copy-p1',
                  type: 'text',
                  content: {
                    text: 'Nos dias <strong>19 e 20/11</strong>, o <strong>PH</strong> vai revelar na <strong>Super Live</strong> os erros que muitos traders cometem todos os dias sem perceber — e compartilhar as estratégias práticas de análise de mercado e gestão de risco profissional que você precisa para virar o jogo.'
                  },
                  style: {
                    color: '#e2e8f0',
                    fontSize: 16,
                    lineHeight: 1.6,
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 20
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-monetter-schedule-box',
                  type: 'html',
                  content: {
                    html: `
                      <div style="background: linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,107,0,0.04)); border: 1px solid #ff6b00; border-radius: 12px; padding: 18px 24px; text-align: center; margin-bottom: 8px;">
                        <p style="color: #ff8a00; font-size: 13px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 1px;">🗓️ DATAS & HORÁRIOS CONFIRMADOS</p>
                        <p style="color: #ffffff; font-size: 16px; font-weight: 800; margin: 0 0 4px 0;">Dias 19 e 20 de Novembro</p>
                        <p style="color: #cbd5e1; font-size: 14px; margin: 0;">
                          <span style="color: #ffffff; font-weight: 700;">1º Turno:</span> 12h às 14h &nbsp;•&nbsp; <span style="color: #ffffff; font-weight: 700;">2º Turno:</span> 20h às 22h
                        </p>
                      </div>
                    `
                  },
                  style: { marginTop: 0, marginBottom: 0 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // 5. Os 3 Cards de Benefícios (Erros, Estratégias, Gestão)
        {
          id: 'row-monetter-cards',
          layout: '1-col',
          style: {
            backgroundColor: '#07090e',
            paddingTop: 8,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24
          },
          columns: [
            {
              id: 'col-monetter-cards',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                {
                  id: 'blk-cards-section-title',
                  type: 'heading',
                  content: {
                    text: 'O que o PH vai entregar para você:',
                    level: 2
                  },
                  style: {
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginTop: 8,
                    marginBottom: 20
                  },
                  deviceVisibility: 'all'
                },
                // Card 1: Erros que travam seus resultados
                {
                  id: 'blk-card-1',
                  type: 'topic-card',
                  content: {
                    icon: '🎯',
                    iconImage: '',
                    title: 'Erros que travam seus resultados',
                    description: 'Entenda o que faz tantos traders perderem dinheiro sem perceber.',
                    dividerColor: '#ff6b00',
                    bgColor: '#101522',
                    borderColor: '#1e293d',
                    titleColor: '#ffffff',
                    descColor: '#94a3b8'
                  },
                  style: { marginTop: 0, marginBottom: 12 },
                  deviceVisibility: 'all'
                },
                // Card 2: Estratégias práticas de análise
                {
                  id: 'blk-card-2',
                  type: 'topic-card',
                  content: {
                    icon: '📊',
                    iconImage: '',
                    title: 'Estratégias práticas de análise',
                    description: 'Aprenda leituras e decisões mais conscientes para o mercado.',
                    dividerColor: '#ff6b00',
                    bgColor: '#101522',
                    borderColor: '#1e293d',
                    titleColor: '#ffffff',
                    descColor: '#94a3b8'
                  },
                  style: { marginTop: 0, marginBottom: 12 },
                  deviceVisibility: 'all'
                },
                // Card 3: Gestão de risco profissional
                {
                  id: 'blk-card-3',
                  type: 'topic-card',
                  content: {
                    icon: '🛡️',
                    iconImage: '',
                    title: 'Gestão de risco profissional',
                    description: 'Saiba como proteger melhor sua banca e evitar decisões por impulso.',
                    dividerColor: '#ff6b00',
                    bgColor: '#101522',
                    borderColor: '#1e293d',
                    titleColor: '#ffffff',
                    descColor: '#94a3b8'
                  },
                  style: { marginTop: 0, marginBottom: 12 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // 6. Seção com BACKGROUND DE GRÁFICOS (Candlesticks), Box da Live, CTA 2 e Rodapé Oficial
        {
          id: 'row-monetter-charts-section',
          layout: '1-col',
          style: {
            backgroundColor: '#07090e',
            paddingTop: 24,
            paddingBottom: 40,
            paddingLeft: 24,
            paddingRight: 24
          },
          columns: [
            {
              id: 'col-monetter-charts-content',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                // Box da Super Live com PH com borda neon e ícone calendário
                {
                  id: 'blk-schedule-glowing-box',
                  type: 'schedule-box',
                  content: {
                    icon: '📅',
                    iconImage: '',
                    badge: 'DATAS & HORÁRIOS CONFIRMADOS',
                    title: 'Super Live com PH',
                    dates: 'Dias 19 e 20 de Novembro',
                    times: '1º Turno: 12h às 14h • 2º Turno: 20h às 22h',
                    accentColor: '#ff6b00',
                    bgColor: 'rgba(11, 15, 25, 0.92)',
                    borderColor: '#ff6b00'
                  },
                  style: { marginTop: 0, marginBottom: 24 },
                  deviceVisibility: 'all'
                },
                // Botão de Alta Conversão "GARANTIR MEU ACESSO >>"
                {
                  id: 'blk-btn-garantir-acesso',
                  type: 'button',
                  content: {
                    text: 'GARANTIR MEU ACESSO >>',
                    link: 'https://chat.whatsapp.com/exemplo-grupo-vip-ph'
                  },
                  style: {
                    backgroundColor: '#ff6b00',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 800,
                    borderRadius: 10,
                    paddingTop: 18,
                    paddingBottom: 18,
                    paddingLeft: 32,
                    paddingRight: 32,
                    textAlign: 'center',
                    width: '100%',
                    marginTop: 0,
                    marginBottom: 32
                  },
                  deviceVisibility: 'all'
                },
                // Rodapé Oficial Monetter com disclaimer e assinatura
                {
                  id: 'blk-footer-monetter-official',
                  type: 'html',
                  content: {
                    html: `
                      <div style="text-align: center; padding-top: 10px;">
                        <!-- Logo Monetter Oficial -->
                        <div style="margin-bottom: 10px;">
                          <span style="color: #ffffff; font-size: 17px; font-weight: 800; letter-spacing: 0.5px; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
                            <span style="color: #ff6b00; font-size: 20px; vertical-align: middle; margin-right: 4px;">◈</span>Monetter
                          </span>
                          <div style="color: #ff6b00; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                            NEGOCIE MAIS ATIVOS
                          </div>
                        </div>

                        <!-- Tagline & Disclaimer exatamente como na imagem -->
                        <p style="color: #cbd5e1; font-size: 13px; font-style: italic; margin: 0 0 6px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
                          Monetter — Visão de Gigante
                        </p>
                        <p style="color: #64748b; font-size: 11px; font-style: italic; line-height: 16px; margin: 0 0 16px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
                          Trading envolve riscos. Premiações sujeitas a regulamento.
                        </p>

                        <!-- Links de descadastro -->
                        <p style="margin: 0; font-size: 11px; color: #475569;">
                          <a href="#" style="color: #64748b; text-decoration: underline;">Gerenciar Preferências</a> &nbsp;|&nbsp; 
                          <a href="#" style="color: #64748b; text-decoration: underline;">Descadastrar</a>
                        </p>
                      </div>
                    `
                  },
                  style: { marginTop: 0, marginBottom: 0 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ================= AM OUTLET - BLACK FRIDAY (OFICIAL) =================
  {
    id: 'tmpl-am-outlet-black-friday',
    name: 'Black Friday AM Outlet — 5% em todo o site',
    category: 'ecommerce',
    categoryLabel: 'E-commerce',
    description: 'Template oficial AM Outlet: layout minimalista luxo, logo, banner Black Friday, copy de alta conversão, vitrine de produtos e caixa de urgência.',
    badge: 'Black Friday Oficial',
    thumbnailUrl: 'https://files.catbox.moe/a0gzd5.jpg',
    document: {
      id: 'doc-am-outlet-01',
      name: 'Black Friday AM Outlet — 5% em todo o site',
      subject: 'Black Friday AM Outlet — 5% em todo o site',
      preheader: 'A Black Friday da AM Outlet começou: aproveite 5% de desconto em todo o site.',
      folder: 'Campanhas 2026',
      globalSettings: {
        containerWidth: 680,
        bodyBgColor: '#ececec',
        contentBgColor: '#ffffff',
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultTextColor: '#4a4a4a',
        defaultHeadingColor: '#111111',
        defaultLinkColor: '#111111',
        defaultButtonBg: '#111111',
        defaultButtonTextColor: '#ffffff',
        defaultButtonRadius: 4,
        containerBorderWidth: 0,
        containerBorderColor: '#e7e7e7',
        containerRadius: 0,
        sectionSpacing: 0
      },
      createdAt: '2026-11-05T20:00:00Z',
      updatedAt: '2026-11-05T22:00:00Z',
      rows: [
        // Linha 1: Logotipo AM Outlet
        {
          id: 'row-am-logo',
          layout: '1-col',
          style: {
            backgroundColor: '#111111',
            paddingTop: 25,
            paddingBottom: 22,
            paddingLeft: 20,
            paddingRight: 20
          },
          columns: [
            {
              id: 'col-am-logo',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                {
                  id: 'blk-am-logo',
                  type: 'logo',
                  content: {
                    url: 'https://acdn-us.mitiendanube.com/stores/004/400/645/themes/common/logo-6749803262383629887-1790004801-09b6495c50e737a6a62fcb794fa051671790004801.png?0',
                    alt: 'AM Outlet',
                    link: 'https://amoutlet.com.br/?utm_source=email&utm_medium=email&utm_campaign=black_friday_5_off',
                    width: 150
                  },
                  style: {
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 2: Banner Hero Black Friday
        {
          id: 'row-am-banner',
          layout: '1-col',
          style: {
            backgroundColor: '#f2f2f2',
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0
          },
          columns: [
            {
              id: 'col-am-banner',
              widthPercentage: 100,
              style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
              blocks: [
                {
                  id: 'blk-am-banner-img',
                  type: 'image',
                  content: {
                    url: 'https://files.catbox.moe/a0gzd5.jpg',
                    alt: 'Black Friday AM Outlet — todo o site com 5% de desconto',
                    link: 'https://amoutlet.com.br/?utm_source=email&utm_medium=email&utm_campaign=black_friday_5_off&utm_content=banner',
                    width: '100%'
                  },
                  style: {
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0,
                    borderRadius: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 3: Headline, Texto e CTA Principal
        {
          id: 'row-am-copy',
          layout: '1-col',
          style: {
            backgroundColor: '#ffffff',
            paddingTop: 42,
            paddingBottom: 40,
            paddingLeft: 46,
            paddingRight: 46
          },
          columns: [
            {
              id: 'col-am-copy',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-am-eyebrow',
                  type: 'heading',
                  content: {
                    text: 'BLACK FRIDAY AM OUTLET',
                    level: 'h3'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 12,
                    lineHeight: 1.5,
                    letterSpacing: 3,
                    fontWeight: 700,
                    color: '#b88a2a',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    marginTop: 0,
                    marginBottom: 10
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-headline',
                  type: 'heading',
                  content: {
                    text: 'SEU PRÓXIMO DESTAQUE\nJÁ ESTÁ AQUI.',
                    level: 'h1'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 38,
                    lineHeight: 1.15,
                    fontWeight: 800,
                    color: '#111111',
                    letterSpacing: -1,
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 18
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-body-1',
                  type: 'text',
                  content: {
                    html: 'Durante a Black Friday, <strong style="color:#111111;">todo o site está com 5% de desconto.</strong>',
                    text: 'Durante a Black Friday, todo o site está com 5% de desconto.'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: '#4a4a4a',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 14
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-body-2',
                  type: 'text',
                  content: {
                    html: 'Aproveite para escolher peças que combinam presença, acabamento e sofisticação — antes que os modelos mais disputados saiam de estoque.',
                    text: 'Aproveite para escolher peças que combinam presença, acabamento e sofisticação — antes que os modelos mais disputados saiam de estoque.'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: '#4a4a4a',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 28
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-cta-btn',
                  type: 'button',
                  content: {
                    text: 'APROVEITAR 5% OFF  →',
                    url: 'https://amoutlet.com.br/?utm_source=email&utm_medium=email&utm_campaign=black_friday_5_off&utm_content=cta_principal',
                    fullWidth: false
                  },
                  style: {
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    paddingTop: 16,
                    paddingBottom: 16,
                    paddingLeft: 34,
                    paddingRight: 34,
                    borderRadius: 4,
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 4: Divisor Fino
        {
          id: 'row-am-divider',
          layout: '1-col',
          style: {
            backgroundColor: '#ffffff',
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 40,
            paddingRight: 40
          },
          columns: [
            {
              id: 'col-am-divider',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-am-divider',
                  type: 'divider',
                  content: {},
                  style: {
                    borderColor: '#e7e7e7',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 5: Título da Vitrine
        {
          id: 'row-am-showcase-header',
          layout: '1-col',
          style: {
            backgroundColor: '#ffffff',
            paddingTop: 38,
            paddingBottom: 26,
            paddingLeft: 46,
            paddingRight: 46
          },
          columns: [
            {
              id: 'col-am-showcase-header',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-am-showcase-eyebrow',
                  type: 'heading',
                  content: {
                    text: 'SELEÇÃO AM OUTLET',
                    level: 'h3'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 12,
                    lineHeight: 1.5,
                    letterSpacing: 2.5,
                    fontWeight: 700,
                    color: '#b88a2a',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    marginTop: 0,
                    marginBottom: 8
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-showcase-title',
                  type: 'heading',
                  content: {
                    text: 'ESCOLHA O QUE COMBINA\nCOM A SUA PRESENÇA.',
                    level: 'h2'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 27,
                    lineHeight: 1.25,
                    fontWeight: 800,
                    color: '#111111',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 6: Vitrine com 3 Colunas (Camisetas, Loafers, Coletes)
        {
          id: 'row-am-products',
          layout: '3-col',
          style: {
            backgroundColor: '#ffffff',
            paddingTop: 0,
            paddingBottom: 18,
            paddingLeft: 12,
            paddingRight: 12
          },
          columns: [
            {
              id: 'col-am-prod-camisetas',
              widthPercentage: 33.333,
              style: {
                backgroundColor: '#f5f5f5',
                paddingTop: 0,
                paddingBottom: 20,
                paddingLeft: 12,
                paddingRight: 12
              },
              blocks: [
                {
                  id: 'blk-am-p1-img',
                  type: 'image',
                  content: {
                    url: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_9997-66be88d6a98713955c17879257591779-640-0.webp',
                    alt: 'Camisetas importadas AM Outlet',
                    link: 'https://amoutlet.com.br/produtos/camiseta-importada-11-pronta-entrega-1eyoc/?utm_source=email&utm_medium=email&utm_campaign=black_friday_5_off&utm_content=camisetas',
                    width: '100%'
                  },
                  style: {
                    borderRadius: 0,
                    marginTop: 0,
                    marginBottom: 18
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p1-title',
                  type: 'heading',
                  content: {
                    text: 'CAMISETAS',
                    level: 'h3'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 17,
                    lineHeight: 1.25,
                    fontWeight: 700,
                    color: '#111111',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 7
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p1-desc',
                  type: 'text',
                  content: {
                    html: 'Versatilidade com acabamento premium.',
                    text: 'Versatilidade com acabamento premium.'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: '#666666',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 15
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p1-cta',
                  type: 'text',
                  content: {
                    html: '<div style="text-align: center;"><a href="https://amoutlet.com.br/produtos/camiseta-importada-11-pronta-entrega-1eyoc/?utm_source=email&amp;utm_medium=email&amp;utm_campaign=black_friday_5_off&amp;utm_content=camisetas" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; font-weight: 800; letter-spacing: 1px; color: #111111; text-decoration: none; border-bottom: 2px solid #b88a2a; padding-bottom: 4px; display: inline-block;">VER MODELOS</a></div>',
                    text: 'VER MODELOS'
                  },
                  style: {
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            },
            {
              id: 'col-am-prod-loafers',
              widthPercentage: 33.333,
              style: {
                backgroundColor: '#f5f5f5',
                paddingTop: 0,
                paddingBottom: 20,
                paddingLeft: 12,
                paddingRight: 12
              },
              blocks: [
                {
                  id: 'blk-am-p2-img',
                  type: 'image',
                  content: {
                    url: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_9345-aa0c59bde831b0659d17875312406767-640-0.webp',
                    alt: 'Loafers AM Outlet',
                    link: 'https://amoutlet.com.br/produtos/loafer-importado-11-b77pj/?utm_source=email&utm_medium=email&utm_campaign=black_friday_5_off&utm_content=loafers',
                    width: '100%'
                  },
                  style: {
                    borderRadius: 0,
                    marginTop: 0,
                    marginBottom: 18
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p2-title',
                  type: 'heading',
                  content: {
                    text: 'LOAFERS',
                    level: 'h3'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 17,
                    lineHeight: 1.25,
                    fontWeight: 700,
                    color: '#111111',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 7
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p2-desc',
                  type: 'text',
                  content: {
                    html: 'Elegância e conforto em cada passo.',
                    text: 'Elegância e conforto em cada passo.'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: '#666666',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 15
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p2-cta',
                  type: 'text',
                  content: {
                    html: '<div style="text-align: center;"><a href="https://amoutlet.com.br/produtos/loafer-importado-11-b77pj/?utm_source=email&amp;utm_medium=email&amp;utm_campaign=black_friday_5_off&amp;utm_content=loafers" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; font-weight: 800; letter-spacing: 1px; color: #111111; text-decoration: none; border-bottom: 2px solid #b88a2a; padding-bottom: 4px; display: inline-block;">VER MODELOS</a></div>',
                    text: 'VER MODELOS'
                  },
                  style: {
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            },
            {
              id: 'col-am-prod-coletes',
              widthPercentage: 33.333,
              style: {
                backgroundColor: '#f5f5f5',
                paddingTop: 0,
                paddingBottom: 20,
                paddingLeft: 12,
                paddingRight: 12
              },
              blocks: [
                {
                  id: 'blk-am-p3-img',
                  type: 'image',
                  content: {
                    url: 'https://acdn-us.mitiendanube.com/stores/004/400/645/products/img_2599-359b4eb742e7340b4117816300103197-640-0.webp',
                    alt: 'Coletes AM Outlet',
                    link: 'https://amoutlet.com.br/produtos/colete-importado-11-pronta-entrega-u7py8/?utm_source=email&utm_medium=email&utm_campaign=black_friday_5_off&utm_content=coletes',
                    width: '100%'
                  },
                  style: {
                    borderRadius: 0,
                    marginTop: 0,
                    marginBottom: 18
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p3-title',
                  type: 'heading',
                  content: {
                    text: 'COLETES',
                    level: 'h3'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 17,
                    lineHeight: 1.25,
                    fontWeight: 700,
                    color: '#111111',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 7
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p3-desc',
                  type: 'text',
                  content: {
                    html: 'Camadas marcantes para composições premium.',
                    text: 'Camadas marcantes para composições premium.'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: '#666666',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 15
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-p3-cta',
                  type: 'text',
                  content: {
                    html: '<div style="text-align: center;"><a href="https://amoutlet.com.br/produtos/colete-importado-11-pronta-entrega-u7py8/?utm_source=email&amp;utm_medium=email&amp;utm_campaign=black_friday_5_off&amp;utm_content=coletes" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; font-weight: 800; letter-spacing: 1px; color: #111111; text-decoration: none; border-bottom: 2px solid #b88a2a; padding-bottom: 4px; display: inline-block;">VER MODELOS</a></div>',
                    text: 'VER MODELOS'
                  },
                  style: {
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 7: Urgência Final Caixa Escura
        {
          id: 'row-am-urgency',
          layout: '1-col',
          style: {
            backgroundColor: '#111111',
            paddingTop: 40,
            paddingBottom: 42,
            paddingLeft: 46,
            paddingRight: 46
          },
          columns: [
            {
              id: 'col-am-urgency',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-am-urg-eyebrow',
                  type: 'heading',
                  content: {
                    text: 'POR TEMPO LIMITADO',
                    level: 'h3'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 12,
                    lineHeight: 1.5,
                    letterSpacing: 2.5,
                    fontWeight: 700,
                    color: '#d2a338',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    marginTop: 0,
                    marginBottom: 8
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-urg-title',
                  type: 'heading',
                  content: {
                    text: '5% EM TODO O SITE.',
                    level: 'h2'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 28,
                    lineHeight: 1.25,
                    fontWeight: 800,
                    color: '#ffffff',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 13
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-urg-desc',
                  type: 'text',
                  content: {
                    html: 'Garanta suas escolhas antes que os tamanhos e modelos mais procurados acabem.',
                    text: 'Garanta suas escolhas antes que os tamanhos e modelos mais procurados acabem.'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: '#c7c7c7',
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 24
                  },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-am-urg-cta',
                  type: 'button',
                  content: {
                    text: 'COMPRAR AGORA  →',
                    url: 'https://amoutlet.com.br/?utm_source=email&utm_medium=email&utm_campaign=black_friday_5_off&utm_content=cta_final',
                    fullWidth: false
                  },
                  style: {
                    backgroundColor: '#ffffff',
                    color: '#111111',
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    paddingTop: 15,
                    paddingBottom: 15,
                    paddingLeft: 31,
                    paddingRight: 31,
                    borderRadius: 4,
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 8: Faixa de Benefícios
        {
          id: 'row-am-benefits',
          layout: '1-col',
          style: {
            backgroundColor: '#f4f4f4',
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 24,
            paddingRight: 24
          },
          columns: [
            {
              id: 'col-am-benefits',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-am-benefits-text',
                  type: 'text',
                  content: {
                    html: 'FOTOS REAIS &nbsp;•&nbsp; SELEÇÃO PREMIUM &nbsp;•&nbsp; ATENDIMENTO PERSONALIZADO',
                    text: 'FOTOS REAIS • SELEÇÃO PREMIUM • ATENDIMENTO PERSONALIZADO'
                  },
                  style: {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: 11,
                    lineHeight: 1.8,
                    letterSpacing: 1,
                    fontWeight: 700,
                    color: '#555555',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        // Linha 9: Rodapé Clean AM Outlet
        {
          id: 'row-am-footer',
          layout: '1-col',
          style: {
            backgroundColor: '#ffffff',
            paddingTop: 27,
            paddingBottom: 30,
            paddingLeft: 30,
            paddingRight: 30
          },
          columns: [
            {
              id: 'col-am-footer',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-am-footer-text',
                  type: 'text',
                  content: {
                    html: '<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#777777;">AM Outlet — Referência em importação de alto padrão.</p><p style="margin:0 0 13px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#999999;">Você recebeu este e-mail por fazer parte da nossa lista de novidades.</p><a href="{{ unsubscribe_url }}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#777777;text-decoration:underline;">Não quero mais receber estes e-mails</a>',
                    text: 'AM Outlet — Referência em importação de alto padrão.'
                  },
                  style: {
                    textAlign: 'center',
                    marginTop: 0,
                    marginBottom: 0
                  },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ================= E-COMMERCE =================
  {
    id: 'tmpl-ecom-black-friday',
    name: 'Black Friday Super Promoção',
    category: 'ecommerce',
    categoryLabel: 'E-commerce',
    description: 'Campanha de alta conversão com contagem, cupom de desconto e vitrine de produtos.',
    badge: 'Mais Vendido',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    document: {
      id: 'doc-bf-01',
      name: 'Black Friday Super Promoção',
      subject: '🔥 Black Friday Antecipada: até 60% OFF + Frete Grátis!',
      preheader: 'Aproveite descontos imperdíveis só até este fim de semana.',
      globalSettings: {
        containerWidth: 600,
        bodyBgColor: '#0f172a',
        contentBgColor: '#ffffff',
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultTextColor: '#334155',
        defaultHeadingColor: '#0f172a',
        defaultLinkColor: '#e11d48',
        defaultButtonBg: '#e11d48',
        defaultButtonTextColor: '#ffffff',
        defaultButtonRadius: 8,
        containerBorderWidth: 0,
        containerBorderColor: '#e2e8f0',
        containerRadius: 12,
        sectionSpacing: 16
      },
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-05T18:00:00Z',
      rows: [
        {
          id: 'row-header-bf',
          layout: '1-col',
          style: { backgroundColor: '#0f172a', paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-header-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-logo-bf',
                  type: 'logo',
                  content: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80', alt: 'Logo da Loja', width: 140 },
                  style: { textAlign: 'center' },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-hero-bf',
          layout: '1-col',
          style: { backgroundColor: '#ffffff', paddingTop: 32, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-hero-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-hero-badge',
                  type: 'heading',
                  content: { text: '⚡ OFERTA EXCLUSIVA PARA VOCÊ, {{nome}}!', level: 'h3' },
                  style: { color: '#e11d48', fontSize: 14, fontWeight: 800, textAlign: 'center', marginBottom: 8 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-hero-title',
                  type: 'heading',
                  content: { text: 'BLACK FRIDAY EXTRAORDINÁRIA', level: 'h1' },
                  style: { color: '#0f172a', fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-hero-text',
                  type: 'text',
                  content: { html: 'Preparamos as melhores condições do ano em todo o nosso catálogo. Garanta seus produtos favoritos antes que o estoque esgote!' },
                  style: { textAlign: 'center', fontSize: 16, color: '#475569', marginBottom: 20 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-coupon-bf',
                  type: 'coupon',
                  content: { code: 'BLACKFRIDAY60', discount: '60% DE DESCONTO', description: 'Insira o cupom no checkout para aplicar a condição especial.' },
                  style: { backgroundColor: '#fff1f2', borderColor: '#f43f5e' },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-hero-btn',
                  type: 'button',
                  content: { text: 'Aproveitar Descontos Agora →', url: 'https://seusite.com.br/black-friday', fullWidth: true },
                  style: { backgroundColor: '#e11d48', color: '#ffffff', fontSize: 16, paddingTop: 16, paddingBottom: 16, borderRadius: 8 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-products-bf',
          layout: '2-col-equal',
          style: { backgroundColor: '#f8fafc', paddingTop: 24, paddingBottom: 24, paddingLeft: 16, paddingRight: 16 },
          columns: [
            {
              id: 'col-prod-1',
              widthPercentage: 50,
              style: {},
              blocks: [
                {
                  id: 'blk-prod-1',
                  type: 'product',
                  content: {
                    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
                    title: 'Headphone Wireless Pro ANC',
                    oldPrice: 'R$ 799,00',
                    price: 'R$ 389,00',
                    buttonText: 'Comprar com 51% OFF',
                    buttonUrl: 'https://seusite.com.br/produto-1'
                  },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            },
            {
              id: 'col-prod-2',
              widthPercentage: 50,
              style: {},
              blocks: [
                {
                  id: 'blk-prod-2',
                  type: 'product',
                  content: {
                    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
                    title: 'Smartwatch Minimal Series 5',
                    oldPrice: 'R$ 649,00',
                    price: 'R$ 299,00',
                    buttonText: 'Comprar com 54% OFF',
                    buttonUrl: 'https://seusite.com.br/produto-2'
                  },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-footer-bf',
          layout: '1-col',
          style: { backgroundColor: '#0f172a', paddingTop: 32, paddingBottom: 32, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-foot-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-social-bf',
                  type: 'social',
                  content: {
                    items: [
                      { platform: 'instagram', url: 'https://instagram.com' },
                      { platform: 'facebook', url: 'https://facebook.com' },
                      { platform: 'whatsapp', url: 'https://whatsapp.com' }
                    ]
                  },
                  style: { textAlign: 'center' },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-foot-bf',
                  type: 'footer',
                  content: {
                    companyName: 'vierstudio Store S.A.',
                    address: 'Av. Brigadeiro Faria Lima, 2500 - São Paulo, SP',
                    unsubscribeUrl: '{{unsubscribe_link}}'
                  },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tmpl-ecom-abandoned-cart',
    name: 'Recuperação de Carrinho Abandonado',
    category: 'ecommerce',
    categoryLabel: 'E-commerce',
    description: 'Reengaje clientes que deixaram itens no carrinho com incentivo de frete e cupom.',
    badge: 'Alta Conversão',
    thumbnailUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
    document: {
      id: 'doc-cart-01',
      name: 'Recuperação de Carrinho Abandonado',
      subject: 'Você esqueceu algo especial no seu carrinho, {{nome}}! 🛒',
      preheader: 'Seus itens ainda estão reservados com um cupom especial de 10% OFF.',
      globalSettings: {
        containerWidth: 600,
        bodyBgColor: '#f1f5f9',
        contentBgColor: '#ffffff',
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultTextColor: '#334155',
        defaultHeadingColor: '#0f172a',
        defaultLinkColor: '#4f46e5',
        defaultButtonBg: '#4f46e5',
        defaultButtonTextColor: '#ffffff',
        defaultButtonRadius: 8,
        containerBorderWidth: 1,
        containerBorderColor: '#e2e8f0',
        containerRadius: 10,
        sectionSpacing: 16
      },
      createdAt: '2026-11-02T10:00:00Z',
      updatedAt: '2026-11-05T14:00:00Z',
      rows: [
        {
          id: 'row-cart-logo',
          layout: '1-col',
          style: { backgroundColor: '#ffffff', paddingTop: 24, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-c-logo',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-c-logo',
                  type: 'logo',
                  content: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80', alt: 'Logo', width: 130 },
                  style: { textAlign: 'center' },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-cart-content',
          layout: '1-col',
          style: { backgroundColor: '#ffffff', paddingTop: 16, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-c-body',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-c-title',
                  type: 'heading',
                  content: { text: 'Não deixe suas escolhas para trás!', level: 'h1' },
                  style: { textAlign: 'center', fontSize: 24, color: '#1e1b4b', fontWeight: 800, marginBottom: 8 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-c-desc',
                  type: 'text',
                  content: { html: 'Olá <strong>{{nome}}</strong>, notamos que você não concluiu seu pedido. Para te ajudar a finalizar com chave de ouro, liberamos um cupom de 10% exclusivo por 24 horas!' },
                  style: { textAlign: 'center', fontSize: 15, color: '#64748b', lineHeight: 1.6, marginBottom: 16 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-c-coupon',
                  type: 'coupon',
                  content: { code: 'VOLTA10', discount: '10% DE DESCONTO EXTRA', description: 'Válido para todo o carrinho até amanhã às 23:59' },
                  style: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-c-btn',
                  type: 'button',
                  content: { text: 'Finalizar Meu Pedido Agora →', url: 'https://seusite.com.br/checkout', fullWidth: true },
                  style: { backgroundColor: '#4f46e5', paddingTop: 14, paddingBottom: 14, fontSize: 16, borderRadius: 8 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-cart-footer',
          layout: '1-col',
          style: { backgroundColor: '#f8fafc', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-cf',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-cf-text',
                  type: 'footer',
                  content: { companyName: 'vierstudio Store', address: 'São Paulo - SP', unsubscribeUrl: '{{unsubscribe_link}}' },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ================= CORPORATIVO =================
  {
    id: 'tmpl-corp-newsletter',
    name: 'Newsletter Empresarial & Insights',
    category: 'corporativo',
    categoryLabel: 'Corporativo',
    description: 'Layout moderno e estruturado para boletins corporativos, artigos em destaque e novidades do setor.',
    badge: 'Popular',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    document: {
      id: 'doc-corp-01',
      name: 'Newsletter Empresarial & Insights',
      subject: 'Edição #42: Tendências do Mercado e Inovações Tecnológicas',
      preheader: 'Confira as principais notícias e análises estratégicas da semana.',
      globalSettings: {
        containerWidth: 600,
        bodyBgColor: '#f8fafc',
        contentBgColor: '#ffffff',
        defaultFontFamily: 'Helvetica, Arial, sans-serif',
        defaultTextColor: '#334155',
        defaultHeadingColor: '#0f172a',
        defaultLinkColor: '#2563eb',
        defaultButtonBg: '#0f172a',
        defaultButtonTextColor: '#ffffff',
        defaultButtonRadius: 6,
        containerBorderWidth: 1,
        containerBorderColor: '#e2e8f0',
        containerRadius: 8,
        sectionSpacing: 16
      },
      createdAt: '2026-11-03T11:00:00Z',
      updatedAt: '2026-11-05T12:00:00Z',
      rows: [
        {
          id: 'row-nl-head',
          layout: '1-col',
          style: { backgroundColor: '#ffffff', paddingTop: 24, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-nl-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-nl-logo',
                  type: 'logo',
                  content: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80', alt: 'Vier Insights', width: 140 },
                  style: { textAlign: 'left' },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-nl-nav',
                  type: 'nav',
                  content: {
                    links: [
                      { label: 'Artigos', url: '#' },
                      { label: 'Cases de Sucesso', url: '#' },
                      { label: 'Podcast', url: '#' },
                      { label: 'Portal', url: '#' }
                    ]
                  },
                  style: { textAlign: 'right' },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-nl-div',
                  type: 'divider',
                  content: {},
                  style: { borderColor: '#e2e8f0', borderWidth: 1, marginTop: 16, marginBottom: 16 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-nl-banner',
          layout: '1-col',
          style: { backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-nl-b1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-nl-hero',
                  type: 'hero',
                  content: {
                    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80',
                    title: 'Como a Inteligência Artificial está transformando a produtividade em 2026',
                    subtitle: 'Analisamos dados de mais de 500 corporações que adotaram agentes autônomos.',
                    ctaText: 'Ler Estudo Completo',
                    ctaUrl: 'https://seusite.com.br/artigo-ia'
                  },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-nl-sign',
          layout: '1-col',
          style: { backgroundColor: '#f8fafc', paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-nl-sign1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-nl-signature',
                  type: 'signature',
                  content: {
                    name: 'Lucas Silveira',
                    role: 'Chief Editor & Head of Strategy',
                    company: 'Vier Insights Corporate',
                    phone: '+55 (11) 3040-5000',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  },
                  style: {},
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-nl-foot',
                  type: 'footer',
                  content: { companyName: 'Vier Insights Corporate', address: 'São Paulo, Brasil', unsubscribeUrl: '{{unsubscribe_link}}' },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ================= RELACIONAMENTO =================
  {
    id: 'tmpl-rel-welcome',
    name: 'Boas-Vindas VIP & Onboarding',
    category: 'relacionamento',
    categoryLabel: 'Relacionamento',
    description: 'Receba seus novos membros e clientes com acolhimento, próximos passos e benefícios exclusivos.',
    badge: 'Essencial',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
    document: {
      id: 'doc-wel-01',
      name: 'Boas-Vindas VIP & Onboarding',
      subject: 'Seja muito bem-vindo à nossa comunidade, {{nome}}! 🚀',
      preheader: 'Tudo o que você precisa saber para começar a aproveitar sua conta ao máximo.',
      globalSettings: {
        containerWidth: 600,
        bodyBgColor: '#f5f3ff',
        contentBgColor: '#ffffff',
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultTextColor: '#334155',
        defaultHeadingColor: '#4338ca',
        defaultLinkColor: '#6366f1',
        defaultButtonBg: '#6366f1',
        defaultButtonTextColor: '#ffffff',
        defaultButtonRadius: 8,
        containerBorderWidth: 0,
        containerBorderColor: '#e2e8f0',
        containerRadius: 12,
        sectionSpacing: 16
      },
      createdAt: '2026-11-04T09:00:00Z',
      updatedAt: '2026-11-05T16:00:00Z',
      rows: [
        {
          id: 'row-w-head',
          layout: '1-col',
          style: { backgroundColor: '#6366f1', paddingTop: 36, paddingBottom: 36, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-w-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-w-title',
                  type: 'heading',
                  content: { text: 'É um prazer ter você conosco!', level: 'h1' },
                  style: { color: '#ffffff', fontSize: 26, fontWeight: 800, textAlign: 'center', marginBottom: 8 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-w-sub',
                  type: 'text',
                  content: { html: 'Olá <strong>{{nome}}</strong>, sua jornada começa agora. Preparamos uma experiência incrível para você.' },
                  style: { color: '#e0e7ff', fontSize: 16, textAlign: 'center', marginBottom: 0 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-w-body',
          layout: '1-col',
          style: { backgroundColor: '#ffffff', paddingTop: 28, paddingBottom: 28, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-wb-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-wb-head',
                  type: 'heading',
                  content: { text: 'Próximos 3 passos rápidos:', level: 'h2' },
                  style: { fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 12 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-wb-list',
                  type: 'text',
                  content: { html: '✅ <strong>1. Complete seu perfil:</strong> Preencha seus dados para receber recomendações sob medida.<br /><br />🚀 <strong>2. Acesse seu painel:</strong> Descubra todas as ferramentas disponíveis no seu plano.<br /><br />🎁 <strong>3. Resgate seu bônus de boas-vindas:</strong> Cupom exclusivo para novos cadastros.' },
                  style: { fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 20 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-wb-btn',
                  type: 'button',
                  content: { text: 'Acessar Meu Painel Agora →', url: 'https://seusite.com.br/dashboard', fullWidth: true },
                  style: { backgroundColor: '#6366f1', color: '#ffffff', fontSize: 16, paddingTop: 14, paddingBottom: 14, borderRadius: 8 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-w-foot',
          layout: '1-col',
          style: { backgroundColor: '#f8fafc', paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-wf-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-wf-social',
                  type: 'social',
                  content: {
                    items: [
                      { platform: 'instagram', url: 'https://instagram.com' },
                      { platform: 'linkedin', url: 'https://linkedin.com' },
                      { platform: 'youtube', url: 'https://youtube.com' }
                    ]
                  },
                  style: { textAlign: 'center' },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-wf-footer',
                  type: 'footer',
                  content: { companyName: 'vierstudio Comunidade', address: 'São Paulo, SP', unsubscribeUrl: '{{unsubscribe_link}}' },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // ================= PROMOCIONAL =================
  {
    id: 'tmpl-promo-flash-sale',
    name: 'Promoção Relâmpago 24 Horas',
    category: 'promocional',
    categoryLabel: 'Promocional',
    description: 'Gere urgência e impulsione vendas rápidas com contagem regressiva e oferta limitada.',
    badge: 'Urgência',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
    document: {
      id: 'doc-flash-01',
      name: 'Promoção Relâmpago 24 Horas',
      subject: '⏰ Só hoje: Toda a loja com 40% OFF + Brinde especial!',
      preheader: 'Oferta relâmpago válida exclusivamente nas próximas 24 horas.',
      globalSettings: {
        containerWidth: 600,
        bodyBgColor: '#fef2f2',
        contentBgColor: '#ffffff',
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultTextColor: '#334155',
        defaultHeadingColor: '#991b1b',
        defaultLinkColor: '#dc2626',
        defaultButtonBg: '#dc2626',
        defaultButtonTextColor: '#ffffff',
        defaultButtonRadius: 8,
        containerBorderWidth: 1,
        containerBorderColor: '#fee2e2',
        containerRadius: 10,
        sectionSpacing: 16
      },
      createdAt: '2026-11-04T14:00:00Z',
      updatedAt: '2026-11-05T17:00:00Z',
      rows: [
        {
          id: 'row-fl-1',
          layout: '1-col',
          style: { backgroundColor: '#dc2626', paddingTop: 28, paddingBottom: 28, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-fl-1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-fl-t1',
                  type: 'heading',
                  content: { text: '🚨 FLASH SALE 24 HORAS', level: 'h1' },
                  style: { color: '#ffffff', fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 6 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-fl-sub',
                  type: 'text',
                  content: { html: 'Descontos automáticos aplicados diretamente no carrinho.' },
                  style: { color: '#fee2e2', fontSize: 16, textAlign: 'center', marginBottom: 0 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-fl-prod',
          layout: '1-col',
          style: { backgroundColor: '#ffffff', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-fl-p1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-fl-img',
                  type: 'image',
                  content: { url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80', alt: 'Coleção em Destaque', width: '100%' },
                  style: { borderRadius: 8, marginBottom: 16 },
                  deviceVisibility: 'all'
                },
                {
                  id: 'blk-fl-btn',
                  type: 'button',
                  content: { text: 'Garantir Ofertas Relâmpago →', url: 'https://seusite.com.br/flash-sale', fullWidth: true },
                  style: { backgroundColor: '#dc2626', paddingTop: 16, paddingBottom: 16, fontSize: 17, borderRadius: 8 },
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        },
        {
          id: 'row-fl-foot',
          layout: '1-col',
          style: { backgroundColor: '#f8fafc', paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 },
          columns: [
            {
              id: 'col-fl-f1',
              widthPercentage: 100,
              style: {},
              blocks: [
                {
                  id: 'blk-fl-footer',
                  type: 'footer',
                  content: { companyName: 'vierstudio Flash Deals', address: 'São Paulo - SP', unsubscribeUrl: '{{unsubscribe_link}}' },
                  style: {},
                  deviceVisibility: 'all'
                }
              ]
            }
          ]
        }
      ]
    }
  }
];
