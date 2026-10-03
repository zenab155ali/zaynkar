import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/context/ProductsContext'
import { supabase } from '@/lib/supabase'
import type { CatalogProduct } from '@/types/catalog'

interface LikesContextValue {
  loading: boolean
  likedIds: Set<string>
  likedProducts: CatalogProduct[]
  isLiked: (productId: string) => boolean
  /** Returns false if the customer isn't signed in (caller should prompt sign-in). */
  toggleLike: (productId: string) => Promise<boolean>
}

const LikesContext = createContext<LikesContextValue | null>(null)

/**
 * A customer's liked ("hearted") items — stored in Supabase per account, so the list
 * follows them across devices (unlike "My Selections", which is only a local draft
 * until submitted). Empty and read-only when signed out.
 */
export function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { getById } = useProducts()
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase || !user) {
      setLikedIds(new Set())
      return
    }
    let active = true
    setLoading(true)
    supabase
      .from('product_likes')
      .select('product_id')
      .eq('customer_id', user.id)
      .then(({ data }) => {
        if (!active) return
        setLikedIds(new Set((data ?? []).map((r) => r.product_id)))
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const toggleLike = useCallback(
    async (productId: string) => {
      if (!supabase || !user) return false
      const alreadyLiked = likedIds.has(productId)
      // Optimistic update — feels instant, corrected below if the write fails.
      setLikedIds((prev) => {
        const next = new Set(prev)
        alreadyLiked ? next.delete(productId) : next.add(productId)
        return next
      })
      const { error } = alreadyLiked
        ? await supabase.from('product_likes').delete().eq('product_id', productId).eq('customer_id', user.id)
        : await supabase.from('product_likes').insert({ product_id: productId, customer_id: user.id })
      if (error) {
        setLikedIds((prev) => {
          const next = new Set(prev)
          alreadyLiked ? next.add(productId) : next.delete(productId)
          return next
        })
      }
      return true
    },
    [user, likedIds],
  )

  const likedProducts = useMemo(() => [...likedIds].map((id) => getById(id)).filter((p): p is CatalogProduct => Boolean(p)), [likedIds, getById])
  const isLiked = useCallback((productId: string) => likedIds.has(productId), [likedIds])

  const value = useMemo<LikesContextValue>(() => ({ loading, likedIds, likedProducts, isLiked, toggleLike }), [loading, likedIds, likedProducts, isLiked, toggleLike])

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
}

export function useLikes(): LikesContextValue {
  const ctx = useContext(LikesContext)
  if (!ctx) throw new Error('useLikes must be used within LikesProvider')
  return ctx
}
