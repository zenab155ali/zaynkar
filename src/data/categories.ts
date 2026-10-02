import type { Category } from '@/types'
import type { ImageKey } from '@/data/imageLibrary'

export const CATEGORY_LABELS: Record<Category, string> = {
  dresses: 'Dresses',
  tops: 'Tops',
  bottoms: 'Bottoms',
  sets: 'Sets',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  bags: 'Bags',
  accessories: 'Accessories',
}

/** Visual category cards on the homepage. */
export const HOME_CATEGORIES: { label: string; to: string; image: ImageKey; focusY?: number }[] = [
  { label: 'Dresses', to: '/shop/dresses', image: 'rubyMaxi' },
  { label: 'Modest Fashion', to: '/shop/modest', image: 'abayaSand', focusY: 0.3 },
  { label: 'Tops', to: '/shop/tops', image: 'broderie' },
  { label: 'Bottoms', to: '/shop/bottoms', image: 'blackPleatSkirt' },
  { label: 'Sets', to: '/shop/sets', image: 'tracksuit' },
  { label: 'Shoes', to: '/shop/shoes', image: 'navyPumps' },
  { label: 'Bags', to: '/shop/bags', image: 'wovenTote' },
  { label: 'Accessories', to: '/shop/accessories', image: 'sapphireEarrings' },
]
