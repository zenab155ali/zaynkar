import type { Product } from '@/types'
import { PRODUCTS } from '@/data/products'
import { COUNTRIES } from '@/data/countries'
import { CATEGORY_LABELS } from '@/data/categories'
import { COLLECTIONS } from '@/data/collections'

export const POPULAR_SEARCHES = ['black maxi dress', 'Turkish dress', 'beige bag', 'modest dress', 'abaya', 'hijab', 'sneakers', 'earrings']

const STOP_WORDS = new Set(['a', 'an', 'the', 'for', 'and', 'with', 'in', 'of', 'to', 'women', 'woman', 'womens', 'ladies'])

/** Alternative terms (already stemmed) that should also satisfy a query token. */
const SYNONYMS: Record<string, string[]> = {
  purse: ['bag'],
  handbag: ['bag'],
  trainer: ['sneaker'],
  pant: ['trouser'],
  trouser: ['pant'],
  gown: ['dress'],
  frock: ['dress'],
  jumper: ['sweater', 'knit'],
  sweater: ['knit'],
  headscarf: ['hijab', 'scarf'],
  veil: ['hijab'],
  jewelry: ['jewellery'],
  heel: ['pump'],
  kaftan: ['abaya'],
  cardigan: ['knit'],
}

/** Light stemming applied to both index and query so plurals match ("dresses" ↔ "dress"). */
export function stem(word: string): string {
  const w = word.toLowerCase()
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`
  if (/(sses|shes|ches|xes|zes)$/.test(w)) return w.slice(0, -2)
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

const wordsOf = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1)
    .map(stem)

interface IndexedProduct {
  product: Product
  name: Set<string>
  meta: Set<string>
  body: Set<string>
}

const INDEX: IndexedProduct[] = PRODUCTS.map((product) => {
  const country = COUNTRIES[product.country]
  return {
    product,
    name: new Set(wordsOf(product.name)),
    meta: new Set(
      wordsOf(
        [
          product.brand,
          CATEGORY_LABELS[product.category],
          product.subcategory,
          product.tags.join(' '),
          product.colors.join(' '),
          product.styles.join(' '),
          product.modest ? 'modest modest-fashion' : '',
          `${country.name} ${country.demonym}`,
        ].join(' '),
      ),
    ),
    body: new Set(wordsOf(`${product.description} ${product.material}`)),
  }
})

export function tokenize(query: string): string[] {
  const normalised = query.toLowerCase().replace(/k[\s-]?fashion/g, 'korean')
  return [...new Set(wordsOf(normalised).filter((w) => !STOP_WORDS.has(w)))]
}

const hasPrefix = (set: Set<string>, token: string): boolean => {
  for (const w of set) if (w.startsWith(token)) return true
  return false
}

/** Score a single token (or its synonyms) against a product: 0 = no match. */
function scoreToken(item: IndexedProduct, token: string): number {
  let best = 0
  for (const t of [token, ...(SYNONYMS[token] ?? [])]) {
    if (hasPrefix(item.name, t)) best = Math.max(best, 3)
    else if (hasPrefix(item.meta, t)) best = Math.max(best, 2)
    else if (hasPrefix(item.body, t)) best = Math.max(best, 1)
  }
  return best
}

export interface SearchResult {
  products: Product[]
  /** true when no product matched every term and we're showing the closest partial matches. */
  relaxed: boolean
  tokens: string[]
}

export function searchProducts(query: string): SearchResult {
  const tokens = tokenize(query)
  if (!tokens.length) return { products: [], relaxed: false, tokens }

  const scored = INDEX.map((item) => {
    const scores = tokens.map((t) => scoreToken(item, t))
    const matched = scores.filter((s) => s > 0).length
    return { product: item.product, matched, score: scores.reduce((a, b) => a + b, 0) }
  })
  const rank = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
    b.score - a.score || b.product.sales - a.product.sales

  const strict = scored.filter((s) => s.matched === tokens.length).sort(rank)
  if (strict.length) return { products: strict.map((s) => s.product), relaxed: false, tokens }

  const needed = Math.ceil(tokens.length / 2)
  const loose = scored.filter((s) => s.matched >= needed).sort((a, b) => b.matched - a.matched || rank(a, b))
  return { products: loose.map((s) => s.product), relaxed: loose.length > 0, tokens }
}

/** Collection/category shortcuts to show alongside live suggestions. */
export function suggestCollections(query: string, limit = 4): { label: string; to: string }[] {
  const tokens = tokenize(query)
  if (!tokens.length) return []
  return Object.values(COLLECTIONS)
    .filter((c) => {
      const title = new Set(wordsOf(c.title))
      return tokens.every((t) => hasPrefix(title, t))
    })
    .slice(0, limit)
    .map((c) => ({ label: c.title, to: `/shop/${c.slug}` }))
}
