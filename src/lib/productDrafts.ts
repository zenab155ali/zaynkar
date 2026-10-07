/**
 * Local drafts for the admin "add/edit product" form. Each browser TAB gets its own
 * separate slot (via a per-tab id in sessionStorage, which — unlike localStorage —
 * is never shared between tabs), so opening many "add product" tabs at once no
 * longer makes them overwrite each other's drafts. `listDrafts` scans every slot so
 * an admin page can offer a single place to recover any of them after a tab closes
 * or a session gets interrupted.
 */

export const DRAFT_PREFIX = 'zaynkar:admin:draft:'
const NEW_PREFIX = `${DRAFT_PREFIX}new-product:`
const EDIT_PREFIX = `${DRAFT_PREFIX}product:`
const TAB_ID_KEY = 'zaynkar:admin:tab-id'

export function getTabId(): string {
  let id = sessionStorage.getItem(TAB_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(TAB_ID_KEY, id)
  }
  return id
}

export function draftKeyForNewProduct(): string {
  return `${NEW_PREFIX}${getTabId()}`
}

export function draftKeyForProduct(productId: string): string {
  return `${EDIT_PREFIX}${productId}:${getTabId()}`
}

export interface DraftSummary {
  key: string
  name: string
  savedAt: number
  productId: string | null
}

/** Every saved draft across every tab, newest first. */
export function listDrafts(): DraftSummary[] {
  const out: DraftSummary[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(DRAFT_PREFIX)) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as { name?: string; savedAt?: number }
      const productId = key.startsWith(EDIT_PREFIX) ? key.slice(EDIT_PREFIX.length).split(':')[0] : null
      out.push({ key, name: parsed.name?.trim() || '(untitled)', savedAt: parsed.savedAt ?? 0, productId })
    } catch {
      // skip an entry that isn't valid JSON
    }
  }
  return out.sort((a, b) => b.savedAt - a.savedAt)
}

export function removeDraft(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
