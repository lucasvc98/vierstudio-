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
