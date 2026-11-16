import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadResult {
  url: string;
  localUrl: string;
  sizeBytes: number;
  filename: string;
  mimeType: string;
  checksumSha256: string;
  isCdnPublic: boolean;
}

/**
 * Validates magic bytes/file signatures to prevent executable files disguised as images.
 */
export function validateImageSignature(buffer: Buffer): { isValid: boolean; detectedMime?: string; ext?: string } {
  if (buffer.length < 8) {
    return { isValid: false };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { isValid: true, detectedMime: 'image/png', ext: 'png' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { isValid: true, detectedMime: 'image/jpeg', ext: 'jpg' };
  }

  // GIF: 47 49 46 38 (GIF87a or GIF89a)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { isValid: true, detectedMime: 'image/gif', ext: 'gif' };
  }

  // WebP: 'RIFF' .... 'WEBP'
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50 // WEBP
  ) {
    return { isValid: true, detectedMime: 'image/webp', ext: 'webp' };
  }

  // SVG: starts with XML or <svg
  const startStr = buffer.slice(0, 100).toString('utf-8').trim().toLowerCase();
  if (startStr.includes('<svg') || (startStr.includes('<?xml') && startStr.includes('<svg'))) {
    return { isValid: true, detectedMime: 'image/svg+xml', ext: 'svg' };
  }

  return { isValid: false };
}

/**
 * Validates, saves, and uploads any image buffer to permanent public CDN.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  suggestedFilename = 'image.jpg',
  fallbackMime = 'image/jpeg'
): Promise<UploadResult> {
  const sizeBytes = buffer.length;

  // 1. Size limit validation (10MB)
  if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`A imagem excede o tamanho máximo permitido de 10 MB (${(sizeBytes / 1024 / 1024).toFixed(2)} MB fornecido).`);
  }

  // 2. Validate magic bytes / content signature
  const sig = validateImageSignature(buffer);
  const isImageMime = fallbackMime && fallbackMime.startsWith('image/');
  if (!sig.isValid && !isImageMime) {
    throw new Error('Arquivo rejeitado: o conteúdo fornecido não possui assinatura válida de imagem (PNG, JPG, WebP ou GIF).');
  }
  const mimeType = sig.detectedMime || fallbackMime || 'image/jpeg';
  const ext = sig.ext || (mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : mimeType.includes('gif') ? 'gif' : 'jpg');

  // 3. Compute SHA-256 for integrity and deduplication
  const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  // 4. Generate unique, safe filename
  const cleanBase = suggestedFilename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) || 'imagem';
  const uniqueToken = `${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const filename = `${cleanBase}-${uniqueToken}.${ext}`;
  const localFilePath = path.join(uploadsDir, filename);

  // 5. Save local backup file
  try {
    fs.writeFileSync(localFilePath, buffer);
  } catch (err) {
    console.warn('Aviso: Falha ao salvar cópia local em public/uploads:', err);
  }

  const localUrl = `/uploads/${filename}`;
  let cloudUrl: string | null = null;

  // 6. Upload to permanent public HTTPS CDN (Catbox)
  try {
    const formData = new FormData();
    const uint8 = new Uint8Array(buffer);
    const blob = new Blob([uint8], { type: mimeType });
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, filename);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = (await res.text()).trim();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        // Enforce HTTPS
        cloudUrl = text.replace(/^http:\/\//i, 'https://');
      }
    }
  } catch (err) {
    console.warn('Aviso: Falha ao conectar ao CDN Catbox, usando caminho local:', err);
  }

  return {
    url: cloudUrl || localUrl,
    localUrl,
    sizeBytes,
    filename,
    mimeType,
    checksumSha256,
    isCdnPublic: Boolean(cloudUrl)
  };
}

/**
 * Uploads a base64 image data URI to public CDN and saves a local copy.
 * Returns a permanent HTTPS URL suitable for Brevo, Mailchimp, and all email clients.
 */
export async function uploadBase64ToCdn(
  base64DataUri: string,
  suggestedFilename = 'image.jpg'
): Promise<UploadResult> {
  if (!base64DataUri || typeof base64DataUri !== 'string') {
    throw new Error('Formato Base64 de imagem inválido');
  }

  // Extract pure data URI even if wrapped in url("...") or src="..." or contains quotes/whitespace
  const trimmed = base64DataUri.trim().replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').replace(/^src=['"]?/, '');
  const dataUriIdx = trimmed.indexOf('data:image/');
  if (dataUriIdx === -1) {
    throw new Error('Formato Base64 de imagem inválido: prefixo data:image/ não encontrado');
  }

  const cleanUri = trimmed.slice(dataUriIdx);
  const commaIdx = cleanUri.indexOf(',');
  if (commaIdx === -1) {
    throw new Error('Formato Base64 de imagem inválido: separador de dados não encontrado');
  }

  const header = cleanUri.slice(0, commaIdx);
  const typeMatch = header.match(/^data:image\/([a-zA-Z0-9+.-]+);base64/i);
  const rawExt = typeMatch ? (typeMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : typeMatch[1].toLowerCase()) : 'jpg';
  const fallbackMime = `image/${rawExt}`;

  // Clean all whitespace, newlines, tabs, and trailing quotes/parentheses
  let rawB64 = cleanUri.slice(commaIdx + 1);
  rawB64 = rawB64.replace(/['"\);\s]+$/, '').replace(/\s+/g, '');
  const buffer = Buffer.from(rawB64, 'base64');

  return uploadImageBuffer(buffer, suggestedFilename, fallbackMime);
}

/**
 * Scans an HTML string for all data:image base64 URLs (in <img> src or style="background-image:url(...)"),
 * uploads them to CDN, and replaces them with public HTTPS URLs.
 */
export async function cleanHtmlBase64(html: string): Promise<{ html: string; replacedCount: number }> {
  if (!html || typeof html !== 'string' || !html.includes('data:image/')) {
    return { html, replacedCount: 0 };
  }

  let updatedHtml = html;
  let replacedCount = 0;

  // Regex to match data:image data URIs in HTML attributes and CSS
  const dataUriRegex = /data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/= \r\n\t]+/g;
  const matches = Array.from(new Set(html.match(dataUriRegex) || []));

  for (let i = 0; i < matches.length; i++) {
    const rawMatch = matches[i];
    try {
      const res = await uploadBase64ToCdn(rawMatch, `email-content-img-${i + 1}.jpg`);
      if (res.url) {
        updatedHtml = updatedHtml.split(rawMatch).join(res.url);
        replacedCount++;
      }
    } catch (err) {
      console.warn('Erro ao limpar base64 do HTML:', err);
    }
  }

  return { html: updatedHtml, replacedCount };
}
