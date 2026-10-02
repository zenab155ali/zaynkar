import type { CountryCode, Product, StyleTag } from '@/types'
import { CATEGORY_LABELS } from '@/data/categories'

export type SortKey = 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'best-selling'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
]

export interface Filters {
  categories: string[]
  sizes: string[]
  colors: string[]
  brands: string[]
  countries: CountryCode[]
  styles: StyleTag[]
  priceMin: number | null
  priceMax: number | null
  modestOnly: boolean
  /** Minimum discount percentage; 0 = any product. */
  minDiscount: number
}

export const EMPTY_FILTERS: Filters = {
  categories: [],
  sizes: [],
  colors: [],
  brands: [],
  countries: [],
  styles: [],
  priceMin: null,
  priceMax: null,
  modestOnly: false,
  minDiscount: 0,
}

export const DISCOUNT_TIERS = [10, 20, 30]

export function countActiveFilters(f: Filters): number {
  return (
    f.categories.length +
    f.sizes.length +
    f.colors.length +
    f.brands.length +
    f.countries.length +
    f.styles.length +
    (f.priceMin !== null || f.priceMax !== null ? 1 : 0) +
    (f.modestOnly ? 1 : 0) +
    (f.minDiscount > 0 ? 1 : 0)
  )
}

export function applyFilters(products: Product[], f: Filters): Product[] {
  return products.filter((p) => {
    if (f.categories.length && !f.categories.includes(CATEGORY_LABELS[p.category]) && !f.categories.includes(p.subcategory)) return false
    if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s) && !p.unavailableSizes.includes(s))) return false
    if (f.colors.length && !p.colors.some((c) => f.colors.includes(c))) return false
    if (f.brands.length && !f.brands.includes(p.brand)) return false
    if (f.countries.length && !f.countries.includes(p.country)) return false
    if (f.styles.length && !p.styles.some((s) => f.styles.includes(s))) return false
    if (f.priceMin !== null && p.price < f.priceMin) return false
    if (f.priceMax !== null && p.price > f.priceMax) return false
    if (f.modestOnly && !p.modest) return false
    if (f.minDiscount > 0 && (p.discount ?? 0) < f.minDiscount) return false
    return true
  })
}

/** Stable, deterministic "for you" ranking blending popularity, rating, freshness and deals. */
export const recommendedScore = (p: Product): number =>
  p.sales / 10 + p.rating * 20 + (p.isNew ? 40 : 0) + (p.bestseller ? 30 : 0) + (p.discount ?? 0) * 0.5

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products]
  switch (sort) {
    case 'newest':
      return list.sort((a, b) => a.daysOld - b.daysOld)
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'best-selling':
      return list.sort((a, b) => b.sales - a.sales)
    default:
      return list.sort((a, b) => recommendedScore(b) - recommendedScore(a))
  }
}

export interface FacetOption {
  value: string
  count: number
}

const tally = (values: string[]): FacetOption[] => {
  const map = new Map<string, number>()
  values.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1))
  return [...map.entries()].map(([value, count]) => ({ value, count }))
}

export interface Facets {
  categoryMode: 'category' | 'subcategory'
  categories: FacetOption[]
  sizes: FacetOption[]
  colors: FacetOption[]
  brands: FacetOption[]
  countries: FacetOption[]
  styles: FacetOption[]
  minPrice: number
  maxPrice: number
  maxDiscount: number
  modestCount: number
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40', '41', 'One Size']

export function buildFacets(products: Product[]): Facets {
  const categoryMode = new Set(products.map((p) => p.category)).size > 1 ? 'category' : 'subcategory'
  const prices = products.map((p) => p.price)
  return {
    categoryMode,
    categories: tally(products.map((p) => (categoryMode === 'category' ? CATEGORY_LABELS[p.category] : p.subcategory))).sort((a, b) => b.count - a.count),
    sizes: tally(products.flatMap((p) => p.sizes.filter((s) => !p.unavailableSizes.includes(s)))).sort(
      (a, b) => SIZE_ORDER.indexOf(a.value) - SIZE_ORDER.indexOf(b.value),
    ),
    colors: tally(products.flatMap((p) => p.colors)).sort((a, b) => b.count - a.count),
    brands: tally(products.map((p) => p.brand)).sort((a, b) => a.value.localeCompare(b.value)),
    countries: tally(products.map((p) => p.country)).sort((a, b) => b.count - a.count),
    styles: tally(products.flatMap((p) => p.styles)).sort((a, b) => b.count - a.count),
    minPrice: prices.length ? Math.floor(Math.min(...prices) / 10) * 10 : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 0,
    maxDiscount: Math.max(0, ...products.map((p) => p.discount ?? 0)),
    modestCount: products.filter((p) => p.modest).length,
  }
}
