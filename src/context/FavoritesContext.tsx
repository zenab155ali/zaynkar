import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/config'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface FavoritesContextValue {
  ids: string[]
  count: number
  has: (id: string) => boolean
  toggle: (id: string) => void
  clear: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useLocalStorage<string[]>(STORAGE_KEYS.favorites, [])

  const has = useCallback((id: string) => ids.includes(id), [ids])
  const toggle = useCallback(
    (id: string) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])),
    [setIds],
  )
  const clear = useCallback(() => setIds([]), [setIds])

  const value = useMemo(() => ({ ids, count: ids.length, has, toggle, clear }), [ids, has, toggle, clear])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
