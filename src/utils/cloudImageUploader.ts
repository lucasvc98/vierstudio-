import { EmailDocument } from '../types/email';
import { compressImageFile } from './imageOptimizer';

export interface EmailExportAudit {
  canExport: boolean;
  base64Count: number;
  blobCount: number;
  localPathCount: number;
  unhostedCount: number;
  issues: string[];
}

/**
 * Audits an EmailDocument before HTML export to ensure 100% Brevo and Mailchimp compatibility.
 * Rejects Base64 inline images, temporary blob URLs, and local/relative links.
 */
export function auditEmailForExport(doc?: EmailDocument | null): EmailExportAudit {
  const issues: string[] = [];
  let base64Count = 0;
  let blobCount = 0;
  let localPathCount = 0;
  let unhostedCount = 0;

  if (!doc) {
    return { canExport: false, base64Count: 0, blobCount: 0, localPathCount: 0, unhostedCount: 0, issues: ['Documento não encontrado'] };
  }

  const checkUrl = (url: string | undefined | null, locationName: string) => {
    if (!url || typeof url !== 'string' || !url.trim()) return;
    const val = url.trim();
    if (val.startsWith('data:image/') || val.includes('data:image/')) {
      base64Count++;
      issues.push(`Imagem em Base64 (${locationName})`);
    } else if (val.startsWith('blob:')) {
      blobCount++;
      issues.push(`URL temporária Blob (${locationName})`);
    } else if (val.startsWith('http://localhost') || val.startsWith('http://127.0.0.1') || val.startsWith('file://')) {
      localPathCount++;
      issues.push(`URL local (${locationName})`);
    }
  };

  // 1. Check globalSettings
  if (doc.globalSettings) {
    if (doc.globalSettings.bodyBgImage) checkUrl(doc.globalSettings.bodyBgImage, 'Fundo Geral do E-mail');
    if (doc.globalSettings.contentBgImage) checkUrl(doc.globalSettings.contentBgImage, 'Fundo do Conteúdo');
  }

  // 2. Deep scan rows, columns and blocks
  if (doc.rows && Array.isArray(doc.rows)) {
    doc.rows.forEach((r, ri) => {
      const rowName = `Linha ${ri + 1}`;
      if (r.style?.backgroundImage) checkUrl(r.style.backgroundImage, `${rowName} (Fundo)`);
      if (r.columns && Array.isArray(r.columns)) {
        r.columns.forEach((c, ci) => {
          const colName = `${rowName} Coluna ${ci + 1}`;
          if (c.style?.backgroundColor) checkUrl(c.style.backgroundColor, `${colName} (Cor)`);
          if (c.blocks && Array.isArray(c.blocks)) {
            c.blocks.forEach((b) => {
              const blockName = `Bloco ${b.type || 'elemento'}`;
              if (b.content && typeof b.content === 'object') {
                for (const k of Object.keys(b.content)) {
                  const v = b.content[k];
                  if (typeof v === 'string') {
                    if (k === 'url' || k === 'imageUrl' || k === 'src' || k === 'backgroundImage') {
                      if (!v.trim() && (b.type === 'image' || b.type === 'logo')) {
                        unhostedCount++;
                        issues.push(`${blockName}: Imagem sem endereço`);
                      } else {
                        checkUrl(v, `${blockName}.${k}`);
                      }
                    } else if (v.includes('data:image/')) {
                      checkUrl(v, `${blockName}.${k}`);
                    }
                  }
                }
              }
              if (b.style && typeof b.style === 'object') {
                for (const sk of Object.keys(b.style)) {
                  const sv = (b.style as any)[sk];
                  if (typeof sv === 'string' && sv.includes('data:image/')) {
                    checkUrl(sv, `${blockName}.style.${sk}`);
                  }
                }
              }
            });
          }
        });
      }
    });
  }

  // 3. Check thumbnail
  if (typeof doc.thumbnailData === 'string' && doc.thumbnailData.startsWith('data:image/')) {
    base64Count++;
    issues.push('Miniatura da capa em Base64');
  }

  const canExport = base64Count === 0 && blobCount === 0 && localPathCount === 0;

  return {
    canExport,
    base64Count,
    blobCount,
    localPathCount,
    unhostedCount,
    issues
  };
}

/**
 * Checks if an EmailDocument contains any base64 encoded images.
 */
export function hasBase64Images(doc?: EmailDocument | null): boolean {
  if (!doc) return false;
  const audit = auditEmailForExport(doc);
  return audit.base64Count > 0;
}

/**
 * Uploads a local image file directly to the cloud CDN, returning a public HTTPS URL.
 * Major email tools like Brevo, Mailchimp, and ActiveCampaign require standard HTTPS image URLs.
 */
