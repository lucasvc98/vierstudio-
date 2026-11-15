import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmailDocument, MediaAsset, SavedBlockItem } from '../types/email';
import { PageDocument, PageLead } from '../types/page';
import { BoardDocument } from '../types/board';
import { INITIAL_TEMPLATES } from '../data/initialTemplates';
import { INITIAL_PAGE_TEMPLATES } from '../data/initialPageTemplates';
import { INITIAL_BOARDS } from '../data/initialBoards';
import { PRESET_SAVED_BLOCKS } from '../data/initialBlocks';
import { INITIAL_MEDIA_ASSETS } from '../data/initialMedia';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_VERCEL = Boolean(process.env.VERCEL);
const LOCAL_DATA_DIR = path.resolve(__dirname, '../../data');
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, 'database.json');
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : LOCAL_DATA_DIR;
const DATA_FILE = IS_VERCEL ? path.join('/tmp', 'data', 'database.json') : LOCAL_DATA_FILE;

export interface DatabaseState {
  projects: EmailDocument[];
  savedBlocks: SavedBlockItem[];
  mediaAssets: MediaAsset[];
  folders: string[]; // media folders
  templateFolders: string[]; // email template folders
  pageProjects?: PageDocument[]; // landing page projects
  pageFolders?: string[]; // landing page folders
  pageLeads?: PageLead[]; // captured leads
  boards?: BoardDocument[]; // miro-style mind map boards
  boardFolders?: string[]; // board folders
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    company: string;
    plan: string;
  };
}

class StorageManager {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (IS_VERCEL && !fs.existsSync(DATA_FILE) && fs.existsSync(LOCAL_DATA_FILE)) {
        try {
          fs.copyFileSync(LOCAL_DATA_FILE, DATA_FILE);
        } catch {
          // fallback to reading local file directly
        }
      }

