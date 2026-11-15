export type PageDeviceView = 'desktop' | 'tablet' | 'mobile';
export type PageStatus = 'draft' | 'published' | 'unpublished';

export type PageCategoryType =
  | 'lead-capture'
  | 'sales'
  | 'registration'
  | 'webinar'
  | 'thank-you'
  | 'upsell'
  | 'downsell'
  | 'launch'
  | 'digital-product'
  | 'ecommerce'
  | 'services'
  | 'institutional'
  | 'events'
  | 'booking'
  | 'blank';

export type PageContainerLayout =
  | '1-col'
  | '2-col-equal'
  | '2-col-30-70'
  | '2-col-70-30'
  | '3-col'
  | '4-col'
  | 'flex';

export type PageElementType =
  // Estrutura & Layout
  | 'spacer'
  | 'divider'
  | 'tabs'
  | 'accordion'
  // Conteúdo
  | 'heading'
  | 'paragraph'
  | 'rich-text'
  | 'image'
  | 'gallery'
  | 'video'
  | 'icon'
  | 'button'
  | 'list'
  | 'testimonial'
  | 'review'
  | 'card'
  | 'table'
  | 'html-embed'
  // Marketing e Conversão
  | 'form'
  | 'whatsapp-button'
  | 'cta-banner'
  | 'countdown'
  | 'pricing-table'
  | 'trust-badges'
  | 'cta-fixed-bar';

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderRadius?: number;
  width?: string;
  maxWidth?: number;
  height?: string | number;
  boxShadow?: string;
  opacity?: number;
  // Hover effects
  hoverBackgroundColor?: string;
  hoverColor?: string;
  hoverScale?: number;
}

export interface AdvancedElementSettings {
  customId?: string;
  classes?: string;
  customCss?: string;
  zIndex?: number;
  animation?: 'none' | 'fade-in' | 'slide-up' | 'zoom-in' | 'bounce';
  deviceVisibility?: 'all' | 'desktop-only' | 'tablet-mobile' | 'mobile-only';
  trackingEvent?: string; // e.g. 'Lead', 'InitiateCheckout', 'WhatsAppClick'
}

export interface PageElement {
  id: string;
  type: PageElementType;
  column?: number; // 1-based column assignment in multi-column layouts (1, 2, 3, 4)
  content: Record<string, any>;
  style: ElementStyle;
  responsiveStyle?: {
    tablet?: Partial<ElementStyle>;
    mobile?: Partial<ElementStyle>;
  };
  advanced?: AdvancedElementSettings;
}

export interface ContainerStyle {
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  gap?: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export interface PageContainer {
  id: string;
  layout: PageContainerLayout;
  style: ContainerStyle;
  responsiveStyle?: {
    tablet?: Partial<ContainerStyle>;
    mobile?: Partial<ContainerStyle>;
  };
  elements: PageElement[];
}

export interface SectionStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundOverlay?: string; // e.g. 'rgba(0,0,0,0.6)'
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderColor?: string;
}

export interface PageSection {
  id: string;
  name: string;
  fullWidth: boolean;
  style: SectionStyle;
  responsiveStyle?: {
    tablet?: Partial<SectionStyle>;
    mobile?: Partial<SectionStyle>;
  };
  containers: PageContainer[];
}

export interface PageSeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  favicon?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  robots?: string;
}

export interface PageTrackingSettings {
  metaPixelId?: string;
  metaPixelEvents?: string[]; // ['PageView', 'Lead', 'CompleteRegistration', 'Purchase']
  gtmId?: string;
  ga4Id?: string;
  tiktokPixelId?: string;
  customHeadScripts?: string;
  customBodyStartScripts?: string;
  customBodyEndScripts?: string;
  customCss?: string;
}

export interface PageGlobalSettings {
  primaryColor: string; // default #6366f1
  secondaryColor: string; // default #ec4899
  fontFamily: string; // default Inter, sans-serif
  textColor: string; // default #1e293b
  backgroundColor: string; // default #ffffff
  maxWidth: number; // default 1200
  containerPadding: number; // default 24
}

export interface PageDocument {
  id: string;
  name: string;
  slug: string;
  category: PageCategoryType;
  status: PageStatus;
  folder?: string;
  folderId?: string;
  publishedUrl?: string;
  publishedAt?: string;
  thumbnailData?: string;
  seo: PageSeoSettings;
  tracking: PageTrackingSettings;
  globalSettings: PageGlobalSettings;
  sections: PageSection[];
  version: number;
  viewsCount?: number;
  conversionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageTemplateModel {
  id: string;
  name: string;
  category: PageCategoryType;
  categoryLabel: string;
  description: string;
  thumbnailUrl: string;
  badge?: string;
  document: PageDocument;
  isFeatured?: boolean;
}

export interface PageLead {
  id: string;
  pageId: string;
  pageSlug: string;
  formId?: string;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    company?: string;
    message?: string;
    [key: string]: any;
  };
  lgpdAccepted: boolean;
  ipAddress?: string;
  userAgent?: string;
  submittedAt: string;
}

export interface PageFolder {
  id: string;
  name: string;
  color?: string;
  createdAt?: string;
}

export interface AiBriefingPlanInput {
  id: string;
  name: string;
  badge?: string;
  originalPrice?: string;
  price: string;
  installments?: string;
  description?: string;
  features: string;
  buttonText?: string;
  checkoutUrl?: string;
}

export interface AiColorPaletteInput {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  heroBgColor: string;
  heroTextColor: string;
  isDark?: boolean;
}

export type AiProviderMode = 'auto' | 'gemini' | 'openai' | 'smart-engine';

export interface AiPageBriefingRequest {
  productName: string;
  objective: PageCategoryType;
  briefing: string;
  tone?: string;
  expertName?: string;
  expertRole?: string;
  logoUrl?: string;
  productPhotoUrl?: string;
  expertPhotoUrl?: string;
  extraPhotos?: string[];
  plans?: AiBriefingPlanInput[];
  includePricing?: boolean;
  includeForm?: boolean;
  includeCountdown?: boolean;
  whatsapp?: string;
  ctaText?: string;
  ctaUrl?: string;
  folder?: string;
  palette: AiColorPaletteInput;
  aiConfig?: {
    provider?: AiProviderMode;
    apiKey?: string;
    model?: string;
  };
}

export interface AiPageGenerationResult {
  success: boolean;
  page?: PageDocument;
  aiMode?: 'gemini' | 'openai' | 'smart-engine';
  message?: string;
}
