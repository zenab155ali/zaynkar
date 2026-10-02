import type { Category, Product, Review } from '@/types'

/** Deterministic mock reviews — same product always yields the same reviews. */
const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const seedOf = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const AUTHORS = ['Aylin K.', 'Maya R.', 'Selin D.', 'Noa B.', 'Lina H.', 'Yasmin A.', 'Elif T.', 'Sara M.', 'Dana L.', 'Hana S.', 'Leyla O.', 'Mariam F.', 'Reem J.', 'Ece Y.']

const TITLES = ['Exactly what I hoped for', 'Beautiful quality', 'Love it', 'Worth every shekel', 'Even better in person', 'Great fit', 'Lovely and elegant', 'Would buy again']

const BODY_BY_CATEGORY: Record<Category, string[]> = {
  dresses: ['The fabric feels lovely and the drape is beautiful. Fits true to size and I got so many compliments.', 'Elegant and comfortable — the length is perfect and it did not crease in my bag.', 'Colour is just like the photos. Lined well and the finishing is neat.'],
  tops: ['Soft, well-made and easy to style with almost anything. The fit is just right.', 'Lovely detailing and the material is not see-through. I bought a second colour.', 'Great everyday piece. Washed well and kept its shape.'],
  bottoms: ['Comfortable waistband and a flattering cut. Length was perfect for me.', 'Very good quality for the price, and it hangs beautifully.', 'Goes with everything in my wardrobe. Fits true to size.'],
  sets: ['Both pieces match perfectly and feel high quality. Easy to wear together or separately.', 'Really comfortable and looks much more expensive than it is.', 'Great fit — we ordered our usual size and it was spot on.'],
  outerwear: ['Beautifully finished with a lovely drape. Feels premium and keeps its shape.', 'Elegant and lightweight — I wore it straight out of the box.', 'Detailing is gorgeous, exactly like the pictures. Fits generously.'],
  shoes: ['Comfortable from the first wear and the finish looks really refined.', 'Fit true to size and are lovely quality. Good grip on the sole.', 'Stylish and easy to walk in — I get compliments every time.'],
  bags: ['Roomy, well-made and the leather feels great. Hardware is solid.', 'Looks luxurious and holds everything I need. Strap length is perfect.', 'Beautiful shape and colour — smaller than I expected but worth it.'],
  accessories: ['Lovely finish and looks great in person. Arrived beautifully packaged.', 'Feels well made and goes with everything. Very happy with it.', 'Colour is beautiful and it is a real conversation starter.'],
}

export function getReviews(product: Product, count = 4): Review[] {
  const rand = mulberry32(seedOf(product.id))
  const bodies = BODY_BY_CATEGORY[product.category]
  const dateBase = new Date('2026-09-10').getTime()
  return Array.from({ length: count }, (_, i) => {
    const rating = rand() > 0.82 ? 4 : 5
    return {
      id: `${product.id}-r${i}`,
      author: AUTHORS[Math.floor(rand() * AUTHORS.length)],
      rating,
      title: TITLES[Math.floor(rand() * TITLES.length)],
      body: bodies[Math.floor(rand() * bodies.length)],
      date: new Date(dateBase - Math.floor(rand() * 120 + i * 11) * 86400000).toISOString().slice(0, 10),
      verified: rand() > 0.15,
      size: product.sizes.length > 1 ? product.sizes[Math.floor(rand() * product.sizes.length)] : undefined,
    }
  })
}

export interface RatingBar {
  stars: number
  pct: number
  count: number
}

/** Plausible star distribution that averages close to `product.rating`. */
export function ratingBreakdown(product: Product): RatingBar[] {
  const t = Math.min(1, Math.max(0, product.rating - 4))
  const p5 = 0.42 + 0.3 * t
  const p4 = 0.34 - 0.14 * t
  const p3 = 0.1 - 0.05 * t
  const p2 = 0.05 - 0.03 * t
  const p1 = Math.max(0, 1 - p5 - p4 - p3 - p2)
  return [p5, p4, p3, p2, p1].map((p, i) => ({
    stars: 5 - i,
    pct: Math.round(p * 100),
    count: Math.round(p * product.reviewCount),
  }))
}
