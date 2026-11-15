import { SavedBlockItem, EmailRow } from '../types/email';

export const PRESET_SAVED_BLOCKS: SavedBlockItem[] = [
  {
    id: 'blk-preset-header-logo',
    name: 'Cabeçalho Minimalista com Logo',
    category: 'header',
    icon: 'layout',
    isRow: true,
    block: {
      id: 'row-preset-head-1',
      layout: '1-col',
      style: { backgroundColor: '#ffffff', paddingTop: 20, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
      columns: [
        {
          id: 'col-preset-h1',
          widthPercentage: 100,
          style: {},
          blocks: [
            {
              id: 'b-h1',
              type: 'logo',
              content: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80', alt: 'Logotipo', width: 140 },
              style: { textAlign: 'center' },
              deviceVisibility: 'all'
            }
          ]
        }
      ]
    } as EmailRow
  },
  {
    id: 'blk-preset-header-menu',
    name: 'Cabeçalho com Menu de Links',
    category: 'header',
    icon: 'menu',
    isRow: true,
    block: {
      id: 'row-preset-head-menu',
      layout: '1-col',
      style: { backgroundColor: '#ffffff', paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
      columns: [
        {
          id: 'col-preset-hm',
          widthPercentage: 100,
          style: {},
          blocks: [
            {
              id: 'b-hm-logo',
              type: 'logo',
              content: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80', alt: 'Logotipo', width: 120 },
              style: { textAlign: 'center', marginBottom: 8 },
              deviceVisibility: 'all'
            },
            {
              id: 'b-hm-nav',
              type: 'nav',
              content: {
                links: [
                  { label: 'Coleções', url: '#' },
                  { label: 'Lançamentos', url: '#' },
                  { label: 'Ofertas', url: '#' },
                  { label: 'Blog', url: '#' }
                ]
              },
              style: { textAlign: 'center' },
              deviceVisibility: 'all'
            }
          ]
        }
      ]
    } as EmailRow
  },
  {
    id: 'blk-preset-hero-cta',
    name: 'Banner Hero com Chamada e Botão',
    category: 'hero',
    icon: 'image',
    isRow: true,
    block: {
      id: 'row-preset-hero',
      layout: '1-col',
      style: { backgroundColor: '#1e1b4b', paddingTop: 36, paddingBottom: 36, paddingLeft: 24, paddingRight: 24, borderRadius: 8 },
      columns: [
        {
          id: 'col-hero-ct',
          widthPercentage: 100,
          style: {},
          blocks: [
            {
              id: 'b-h-title',
              type: 'heading',
              content: { text: 'A Revolução da Sua Comunicação Digital', level: 'h1' },
              style: { color: '#ffffff', fontSize: 26, fontWeight: 800, textAlign: 'center', marginBottom: 10 },
              deviceVisibility: 'all'
            },
            {
              id: 'b-h-text',
              type: 'text',
              content: { html: 'Desenvolva campanhas de alto impacto e converta muito mais com o vierstudio.' },
              style: { color: '#c7d2fe', fontSize: 16, textAlign: 'center', marginBottom: 20 },
              deviceVisibility: 'all'
            },
            {
              id: 'b-h-btn',
              type: 'button',
              content: { text: 'Começar Agora Gratuitamente →', url: 'https://seusite.com.br/comecar', fullWidth: false },
              style: { backgroundColor: '#6366f1', color: '#ffffff', fontSize: 16, paddingTop: 14, paddingBottom: 14, paddingLeft: 28, paddingRight: 28, borderRadius: 8, textAlign: 'center' },
              deviceVisibility: 'all'
            }
          ]
        }
      ]
    } as EmailRow
  },
  {
    id: 'blk-preset-coupon',
    name: 'Cupom de Desconto Destacado',
    category: 'cta',
    icon: 'tag',
    isRow: true,
    block: {
      id: 'row-preset-cupom',
      layout: '1-col',
      style: { backgroundColor: '#ffffff', paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
      columns: [
        {
          id: 'col-p-cupom',
          widthPercentage: 100,
          style: {},
          blocks: [
            {
              id: 'b-c-tag',
              type: 'coupon',
              content: {
                code: 'VIER20OFF',
                discount: '20% DE DESCONTO EXCLUSIVO',
                description: 'Insira no carrinho para garantir desconto em todo o pedido'
              },
              style: { backgroundColor: '#f5f3ff', borderColor: '#8b5cf6' },
              deviceVisibility: 'all'
            }
          ]
        }
      ]
    } as EmailRow
  },
  {
    id: 'blk-preset-product-card',
    name: 'Card de Produto em Destaque',
    category: 'product',
    icon: 'shopping-bag',
    isRow: true,
    block: {
      id: 'row-preset-prod',
      layout: '1-col',
      style: { backgroundColor: '#ffffff', paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
      columns: [
        {
          id: 'col-p-card',
          widthPercentage: 100,
          style: {},
          blocks: [
            {
              id: 'b-p-card-item',
              type: 'product',
              content: {
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                title: 'Headphone Bluetooth Estéreo Hi-Fi',
                oldPrice: 'R$ 499,00',
                price: 'R$ 299,00',
                buttonText: 'Comprar Agora',
                buttonUrl: '#'
              },
              style: {},
              deviceVisibility: 'all'
            }
          ]
        }
      ]
    } as EmailRow
  },
  {
    id: 'blk-preset-signature',
    name: 'Assinatura Executiva Profissional',
    category: 'custom',
    icon: 'user-check',
    isRow: true,
    block: {
      id: 'row-preset-sign',
      layout: '1-col',
      style: { backgroundColor: '#ffffff', paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 },
      columns: [
        {
          id: 'col-p-sign',
          widthPercentage: 100,
          style: {},
          blocks: [
            {
              id: 'b-sign-exec',
              type: 'signature',
              content: {
                name: 'Lucas Silveira',
                role: 'Diretor de Operações e Produto',
                company: 'vierstudio SaaS',
                phone: '+55 (11) 98765-4321',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              },
              style: {},
              deviceVisibility: 'all'
            }
          ]
        }
      ]
    } as EmailRow
  },
  {
    id: 'blk-preset-footer-ecom',
    name: 'Rodapé Completo de E-commerce',
    category: 'footer',
    icon: 'file-text',
    isRow: true,
    block: {
      id: 'row-preset-foot-ecom',
      layout: '1-col',
      style: { backgroundColor: '#0f172a', paddingTop: 28, paddingBottom: 28, paddingLeft: 24, paddingRight: 24 },
      columns: [
        {
          id: 'col-foot-ec',
          widthPercentage: 100,
          style: {},
          blocks: [
            {
              id: 'b-social-ecom',
              type: 'social',
              content: {
                items: [
                  { platform: 'instagram', url: '#' },
                  { platform: 'facebook', url: '#' },
                  { platform: 'whatsapp', url: '#' }
                ]
              },
              style: { textAlign: 'center' },
              deviceVisibility: 'all'
            },
            {
              id: 'b-ft-ecom',
              type: 'footer',
              content: {
                companyName: 'vierstudio Store',
                address: 'São Paulo - SP, Brasil',
                unsubscribeUrl: '{{unsubscribe_link}}'
              },
              style: {},
              deviceVisibility: 'all'
            }
          ]
        }
      ]
    } as EmailRow
  }
];
