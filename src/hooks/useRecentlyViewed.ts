import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/config'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const MAX_ITEMS = 12

export function useRecentlyViewed() {
  const [ids, setIds] = useLocalStorage<string[]>(STORAGE_KEYS.recentlyViewed, [])

  const track = useCallback(
    (id: string) => setIds((prev) => (prev[0] === id ? prev : [id, ...prev.filter((x) => x !== id)].slice(0, MAX_ITEMS))),
    [setIds],
  )
  const clear = useCallback(() => setIds([]), [setIds])

  return { ids, track, clear }
}
