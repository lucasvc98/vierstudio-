import { EmailDocument } from '../types/email';

/**
 * Extracts live text from all active contenteditable DOM elements on the screen
 * and merges them directly into the EmailDocument object.
 * 
 * This ensures that even if an element is currently focused or being typed in,
 * no keystrokes are lost during saving, auto-saving, or navigating.
 */
export const flushDomEditsToDoc = (baseDoc: EmailDocument | null): EmailDocument | null => {
  if (!baseDoc || typeof document === 'undefined') return baseDoc;

  const editables = document.querySelectorAll<HTMLElement>('[contenteditable="true"][data-block-id]');
  if (!editables || editables.length === 0) return baseDoc;

  const blockUpdates = new Map<string, Record<string, any>>();
  editables.forEach(el => {
    const blockId = el.getAttribute('data-block-id');
    const field = el.getAttribute('data-field');
    if (!blockId) return;

    if (!blockUpdates.has(blockId)) {
      blockUpdates.set(blockId, {});
    }
    const updates = blockUpdates.get(blockId)!;
    if (field) {
      updates[field] = el.innerHTML;
    } else {
      updates.html = el.innerHTML;
      updates.text = el.innerText;
    }
  });

  if (blockUpdates.size === 0) return baseDoc;

  let hasChanges = false;
  const newRows = baseDoc.rows.map(row => ({
    ...row,
    columns: row.columns.map(col => ({
      ...col,
      blocks: col.blocks.map(b => {
        const u = blockUpdates.get(b.id);
        if (!u) return b;
        hasChanges = true;
        return {
          ...b,
          content: {
            ...b.content,
            ...u
          }
        };
      })
    }))
  }));

  if (!hasChanges) return baseDoc;

  return {
    ...baseDoc,
    updatedAt: new Date().toISOString(),
    rows: newRows
  };
};

/**
 * Finds and extracts the primary banner/image from an EmailDocument.
 * It searches the document's rows and blocks in visual order:
 * 1. The first block of type 'image' with a valid content.url
 * 2. The first block of type 'hero' with imageUrl / url / backgroundImage
 * 3. The first block of type 'image-text' or 'product' with imageUrl / url
 * 4. Any row background image
 * 5. Fallback to doc.thumbnailData
 */
export const extractEmailMainBanner = (doc?: EmailDocument | null): string | undefined => {
  if (!doc) return undefined;

  // 1. Search inside rows in visual order from top to bottom
  if (doc.rows && Array.isArray(doc.rows)) {
    for (const row of doc.rows) {
      if (!row || !row.columns || !Array.isArray(row.columns)) continue;
      for (const col of row.columns) {
        if (!col || !col.blocks || !Array.isArray(col.blocks)) continue;
        for (const block of col.blocks) {
          if (!block || !block.content) continue;

          // Main image block (e.g. banner)
          if (block.type === 'image') {
            const url = block.content.url;
            if (typeof url === 'string' && url.trim().length > 0) {
              return url.trim();
            }
          }

          // Hero block with image
          if (block.type === 'hero') {
            const heroUrl = block.content.imageUrl || block.content.url || block.content.backgroundImage;
            if (typeof heroUrl === 'string' && heroUrl.trim().length > 0) {
              return heroUrl.trim();
            }
          }

          // Image-text or product card
          if (block.type === 'image-text' || block.type === 'product') {
            const imgUrl = block.content.imageUrl || block.content.url;
            if (typeof imgUrl === 'string' && imgUrl.trim().length > 0) {
              return imgUrl.trim();
            }
          }
        }
      }
    }

    // 2. Check row background images
    for (const row of doc.rows) {
      if (!row) continue;
      const rowBg = row.style?.backgroundImage || (row as any).backgroundImage;
      if (typeof rowBg === 'string' && rowBg.trim().length > 0 && !rowBg.includes('none')) {
        const match = rowBg.match(/url\(['"]?(.*?)['"]?\)/);
        return match ? match[1] : rowBg;
      }
    }
  }

  // 3. Fallback to document.thumbnailData if it exists
  if (typeof doc.thumbnailData === 'string' && doc.thumbnailData.trim().length > 0) {
    return doc.thumbnailData.trim();
  }

  return undefined;
};