      const fileToRead = fs.existsSync(DATA_FILE) ? DATA_FILE : (fs.existsSync(LOCAL_DATA_FILE) ? LOCAL_DATA_FILE : null);
      if (fileToRead) {
        const raw = fs.readFileSync(fileToRead, 'utf-8');
        const state: DatabaseState = JSON.parse(raw);
        this.ensureInitialTemplatesInProjects(state);
        return state;
      }
    } catch (err) {
      console.warn('Could not read existing database.json, initializing default state.', err);
    }

    // Default seeded state
    const defaultState: DatabaseState = {
      projects: INITIAL_TEMPLATES.map(t => ({
        ...t.document,
        id: `proj-${t.id}`,
        name: t.name,
        status: 'draft',
        thumbnailData: t.thumbnailUrl,
        categoryId: t.category,
        folder: t.document.folder || 'Campanhas 2026'
      })),
      savedBlocks: [...PRESET_SAVED_BLOCKS],
      mediaAssets: [...INITIAL_MEDIA_ASSETS],
      templateFolders: ['Geral', 'Campanhas 2026', 'E-commerce & Vendas', 'Transacionais', 'Boas-Vindas'],
      folders: ['Geral', 'Banners', 'Produtos', 'Logos', 'Equipe'],
      user: {
        id: 'user-lucas-01',
        name: 'Lucas Silveira',
        email: 'lucas@vierstudio.com.br',
        role: 'admin',
        company: 'vierstudio SaaS',
        plan: 'enterprise'
      }
    };

    this.saveToFile(defaultState);
    return defaultState;
  }

  private reloadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        this.ensureInitialTemplatesInProjects(this.state);
      }
    } catch (err) {
      console.warn('Could not reload database.json', err);
    }
  }

  private ensureInitialTemplatesInProjects(state: DatabaseState) {
    if (!state.projects) state.projects = [];
    let changed = false;
    for (const tmpl of INITIAL_TEMPLATES) {
      const exists = state.projects.some(p => 
        p.id === `proj-${tmpl.id}` || 
        p.id === tmpl.id || 
        p.name === tmpl.name
      );
      if (!exists) {
        state.projects.unshift({
          ...tmpl.document,
          id: `proj-${tmpl.id}`,
          name: tmpl.name,
          status: 'draft',
          thumbnailData: tmpl.thumbnailUrl,
          categoryId: tmpl.category,
          folder: tmpl.document.folder || 'Campanhas 2026'
        });
        changed = true;
      }
    }

    if (!state.mediaAssets || state.mediaAssets.length === 0) {
      state.mediaAssets = [...INITIAL_MEDIA_ASSETS];
      changed = true;
    }

    // Ensure page projects exist
    if (!state.pageProjects) {
      state.pageProjects = [];
    }

    INITIAL_PAGE_TEMPLATES.forEach(t => {
      const exists = state.pageProjects!.some(p => p.id === `page-${t.id}` || p.slug === t.document.slug);
      if (!exists) {
        state.pageProjects!.unshift({
          ...t.document,
          id: `page-${t.id}`,
          name: t.name,
          slug: t.document.slug,
          category: t.category,
          status: t.document.status,
          folder: t.document.folder || 'Páginas de Captura'
        });
        changed = true;
      }
    });

    if (!state.pageFolders) {
      state.pageFolders = ['Geral', 'Páginas de Captura', 'Páginas de Vendas', 'Lançamentos 2026'];
      changed = true;
    }

    if (!state.pageLeads) {
      state.pageLeads = [];
      changed = true;
    }

    // Ensure Miro-style boards exist
    if (!state.boards || state.boards.length === 0) {
      state.boards = [...INITIAL_BOARDS];
      changed = true;
    } else {
      INITIAL_BOARDS.forEach(tmpl => {
        const exists = state.boards!.some(b => b.id === tmpl.id);
        if (!exists) {
          state.boards!.push(tmpl);
          changed = true;
        }
      });
    }

    if (!state.boardFolders) {
      state.boardFolders = ['Geral', 'Modelos Prontos', 'Projetos', 'Estratégia 2026'];
      changed = true;
    }

    if (changed) {
      this.saveToFile(state);
    }
  }

  private saveToFile(state: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database.json:', err);
    }
  }

  public getProjects(): EmailDocument[] {
    this.reloadFromFile();
    return this.state.projects;
  }

  public getProjectById(id: string): EmailDocument | undefined {
    this.reloadFromFile();
    return this.state.projects.find(p => p.id === id);
  }

  public saveProject(project: EmailDocument): EmailDocument {
    this.reloadFromFile();
    const index = this.state.projects.findIndex(p => p.id === project.id);
    const updated = {
      ...project,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      this.state.projects[index] = updated;
    } else {
      updated.createdAt = updated.createdAt || new Date().toISOString();
      this.state.projects.unshift(updated);
    }

    this.saveToFile(this.state);
    return updated;
  }

  public deleteProject(id: string): boolean {
    this.reloadFromFile();
    const before = this.state.projects.length;
    this.state.projects = this.state.projects.filter(p => p.id !== id);
    if (this.state.projects.length !== before) {
      this.saveToFile(this.state);
      return true;
    }
    return false;
  }

  public duplicateProject(id: string): EmailDocument | null {
    const original = this.getProjectById(id);
    if (!original) return null;

    const copy: EmailDocument = {
      ...JSON.parse(JSON.stringify(original)),
      id: `proj-${Date.now()}`,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    this.state.projects.unshift(copy);
    this.saveToFile(this.state);
    return copy;
  }

  public getSavedBlocks(): SavedBlockItem[] {
    this.reloadFromFile();
    return this.state.savedBlocks;
  }

  public addSavedBlock(block: SavedBlockItem): SavedBlockItem {
    this.state.savedBlocks.push(block);
    this.saveToFile(this.state);
    return block;
  }

  public deleteSavedBlock(id: string): boolean {
    const before = this.state.savedBlocks.length;
    this.state.savedBlocks = this.state.savedBlocks.filter(b => b.id !== id);
    if (this.state.savedBlocks.length !== before) {
      this.saveToFile(this.state);
      return true;
    }
    return false;
  }

  public getMediaAssets(): MediaAsset[] {
    this.reloadFromFile();
    if (!this.state.mediaAssets || this.state.mediaAssets.length === 0) {
      this.state.mediaAssets = [...INITIAL_MEDIA_ASSETS];
      this.saveToFile(this.state);
    }
    return this.state.mediaAssets;
  }

  public addMediaAsset(asset: MediaAsset): MediaAsset {
    this.state.mediaAssets.unshift(asset);
    this.saveToFile(this.state);
    return asset;
  }

  public deleteMediaAsset(id: string): boolean {
    const before = this.state.mediaAssets.length;
    this.state.mediaAssets = this.state.mediaAssets.filter(m => m.id !== id);
    if (this.state.mediaAssets.length !== before) {
      this.saveToFile(this.state);
      return true;
    }
    return false;
  }

  public getFolders(): string[] {
    return this.state.folders;
  }

  public addFolder(folder: string): string[] {
    if (!this.state.folders.includes(folder)) {
      this.state.folders.push(folder);
      this.saveToFile(this.state);
    }
    return this.state.folders;
  }

  public getTemplateFolders(): string[] {
    if (!this.state.templateFolders) {
      this.state.templateFolders = ['Geral', 'Campanhas 2026', 'E-commerce & Vendas', 'Transacionais', 'Boas-Vindas'];
      this.saveToFile(this.state);
    }
    return this.state.templateFolders;
  }

  public addTemplateFolder(folderName: string): string[] {
    const folders = this.getTemplateFolders();
    const clean = folderName.trim();
    if (clean && !folders.includes(clean)) {
      folders.push(clean);
      this.state.templateFolders = folders;
      this.saveToFile(this.state);
    }
    return folders;
  }

  public deleteTemplateFolder(folderName: string): string[] {
    if (folderName === 'Geral') return this.getTemplateFolders(); // default folder cannot be deleted
    this.state.templateFolders = this.getTemplateFolders().filter(f => f !== folderName);
    // Move any projects in this folder to 'Geral'
    this.state.projects = this.state.projects.map(p => {
      if (p.folder === folderName) {
        return { ...p, folder: 'Geral' };
      }
      return p;
    });
    this.saveToFile(this.state);
    return this.state.templateFolders;
  }

  public moveProjectToFolder(projectId: string, folderName: string): EmailDocument | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;
    project.folder = folderName;
    project.updatedAt = new Date().toISOString();
    this.saveToFile(this.state);
    return project;
  }

  // ===================== PAGE BUILDER =====================
  public getPageProjects(): PageDocument[] {
    this.reloadFromFile();
    return this.state.pageProjects || [];
  }

  public getPageProjectById(id: string): PageDocument | undefined {
    this.reloadFromFile();
    return (this.state.pageProjects || []).find(p => p.id === id);
  }

  public getPageProjectBySlug(slug: string): PageDocument | undefined {
    this.reloadFromFile();
    return (this.state.pageProjects || []).find(p => p.slug === slug);
  }

  public savePageProject(page: PageDocument): PageDocument {
    if (!this.state.pageProjects) this.state.pageProjects = [];
    const index = this.state.pageProjects.findIndex(p => p.id === page.id);
    const updated: PageDocument = {
      ...page,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      this.state.pageProjects[index] = updated;
    } else {
      this.state.pageProjects.unshift(updated);
    }

    this.saveToFile(this.state);
    return updated;
  }

  public deletePageProject(id: string): boolean {
    if (!this.state.pageProjects) return false;
    const initialLen = this.state.pageProjects.length;
    this.state.pageProjects = this.state.pageProjects.filter(p => p.id !== id);
    if (this.state.pageProjects.length !== initialLen) {
      this.saveToFile(this.state);
      return true;
    }
    return false;
  }

  public duplicatePageProject(id: string): PageDocument | null {
    const original = this.getPageProjectById(id);
    if (!original) return null;

    const copySlug = `${original.slug}-copia-${Math.random().toString(36).substr(2, 4)}`;
    const copy: PageDocument = {
      ...JSON.parse(JSON.stringify(original)),
      id: `page-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (Cópia)`,
      slug: copySlug,
      status: 'draft',
      publishedUrl: `/p/${copySlug}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      conversionsCount: 0
    };

    if (!this.state.pageProjects) this.state.pageProjects = [];
    this.state.pageProjects.unshift(copy);
    this.saveToFile(this.state);
    return copy;
  }

  public movePageProjectToFolder(id: string, folderName: string): PageDocument | null {
    const page = this.getPageProjectById(id);
    if (!page) return null;
    page.folder = folderName;
    page.updatedAt = new Date().toISOString();
    this.saveToFile(this.state);
    return page;
  }

  public getPageFolders(): string[] {
    if (!this.state.pageFolders) {
      this.state.pageFolders = ['Geral', 'Páginas de Captura', 'Páginas de Vendas', 'Lançamentos 2026'];
      this.saveToFile(this.state);
    }
    return this.state.pageFolders;
  }

  public addPageFolder(folderName: string): string[] {
    const folders = this.getPageFolders();
    const clean = folderName.trim();
    if (clean && !folders.includes(clean)) {
      folders.push(clean);
      this.state.pageFolders = folders;
      this.saveToFile(this.state);
    }
    return folders;
  }

  public deletePageFolder(folderName: string): string[] {
    if (folderName === 'Geral') return this.getPageFolders();
    this.state.pageFolders = this.getPageFolders().filter(f => f !== folderName);
    if (this.state.pageProjects) {
      this.state.pageProjects = this.state.pageProjects.map(p => {
        if (p.folder === folderName) {
          return { ...p, folder: 'Geral' };
        }
        return p;
      });
    }
    this.saveToFile(this.state);
    return this.state.pageFolders;
  }

  public getPageLeads(pageId?: string): PageLead[] {
    this.reloadFromFile();
    const leads = this.state.pageLeads || [];
    if (pageId) {
      return leads.filter(l => l.pageId === pageId);
    }
    return leads;
  }

  public savePageLead(lead: PageLead): PageLead {
    if (!this.state.pageLeads) this.state.pageLeads = [];
    const newLead: PageLead = {
      ...lead,
      id: lead.id || `lead-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      submittedAt: new Date().toISOString()
    };
    this.state.pageLeads.unshift(newLead);
    
    // Increment conversions count on page
    if (this.state.pageProjects) {
      const page = this.state.pageProjects.find(p => p.id === lead.pageId || p.slug === lead.pageSlug);
      if (page) {
        page.conversionsCount = (page.conversionsCount || 0) + 1;
      }
    }

    this.saveToFile(this.state);
    return newLead;
  }

  // ===================== MIRO-STYLE BOARDS & MIND MAPS =====================
  public getBoards(): BoardDocument[] {
    this.reloadFromFile();
    if (!this.state.boards) {
      this.state.boards = [...INITIAL_BOARDS];
      this.saveToFile(this.state);
    }
    return this.state.boards;
  }

  public getBoardById(id: string): BoardDocument | null {
    this.reloadFromFile();
    const boards = this.getBoards();
    return boards.find(b => b.id === id) || null;
  }

  public saveBoard(board: BoardDocument): BoardDocument {
    if (!this.state.boards) this.state.boards = [];
    const index = this.state.boards.findIndex(b => b.id === board.id);
    const now = new Date().toISOString();
    const toSave: BoardDocument = {
      ...board,
      updatedAt: now,
      createdAt: board.createdAt || now
    };

    if (index >= 0) {
      this.state.boards[index] = toSave;
    } else {
      this.state.boards.unshift(toSave);
    }

    this.saveToFile(this.state);
    return toSave;
  }

  public duplicateBoard(id: string): BoardDocument | null {
    const original = this.getBoardById(id);
    if (!original) return null;

    const copy: BoardDocument = {
      ...JSON.parse(JSON.stringify(original)),
      id: `board-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.state.boards) this.state.boards = [];
    this.state.boards.unshift(copy);
    this.saveToFile(this.state);
    return copy;
  }

  public deleteBoard(id: string): boolean {
    if (!this.state.boards) return false;
    const initialLen = this.state.boards.length;
    this.state.boards = this.state.boards.filter(b => b.id !== id);
    if (this.state.boards.length !== initialLen) {
      this.saveToFile(this.state);
      return true;
    }
    return false;
  }

  public getBoardFolders(): string[] {
    if (!this.state.boardFolders) {
      this.state.boardFolders = ['Geral', 'Modelos Prontos', 'Projetos', 'Estratégia 2026'];
      this.saveToFile(this.state);
    }
    return this.state.boardFolders;
  }

  public addBoardFolder(folderName: string): string[] {
    const folders = this.getBoardFolders();
    const clean = folderName.trim();
    if (clean && !folders.includes(clean)) {
      folders.push(clean);
      this.state.boardFolders = folders;
      this.saveToFile(this.state);
    }
    return folders;
  }

  public deleteBoardFolder(folderName: string): string[] {
    if (folderName === 'Geral') return this.getBoardFolders();
    this.state.boardFolders = this.getBoardFolders().filter(f => f !== folderName);
    if (this.state.boards) {
      this.state.boards = this.state.boards.map(b => {
        if (b.folder === folderName) {
          return { ...b, folder: 'Geral' };
        }
        return b;
      });
    }
    this.saveToFile(this.state);
    return this.state.boardFolders;
  }

  public getUser() {
    return this.state.user;
  }
}

export const storage = new StorageManager();
