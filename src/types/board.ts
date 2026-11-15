export type BoardItemType = 'sticky' | 'shape' | 'text' | 'card' | 'frame' | 'node';

export type BoardShapeType = 'rect' | 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'pill';
export type ShapeType = BoardShapeType;

export interface BoardItemStyle {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'none';
  fontSize?: number;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  shadow?: boolean;
}

export interface BoardItemContent {
  text?: string;
  title?: string;
  subtitle?: string;
  shapeType?: BoardShapeType;
  status?: string;
  tags?: string[];
  icon?: string;
  badge?: string;
  author?: string;
}

export interface BoardItem {
  id: string;
  type: BoardItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: BoardItemContent;
  style: BoardItemStyle;
  parentId?: string;
  zIndex?: number;
}

export interface BoardConnection {
  id: string;
  fromId: string;
  toId: string;
  from?: string;
  to?: string;
  label?: string;
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed';
  arrowStart?: boolean;
  arrowEnd?: boolean;
  arrow?: boolean;
}

export interface BoardViewport {
  x: number;
  y: number;
  zoom: number;
}

export type BoardCategory =
  | 'all'
  | 'mindmap'
  | 'flowchart'
  | 'brainstorm'
  | 'kanban'
  | 'roadmap'
  | 'custom'
  | 'retro'
  | 'strategy';

export interface BoardDocument {
  id: string;
  name: string;
  description?: string;
  category: BoardCategory;
  folder: string;
  isFavorite?: boolean;
  items: BoardItem[];
  connections: BoardConnection[];
  viewport: BoardViewport;
  thumbnailData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardTemplateModel {
  id: string;
  name: string;
  category: BoardCategory;
  categoryLabel: string;
  description: string;
  thumbnailUrl: string;
  badge?: string;
  board: BoardDocument;
  document?: BoardDocument;
}

export interface AiBoardGenerateRequest {
  boardId?: string;
  targetBoardId?: string;
  prompt: string;
  type: 'mindmap' | 'flowchart' | 'brainstorm' | 'expand_node' | 'expand';
  selectedItemId?: string;
  selectedItemText?: string;
  contextNode?: {
    id: string;
    text: string;
    x: number;
    y: number;
  };
  apiKey?: string;
  provider?: 'auto' | 'gemini' | 'openai' | 'smart-engine';
}

export interface AiBoardGenerateResponse {
  success: boolean;
  items: BoardItem[];
  connections: BoardConnection[];
  aiMode: 'gemini' | 'openai' | 'smart-engine';
  message?: string;
}
