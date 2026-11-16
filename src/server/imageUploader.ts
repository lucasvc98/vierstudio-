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
  if (!sig.isValid) {
    throw new Error('Arquivo rejeitado: o conteúdo fornecido não possui assinatura válida de imagem (PNG, JPG, WebP ou GIF).');
  }
  const mimeType = sig.detectedMime || fallbackMime;
  const ext = sig.ext || 'jpg';

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
  const commaIdx = base64DataUri.indexOf(',');
  if (commaIdx === -1 || !base64DataUri.startsWith('data:image/')) {
    throw new Error('Formato Base64 de imagem inválido');
  }

  const header = base64DataUri.slice(0, commaIdx);
  const typeMatch = header.match(/^data:image\/([a-zA-Z0-9+.-]+);base64/i);
  const rawExt = typeMatch ? typeMatch[1].toLowerCase() : 'jpeg';
  const fallbackMime = `image/${rawExt}`;

  // Clean all whitespace, newlines, tabs, and carriage returns
  const cleanB64 = base64DataUri.slice(commaIdx + 1).replace(/\s+/g, '');
  const buffer = Buffer.from(cleanB64, 'base64');

  return uploadImageBuffer(buffer, suggestedFilename, fallbackMime);
}
