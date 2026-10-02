import type { CountryCode, Product } from '@/types'
import type { ImageKey } from '@/data/imageLibrary'
import { COUNTRIES } from '@/data/countries'
import type { SortKey } from '@/utils/filters'

export interface Crumb {
  label: string
  to?: string
}

export interface Collection {
  slug: string
  title: string
  description: string
  image: ImageKey
  imageFocusY?: number
  /** Parent collection slug — used to build breadcrumbs like Women › Dresses. */
  parent?: string
  filter: (p: Product) => boolean
  defaultSort?: SortKey
  /** Extra copy shown under the title (e.g. marketplace notes for country pages). */
  note?: string
}

const sub = (name: string) => (p: Product) => p.subcategory === name

const def = (c: Collection): [string, Collection] => [c.slug, c]

export const COLLECTIONS: Record<string, Collection> = Object.fromEntries([
  def({ slug: 'women', title: 'Women', description: 'Everything new and next — dresses, modest fashion, shoes, bags and accessories from sellers around the world.', image: 'edOfficeSpring', imageFocusY: 0.25, filter: () => true }),
  def({ slug: 'new-in', title: 'New In', description: 'The latest arrivals from our sellers — fresh every week.', image: 'puffBlouse', imageFocusY: 0.3, filter: (p) => p.isNew, defaultSort: 'newest' }),
  def({ slug: 'sale', title: 'Sale', description: 'Considered pieces at better prices — while stock lasts.', image: 'wineTulle', imageFocusY: 0.3, filter: (p) => Boolean(p.discount), defaultSort: 'best-selling' }),
  def({ slug: 'trending', title: 'Trending Now', description: 'What ZAYNKAR shoppers are loving right now.', image: 'tracksuit', imageFocusY: 0.3, filter: (p) => p.sales >= 500, defaultSort: 'best-selling' }),

  def({ slug: 'modest', title: 'Modest Fashion', description: 'Elegant coverage and considered silhouettes — maxi dresses, abayas, long skirts, hijabs and more.', image: 'abayaSand', imageFocusY: 0.3, filter: (p) => p.modest }),
  def({ slug: 'modest-maxi-dresses', title: 'Modest Maxi Dresses', description: 'Floor-length dresses with long sleeves and graceful drape.', image: 'blackModestMaxi', parent: 'modest', filter: (p) => p.modest && p.category === 'dresses' && p.tags.includes('maxi') }),
  def({ slug: 'long-sleeve-dresses', title: 'Long Sleeve Dresses', description: 'Covered, comfortable and beautifully cut.', image: 'corduroyDress', parent: 'modest', filter: (p) => p.category === 'dresses' && p.tags.includes('long sleeve') }),
  def({ slug: 'modest-sets', title: 'Modest Sets', description: 'Coordinated two-piece looks with long skirts and elegant knits.', image: 'turtleneckSkirtSet', parent: 'modest', filter: (p) => p.modest && p.category === 'sets' }),
  def({ slug: 'abayas', title: 'Abayas', description: 'Modern abayas from Dubai and Abu Dhabi — open, belted and embellished.', image: 'abayaOpen', parent: 'modest', filter: sub('Abayas') }),
  def({ slug: 'hijabs', title: 'Hijabs', description: 'Chiffon, satin, cotton and jersey hijabs in season-ready colours.', image: 'hijabRose', parent: 'modest', filter: sub('Hijabs') }),
  def({ slug: 'long-skirts', title: 'Long Skirts', description: 'Pleated and flowing long skirts for every occasion.', image: 'ivoryPleatSkirt', parent: 'modest', filter: sub('Long Skirts') }),

  def({ slug: 'dresses', title: 'Dresses', description: 'From everyday midis to show-stopping evening gowns.', image: 'rubyMaxi', parent: 'women', filter: (p) => p.category === 'dresses' }),
  def({ slug: 'maxi-dresses', title: 'Maxi Dresses', description: 'Floor-length, flowing and made to move.', image: 'rubyMaxi', parent: 'dresses', filter: sub('Maxi Dresses') }),
  def({ slug: 'midi-dresses', title: 'Midi Dresses', description: 'The most versatile length, in prints and solids.', image: 'floralWrap', parent: 'dresses', filter: sub('Midi Dresses') }),
  def({ slug: 'evening-dresses', title: 'Evening Dresses', description: 'Gowns and occasion pieces for the big night.', image: 'wineTulle', parent: 'dresses', filter: sub('Evening Dresses') }),

  def({ slug: 'clothing', title: 'Clothing', description: 'Tops, bottoms, sets and outerwear to build your wardrobe.', image: 'creamBlazer', imageFocusY: 0.3, parent: 'women', filter: (p) => ['tops', 'bottoms', 'sets', 'outerwear'].includes(p.category) }),
  def({ slug: 'tops', title: 'Tops', description: 'Blouses, shirts, tunics and knits.', image: 'broderie', parent: 'clothing', filter: (p) => p.category === 'tops' }),
  def({ slug: 'bottoms', title: 'Bottoms', description: 'Trousers, jeans and skirts.', image: 'blackPleatSkirt', parent: 'clothing', filter: (p) => p.category === 'bottoms' }),
  def({ slug: 'sets', title: 'Sets & Jumpsuits', description: 'Co-ords, party sets and jumpsuits — one piece, sorted.', image: 'tracksuit', parent: 'clothing', filter: (p) => p.category === 'sets' }),
  def({ slug: 'outerwear', title: 'Coats, Blazers & Abayas', description: 'Layers that finish the look.', image: 'burgundyCoat', parent: 'clothing', filter: (p) => p.category === 'outerwear' }),

  def({ slug: 'shoes', title: 'Shoes', description: 'Heels, flats and sneakers — from Aegean workshops to Florence studios.', image: 'navyPumps', parent: 'women', filter: (p) => p.category === 'shoes' }),
  def({ slug: 'heels', title: 'Heels', description: 'Pumps and stilettos.', image: 'floralHeels', parent: 'shoes', filter: sub('Heels') }),
  def({ slug: 'sneakers', title: 'Sneakers', description: 'Clean, logo-free everyday sneakers.', image: 'sneakers', parent: 'shoes', filter: sub('Sneakers') }),

  def({ slug: 'bags', title: 'Bags', description: 'Leather totes, satchels and mini bags.', image: 'wovenTote', parent: 'women', filter: (p) => p.category === 'bags' }),
  def({ slug: 'totes', title: 'Totes', description: 'Roomy, polished, everyday carry.', image: 'blackTote', parent: 'bags', filter: sub('Totes') }),
  def({ slug: 'crossbody-bags', title: 'Crossbody Bags', description: 'Hands-free and effortless.', image: 'quiltedBag', parent: 'bags', filter: sub('Crossbody') }),

  def({ slug: 'accessories', title: 'Accessories', description: 'Jewellery, scarves, hijabs and sunglasses.', image: 'sapphireEarrings', parent: 'women', filter: (p) => p.category === 'accessories' }),
  def({ slug: 'jewellery', title: 'Jewellery', description: 'Earrings, bracelets and layering sets.', image: 'hoops', parent: 'accessories', filter: sub('Jewellery') }),
  def({ slug: 'scarves', title: 'Scarves', description: 'Silk-touch, chiffon and pashmina scarves.', image: 'silkScarf', parent: 'accessories', filter: sub('Scarves') }),
])

export const getCollection = (slug: string): Collection | undefined => COLLECTIONS[slug]

export function getCountryCollection(code: CountryCode): Collection {
  const country = COUNTRIES[code]
  return {
    slug: `country-${code}`,
    title: country.headline,
    description: country.blurb,
    image: country.image,
    imageFocusY: country.imageFocusY,
    filter: (p) => p.country === code,
    note:
      code === 'TR'
        ? 'Turkey is our founding market and has the largest selection on ZAYNKAR.'
        : `Our ${country.name} selection is growing — more sellers are joining soon.`,
  }
}

export function getCrumbs(collection: Collection, countryName?: string): Crumb[] {
  const crumbs: Crumb[] = []
  let cursor: Collection | undefined = collection
  while (cursor) {
    crumbs.unshift({ label: cursor.title, to: cursor === collection ? undefined : `/shop/${cursor.slug}` })
    cursor = cursor.parent ? COLLECTIONS[cursor.parent] : undefined
  }
  if (countryName) return [{ label: 'Shop by Country' }, { label: countryName }]
  return [{ label: 'Home', to: '/' }, ...crumbs]
}
