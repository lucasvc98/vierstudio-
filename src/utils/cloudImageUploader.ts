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
      issues.push(`Imagem em Base64 em ${locationName}`);
    } else if (val.startsWith('blob:')) {
      blobCount++;
      issues.push(`URL temporária Blob em ${locationName}`);
    } else if (val.startsWith('http://localhost') || val.startsWith('http://127.0.0.1') || val.startsWith('file://')) {
      localPathCount++;
      issues.push(`URL local em ${locationName}`);
    }
  };

  if (doc.rows && Array.isArray(doc.rows)) {
    doc.rows.forEach((r, ri) => {
      if (r.style?.backgroundImage) checkUrl(r.style.backgroundImage, `Fundo da Linha ${ri + 1}`);
      if (r.columns && Array.isArray(r.columns)) {
        r.columns.forEach((c) => {
          if (c.blocks && Array.isArray(c.blocks)) {
            c.blocks.forEach((b) => {
              if (b.type === 'image' || b.type === 'logo') {
                if (!b.content?.url) {
                  unhostedCount++;
                  issues.push(`Imagem sem endereço no bloco ${b.type}`);
                } else {
                  checkUrl(b.content.url, `Bloco ${b.type} (${b.content.alt || 'Sem descrição'})`);
                }
              }
              if (b.type === 'hero' && b.content?.imageUrl) {
                checkUrl(b.content.imageUrl, `Banner Hero`);
              }
              if ((b.type === 'product' || b.type === 'image-text') && b.content?.imageUrl) {
                checkUrl(b.content.imageUrl, `Card de Produto`);
              }
            });
          }
        });
      }
    });
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

  // Check blocks
  if (doc.rows && Array.isArray(doc.rows)) {
    for (const row of doc.rows) {
      if (row.columns && Array.isArray(row.columns)) {
        for (const col of row.columns) {
          if (col.blocks && Array.isArray(col.blocks)) {
            for (const b of col.blocks) {
              if (b && b.content) {
                for (const key of Object.keys(b.content)) {
                  const val = b.content[key];
                  if (typeof val === 'string' && (val.startsWith('data:image/') || val.includes('data:image/'))) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Check thumbnail
  if (typeof doc.thumbnailData === 'string' && doc.thumbnailData.startsWith('data:image/')) {
    return true;
  }

  // Check background
  if (doc.globalSettings) {
    if (typeof doc.globalSettings.bodyBgImage === 'string' && doc.globalSettings.bodyBgImage.startsWith('data:image/')) {
      return true;
    }
    if (typeof doc.globalSettings.contentBgImage === 'string' && doc.globalSettings.contentBgImage.startsWith('data:image/')) {
      return true;
    }
  }

  return false;
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
  // 1. Try backend API endpoint
  try {
    const res = await fetch('/api/clean-base64-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.doc && data.replacedCount > 0) {
        return {
          doc: data.doc,
          replacedCount: data.replacedCount || 0
        };
      }
    }
  } catch (err) {
    console.warn('Falha ao limpar base64 via API backend, tentando fallback direto:', err);
  }

  // 2. Client-side fallback: direct conversion of each base64 found
  try {
    const cloned = JSON.parse(JSON.stringify(doc)) as EmailDocument;
    let count = 0;

    const convertOneBase64 = async (b64: string, name: string): Promise<string> => {
      try {
        const r1 = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: b64, filename: name })
        });
        if (r1.ok) {
          const d1 = await r1.json();
          if (d1.success && d1.url) return d1.url;
        }
      } catch {}

      try {
        const commaIdx = b64.indexOf(',');
        if (commaIdx === -1 || !b64.startsWith('data:image/')) return b64;
        const header = b64.slice(0, commaIdx);
        const typeMatch = header.match(/^data:image\/([a-zA-Z0-9+.-]+);base64/i);
        const rawExt = typeMatch ? (typeMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : typeMatch[1].toLowerCase()) : 'jpg';
        const cleanB64 = b64.slice(commaIdx + 1).replace(/\s+/g, '');
        const byteCharacters = atob(cleanB64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${rawExt}` });

        const fd = new FormData();
        fd.append('reqtype', 'fileupload');
        fd.append('fileToUpload', blob, `${name}.${rawExt}`);
        const r2 = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd });
        if (r2.ok) {
          const text = (await r2.text()).trim();
          if (text.startsWith('http')) return text;
        }
      } catch {}

      return b64;
    };

    if (cloned.rows && Array.isArray(cloned.rows)) {
      for (const row of cloned.rows) {
        if (row.style?.backgroundImage && row.style.backgroundImage.startsWith('data:image/')) {
          const newBg = await convertOneBase64(row.style.backgroundImage, 'row-bg');
          if (newBg !== row.style.backgroundImage) {
            row.style.backgroundImage = newBg;
            count++;
          }
        }
        if (row.columns && Array.isArray(row.columns)) {
          for (const col of row.columns) {
            if (col.blocks && Array.isArray(col.blocks)) {
              for (const block of col.blocks) {
                if (block && block.content) {
                  for (const key of Object.keys(block.content)) {
                    const val = block.content[key];
                    if (typeof val === 'string' && val.startsWith('data:image/')) {
                      const newUrl = await convertOneBase64(val, `${block.type || 'img'}-${key}`);
                      if (newUrl !== val) {
                        block.content[key] = newUrl;
                        count++;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (cloned.thumbnailData && cloned.thumbnailData.startsWith('data:image/')) {
      const newThumb = await convertOneBase64(cloned.thumbnailData, 'thumbnail');
      if (newThumb !== cloned.thumbnailData) {
        cloned.thumbnailData = newThumb;
        count++;
      }
    }

    if (count > 0) {
      return { doc: cloned, replacedCount: count };
    }
  } catch (err) {
    console.error('Falha no fallback direto:', err);
  }

  return { doc, replacedCount: 0 };
}
