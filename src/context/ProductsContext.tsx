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
  color_name_he: string | null
  photo_url: string | null
  sort_order: number
}
interface RawProduct {
  id: string
  code: string
  name: string
  name_he: string | null
  category_id: string
  description: string
  description_he: string | null
  price: number
  sizes: string[]
  is_active: boolean
  cover_focal_x: number
  cover_focal_y: number
  created_at: string
  categories: { name: string } | null
  product_media: RawMedia[]
  product_colors: RawColor[]
}

const bySortOrder = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order

function mapProduct(row: RawProduct, pickCounts: Map<string, number>, likeCounts: Map<string, number>): CatalogProduct {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    nameHe: row.name_he,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? '',
    description: row.description,
    descriptionHe: row.description_he,
    price: Number(row.price),
    sizes: row.sizes ?? [],
    isActive: row.is_active,
    coverFocalX: Number(row.cover_focal_x),
    coverFocalY: Number(row.cover_focal_y),
    createdAt: row.created_at,
    media: [...row.product_media].sort(bySortOrder).map((m) => ({ id: m.id, url: m.media_url, type: m.media_type, sortOrder: m.sort_order })),
    colors: [...row.product_colors]
      .sort(bySortOrder)
      .map((c) => ({ id: c.id, colorName: c.color_name, colorNameHe: c.color_name_he, photoUrl: c.photo_url, sortOrder: c.sort_order })),
    pickCount: pickCounts.get(row.id) ?? 0,
    likeCount: likeCounts.get(row.id) ?? 0,
  }
}

const countBy = (rows: { product_id: string }[]): Map<string, number> => {
  const map = new Map<string, number>()
  for (const r of rows) map.set(r.product_id, (map.get(r.product_id) ?? 0) + 1)
  return map
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
    const [catRes, prodRes, pickRes, likeRes] = await Promise.all([
      supabase.from('categories').select('id, name, name_he, sort_order, photo_url').order('sort_order'),
      supabase
        .from('products')
        .select('*, categories(name), product_media(*), product_colors(*)')
        .order('created_at', { ascending: false }),
      supabase.rpc('get_product_pick_counts'),
      supabase.from('product_likes').select('product_id'),
    ])

    if (catRes.error || prodRes.error) {
      setError(catRes.error?.message ?? prodRes.error?.message ?? 'Failed to load the catalog.')
      setLoading(false)
      return
    }

    const pickCounts = new Map<string, number>(
      ((pickRes.data as { product_id: string; pick_count: number | string }[] | null) ?? []).map((r) => [r.product_id, Number(r.pick_count)]),
    )
    const likeCounts = countBy((likeRes.data as { product_id: string }[] | null) ?? [])

    setCategories((catRes.data ?? []).map((c) => ({ id: c.id, name: c.name, nameHe: c.name_he, sortOrder: c.sort_order, photoUrl: c.photo_url })))
    setProducts(((prodRes.data as RawProduct[] | null) ?? []).map((row) => mapProduct(row, pickCounts, likeCounts)))
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
