import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/context/ProductsContext'
import { getGuestId } from '@/lib/guestId'
import { supabase } from '@/lib/supabase'
import type { CatalogProduct } from '@/types/catalog'

interface LikesContextValue {
  loading: boolean
  likedIds: Set<string>
  likedProducts: CatalogProduct[]
  isLiked: (productId: string) => boolean
  toggleLike: (productId: string) => Promise<boolean>
}

const LikesContext = createContext<LikesContextValue | null>(null)

/**
 * A customer's liked ("hearted") items. Signed-in customers get it stored against their
 * account (so it follows them across devices); a visitor who isn't signed in still gets to
 * like things — it's remembered against a random id kept in this browser instead, the same
 * way "My Selections" already works for guests.
 */
export function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { getById } = useProducts()
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setLikedIds(new Set())
      return
    }
    let active = true
    setLoading(true)
    const query = user ? supabase.from('product_likes').select('product_id').eq('customer_id', user.id) : supabase.from('product_likes').select('product_id').eq('guest_id', getGuestId())
    query.then(({ data }) => {
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
      if (!supabase) return false
      const owner = user ? { column: 'customer_id' as const, value: user.id } : { column: 'guest_id' as const, value: getGuestId() }
      const alreadyLiked = likedIds.has(productId)
      // Optimistic update — feels instant, corrected below if the write fails.
      setLikedIds((prev) => {
        const next = new Set(prev)
        alreadyLiked ? next.delete(productId) : next.add(productId)
        return next
      })
      const { error } = alreadyLiked
        ? await supabase.from('product_likes').delete().eq('product_id', productId).eq(owner.column, owner.value)
        : await supabase.from('product_likes').insert({ product_id: productId, [owner.column]: owner.value })
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