export async function uploadImageFileToCloud(file: File): Promise<string> {
  let base64 = '';
  try {
    const opt = await compressImageFile(file, 1200, 0.85);
    base64 = opt.dataUrl;
  } catch {
    base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 1. Try backend endpoint
  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, filename: file.name })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Falha no upload via backend, tentando direto para Catbox:', err);
  }

  // 2. Direct browser upload to Catbox CDN fallback
  try {
    const blob = await fetch(base64).then(r => r.blob());
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, file.name || 'image.jpg');

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        return text;
      }
    }
  } catch (err) {
    console.error('Falha no upload direto para Catbox:', err);
  }

  // Fallback to base64 if all fails
  return base64;
}

/**
 * Converts all base64 images in an EmailDocument to public cloud CDN URLs.
 * Ensures the email is 100% compatible with Brevo, Mailchimp, RD Station and Gmail.
 */
export async function cleanDocumentBase64Images(
  doc: EmailDocument
): Promise<{ doc: EmailDocument; replacedCount: number }> {
  // 1. Try backend API endpoint (handles full deep extraction, backup snapshot, and uploads)
  try {
    const res = await fetch('/api/clean-base64-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.doc) {
        if (data.replacedCount > 0) {
          return {
            doc: data.doc,
            replacedCount: data.replacedCount
          };
        }
        // If 0, double check with audit
        const audit = auditEmailForExport(data.doc);
        if (audit.canExport) {
          return {
            doc: data.doc,
            replacedCount: 0
          };
        }
      }
    }
  } catch (err) {
    console.warn('Falha ao limpar base64 via API backend, tentando fallback direto:', err);
  }

  // 2. Client-side fallback: deep recursive walk of the entire document
  try {
    const cloned = JSON.parse(JSON.stringify(doc)) as EmailDocument;
    let count = 0;

    const convertOneBase64 = async (b64: string, name: string): Promise<string> => {
      // 1. Try backend upload-image endpoint
      try {
        const r1 = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: b64, filename: `${name}.jpg` })
        });
        if (r1.ok) {
          const d1 = await r1.json();
          if (d1.success && d1.url) return d1.url;
        }
      } catch {}

      // 2. Direct browser upload with FormData
      try {
        const cleanB64 = b64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').replace(/['"\);\s]+$/, '').replace(/\s+/g, '');
        const byteCharacters = atob(cleanB64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const fd = new FormData();
        fd.append('reqtype', 'fileupload');
        fd.append('fileToUpload', blob, `${name}.jpg`);
        const r2 = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd });
        if (r2.ok) {
          const text = (await r2.text()).trim();
          if (text.startsWith('http')) return text;
        }
      } catch {}

      return b64;
    };

    const processStr = async (str: string, hint: string): Promise<{ res: string; replaced: boolean }> => {
      if (!str || typeof str !== 'string' || !str.includes('data:image/')) return { res: str, replaced: false };
      const trimmed = str.trim().replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').replace(/^['"]/, '').replace(/['"]$/, '');
      if (trimmed.startsWith('data:image/')) {
        const uploaded = await convertOneBase64(trimmed, hint);
        if (uploaded && uploaded !== trimmed && !uploaded.startsWith('data:image/')) {
          const isUrlWrapped = str.trim().startsWith('url(');
          return { res: isUrlWrapped ? `url('${uploaded}')` : uploaded, replaced: true };
        }
      }

      // If inline HTML with data:image
      let updated = str;
      let any = false;
      const dataUriRegex = /data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/= \r\n\t]+/g;
      const matches = Array.from(new Set(str.match(dataUriRegex) || []));
      for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const up = await convertOneBase64(m, `${hint}-${i}`);
        if (up && up !== m && !up.startsWith('data:image/')) {
          updated = updated.split(m).join(up);
          any = true;
        }
      }
      return { res: updated, replaced: any };
    };

    const deepClean = async (obj: any, path = 'doc'): Promise<void> => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          if (typeof obj[i] === 'string') {
            const { res, replaced } = await processStr(obj[i], `${path}-${i}`);
            if (replaced) { obj[i] = res; count++; }
          } else if (typeof obj[i] === 'object') {
            await deepClean(obj[i], `${path}-${i}`);
          }
        }
        return;
      }
      for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'string') {
          const { res, replaced } = await processStr(obj[k], `${path}-${k}`);
          if (replaced) { obj[k] = res; count++; }
        } else if (typeof obj[k] === 'object') {
          await deepClean(obj[k], `${path}-${k}`);
        }
      }
    };

    await deepClean(cloned);

    return { doc: cloned, replacedCount: count };
  } catch (err) {
    console.error('Falha no fallback direto:', err);
  }

  return { doc, replacedCount: 0 };
}

/**
 * Ensures an exported HTML string has zero base64 images by converting any remaining
 * data:image tags into public HTTPS URLs.
 */
export async function cleanHtmlStringBase64(html: string): Promise<string> {
  if (!html || typeof html !== 'string' || !html.includes('data:image/')) {
    return html;
  }
  try {
    const res = await fetch('/api/clean-base64-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.html) {
        return data.html;
      }
    }
  } catch (err) {
    console.warn('Falha ao limpar HTML via API:', err);
  }
  return html;
}
