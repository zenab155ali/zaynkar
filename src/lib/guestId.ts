import { STORAGE_KEYS } from '@/config'

/** A random id persisted in this browser, so a visitor who isn't signed in can still like
 * products and have it remembered on their next visit (not tied to any personal info). */
export function getGuestId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEYS.guestId)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEYS.guestId, id)
    }
    return id
  } catch {
    // Private browsing / storage blocked — likes just won't persist across a reload.
    return crypto.randomUUID()
  }
}
