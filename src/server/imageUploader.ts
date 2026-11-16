import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export interface UploadResult {
  url: string;
  localUrl: string;
  sizeBytes: number;
  filename: string;
}

/**
 * Uploads a base64 image data URI to public CDN (Catbox) and saves a local copy.
 * Returns a public https URL (e.g. https://files.catbox.moe/xxxx.jpg) suitable for Brevo, Mailchimp, etc.
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
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt === 'svg+xml' ? 'svg' : rawExt;

  const base64Data = base64DataUri.slice(commaIdx + 1).replace(/\s+/g, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const sizeBytes = buffer.length;

  const cleanName = suggestedFilename.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/\.[^/.]+$/, '');
  const filename = `${cleanName}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}.${ext}`;
  const localFilePath = path.join(uploadsDir, filename);

  // 1. Save local copy in public/uploads/
  try {
    fs.writeFileSync(localFilePath, buffer);
  } catch (err) {
    console.warn('Falha ao salvar cópia local em public/uploads:', err);
  }

  const localUrl = `/uploads/${filename}`;
  let cloudUrl: string | null = null;

  // 2. Upload to Catbox CDN (permanent public https hosting)
  try {
    const formData = new FormData();
    const blob = new Blob([buffer], { type: `image/${rawExt}` });
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, filename);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = (await res.text()).trim();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        cloudUrl = text;
      }
    }
  } catch (err) {
    console.warn('Falha no upload para o CDN Catbox:', err);
  }

  return {
    url: cloudUrl || localUrl,
    localUrl,
    sizeBytes,
    filename
  };
}
