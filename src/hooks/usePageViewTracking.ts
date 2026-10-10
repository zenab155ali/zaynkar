import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    goatcounter?: { count: (opts: { path: string }) => void }
  }
}

/** Counts a page view (via GoatCounter — visit totals only, no personal data) on every in-app
 * route change. A plain <script> tag only fires once on first load, which isn't enough for a
 * single-page app where most navigation never triggers a real page load. */
export function usePageViewTracking() {
  const location = useLocation()

  useEffect(() => {
    // Skip admin pages — only customer-facing traffic should count as a "visit".
    if (location.pathname.startsWith('/admin')) return
    const path = location.pathname + location.search

    if (window.goatcounter?.count) {
      window.goatcounter.count({ path })
      return
    }
    // The counter script loads asynchronously and may not be ready yet on the very first page
    // view (e.g. a fresh visit to the home page) — keep checking briefly instead of silently
    // missing it. Gives up after ~2s (adblocker, offline, script failed to load, etc.).
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (window.goatcounter?.count) {
        window.goatcounter.count({ path })
        clearInterval(interval)
      } else if (attempts > 20) {
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [location.pathname, location.search])
}
