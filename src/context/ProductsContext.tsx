import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, CatalogProduct, MediaType } from '@/types/catalog'

interface ProductsContextValue {
  loading: boolean
  /** Set when the fetch itself failed (network/config issue) — not the same as "no products yet". */
  error: string | null
  categories: Category[]
  products: CatalogProduct[]
  getByCode: (code: string) => CatalogProduct | undefined
  getById: (id: string) => CatalogProduct | undefined
  /** Re-fetch the catalog — call after an admin add/edit/delete so every open page sees it immediately. */
  refresh: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

interface RawMedia {
  id: string
  media_url: string
  media_type: MediaType
  sort_order: number
}
interface RawColor {
  id: string
  color_name: string
  photo_url: string | null
  sort_order: number
}
interface RawProduct {
  id: string
  code: string
  name: string
  category_id: string
  description: string
  price: number
  sizes: string[]
  is_active: boolean
  created_at: string
  categories: { name: string } | null
  product_media: RawMedia[]
  product_colors: RawColor[]
}

const bySortOrder = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order

function mapProduct(row: RawProduct): CatalogProduct {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? '',
    description: row.description,
    price: Number(row.price),
    sizes: row.sizes ?? [],
    isActive: row.is_active,
    createdAt: row.created_at,
    media: [...row.product_media].sort(bySortOrder).map((m) => ({ id: m.id, url: m.media_url, type: m.media_type, sortOrder: m.sort_order })),
    colors: [...row.product_colors].sort(bySortOrder).map((c) => ({ id: c.id, colorName: c.color_name, photoUrl: c.photo_url, sortOrder: c.sort_order })),
  }
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<CatalogProduct[]>([])

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('id, name, sort_order').order('sort_order'),
      supabase
        .from('products')
        .select('*, categories(name), product_media(*), product_colors(*)')
        .order('created_at', { ascending: false }),
    ])

    if (catRes.error || prodRes.error) {
      setError(catRes.error?.message ?? prodRes.error?.message ?? 'Failed to load the catalog.')
      setLoading(false)
      return
    }

    setCategories((catRes.data ?? []).map((c) => ({ id: c.id, name: c.name, sortOrder: c.sort_order })))
    setProducts(((prodRes.data as RawProduct[] | null) ?? []).map(mapProduct))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getByCode = useCallback((code: string) => products.find((p) => p.code.toLowerCase() === code.trim().toLowerCase()), [products])
  const getById = useCallback((id: string) => products.find((p) => p.id === id), [products])

  const value = useMemo<ProductsContextValue>(
    () => ({ loading, error, categories, products, getByCode, getById, refresh }),
    [loading, error, categories, products, getByCode, getById, refresh],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
