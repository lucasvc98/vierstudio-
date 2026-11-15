export type DeviceVisibility = 'all' | 'desktop' | 'mobile';

export type RowLayoutType = 
  | '1-col' 
  | '2-col-equal' 
  | '2-col-30-70' 
  | '2-col-70-30' 
  | '3-col' 
  | '4-col';

export type EmailBlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'logo'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'video'
  | 'html'
  | 'product'
  | 'coupon'
  | 'header'
  | 'footer'
  | 'nav'
  | 'image-text'
  | 'text-button'
  | 'hero'
  | 'contact'
  | 'address'
  | 'signature';

export interface BlockStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number; // e.g. 1.4, 1.5, 1.6
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderRadius?: number;
  width?: string; // e.g. "100%", "320px", "auto"
  maxWidth?: number;
  height?: string | number;
}

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: Record<string, any>;
  style: BlockStyle;
  deviceVisibility: DeviceVisibility;
}

export interface ColumnStyle {
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface EmailColumn {
  id: string;
  widthPercentage: number;
  style: ColumnStyle;
  blocks: EmailBlock[];
}

export interface RowStyle {
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface EmailRow {
  id: string;
  layout: RowLayoutType;
  style: RowStyle;
  columns: EmailColumn[];
}

export interface GlobalEmailSettings {
  containerWidth: number; // default 600
  bodyBgColor: string; // default #f4f5f8
  contentBgColor: string; // default #ffffff
  defaultFontFamily: string; // default Arial, sans-serif
  defaultTextColor: string; // default #333333
  defaultHeadingColor: string; // default #111827
  defaultLinkColor: string; // default #6366f1
  defaultButtonBg: string; // default #6366f1
  defaultButtonTextColor: string; // default #ffffff
  defaultButtonRadius: number; // default 6
  containerBorderWidth: number; // default 0
  containerBorderColor: string; // default #e2e8f0
  containerRadius: number; // default 8
  sectionSpacing: number; // default 16
}

export interface EmailDocument {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  globalSettings: GlobalEmailSettings;
  rows: EmailRow[];
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'published' | 'archived' | 'favorite';
  thumbnailData?: string;
  categoryId?: string;
  folder?: string;
}

export interface TemplateFolder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt?: string;
}

export interface TemplateModel {
  id: string;
  name: string;
  category: 'ecommerce' | 'corporativo' | 'relacionamento' | 'promocional';
  categoryLabel: string;
  description: string;
  badge?: string;
  thumbnailUrl: string;
  document: EmailDocument;
  isPremium?: boolean;
}

export interface SavedBlockItem {
  id: string;
  name: string;
  category: 'header' | 'hero' | 'cta' | 'product' | 'testimonial' | 'footer' | 'custom';
  icon: string;
  block: EmailBlock | EmailRow;
  isRow?: boolean;
}

export interface MediaAsset {
  id: string;
  folder: string;
  name: string;
  url: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  mimeType: string;
  altText?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'admin' | 'editor' | 'user';
  company: string;
  plan: 'starter' | 'pro' | 'enterprise';
}
