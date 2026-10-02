import { useEffect, useState } from 'react'

const seen = new Set<string>()

/**
 * Prototype-only: shows skeletons briefly the first time a view is opened, mimicking a network fetch.
 * Views already visited in this session render instantly. Replace with real loading state later.
 */
export function useSimulatedLoading(key: string, ms = 380): boolean {
  const [doneKey, setDoneKey] = useState<string | null>(null)

  useEffect(() => {
    if (seen.has(key)) return
    const timer = window.setTimeout(() => {
      seen.add(key)
      setDoneKey(key)
    }, ms)
    return () => window.clearTimeout(timer)
  }, [key, ms])

  return !seen.has(key) && doneKey !== key
}
