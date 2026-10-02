import type { Category, Product } from '@/types'
import { PRODUCTS } from '@/data/products'

const NEUTRALS = ['Black', 'White', 'Ivory', 'Cream', 'Beige', 'Sand', 'Camel', 'Grey', 'Stone', 'Navy', 'Cognac', 'Gold']

/** Which categories complete an outfit built around a given category. */
const WANTS: Record<Category, Category[]> = {
  dresses: ['shoes', 'bags', 'accessories'],
  tops: ['bottoms', 'shoes', 'bags'],
  bottoms: ['tops', 'shoes', 'bags'],
  sets: ['shoes', 'bags', 'accessories'],
  outerwear: ['shoes', 'bags', 'accessories'],
  shoes: ['dresses', 'bags', 'accessories'],
  bags: ['dresses', 'shoes', 'accessories'],
  accessories: ['dresses', 'shoes', 'bags'],
}

const sharedCount = <T,>(a: T[], b: T[]): number => a.filter((x) => b.includes(x)).length

function lookScore(anchor: Product, candidate: Product): number {
  let score = candidate.rating + candidate.sales / 400
  score += sharedCount(anchor.styles, candidate.styles) * 2
  if (candidate.colors.some((c) => NEUTRALS.includes(c))) score += 2
  score += sharedCount(anchor.colors, candidate.colors) * 1.5
  if (anchor.modest) {
    if (candidate.modest) score += 3
    if (candidate.subcategory === 'Hijabs' || candidate.subcategory === 'Scarves') score += 2
  } else if (candidate.subcategory === 'Hijabs') {
    score -= 4
  }
  // Keep price points in the same ballpark
  score -= Math.abs(candidate.price - anchor.price) / 400
  return score
}

/** Mock "Complete the Look" — one best match per complementary category (AI-ready shape). */
export function completeTheLook(anchor: Product, limit = 4): Product[] {
  const picks: Product[] = []
  for (const category of WANTS[anchor.category]) {
    const best = PRODUCTS.filter((p) => p.category === category && p.id !== anchor.id)
      .map((p) => ({ p, s: lookScore(anchor, p) }))
      .sort((a, b) => b.s - a.s)[0]
    if (best) picks.push(best.p)
  }
  return picks.slice(0, limit)
}

/** "You May Also Like" — similar items, preferring the same category and style. */
export function similarProducts(anchor: Product, limit = 8): Product[] {
  const scored = PRODUCTS.filter((p) => p.id !== anchor.id).map((p) => {
    let s = 0
    if (p.category === anchor.category) s += 6
    if (p.subcategory === anchor.subcategory) s += 4
    s += sharedCount(anchor.tags, p.tags) * 1.5
    s += sharedCount(anchor.styles, p.styles) * 1.5
    if (p.modest === anchor.modest) s += 1.5
    if (p.country === anchor.country) s += 1
    s -= Math.abs(p.price - anchor.price) / 120
    s += p.rating / 2
    return { p, s }
  })
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.p)
}
