import type { ImageKey } from '@/data/imageLibrary'

export type CountryCode = 'TR' | 'IT' | 'KR' | 'AE'

export type Category =
  | 'dresses'
  | 'tops'
  | 'bottoms'
  | 'sets'
  | 'outerwear'
  | 'shoes'
  | 'bags'
  | 'accessories'

export type StyleTag =
  | 'Everyday'
  | 'Elegant'
  | 'Evening'
  | 'Workwear'
  | 'Casual'
  | 'Statement'
  | 'Minimal'

export type ProductBadge = 'NEW' | 'BESTSELLER' | 'SALE'

/** Focal point used to crop a demo image into detail shots (all values 0–1, zoom >= 1). */
export interface ImageFocus {
  x: number
  y: number
  zoom?: number
}

/**
 * A product image is either a demo image from the central library (`key`)
 * or a fully-qualified `url` (for future real seller images).
 */
export interface ProductImage {
  key?: ImageKey
  url?: string
  focus?: ImageFocus
  alt?: string
}

export interface Country {
  code: CountryCode
  name: string
  demonym: string
  headline: string
  blurb: string
  image: ImageKey
  imageFocusY?: number
}

export interface Store {
  id: string
  name: string
  country: CountryCode
  city: string
  rating: number
  since: number
  about: string
}

export interface Product {
  id: string
  slug: string
  name: string
  storeId: string
  /** Denormalised store name for display/search. */
  brand: string
  /** Country the item ships from / was designed in. */
  country: CountryCode
  category: Category
  subcategory: string
  modest: boolean
  styles: StyleTag[]
  tags: string[]
  /** Price in the base currency. */
  price: number
  oldPrice?: number
  /** Whole-number percentage, present when oldPrice is set. */
  discount?: number
  colors: string[]
  sizes: string[]
  unavailableSizes: string[]
  images: ProductImage[]
  description: string
  material: string
  fit: string
  care: string
  rating: number
  reviewCount: number
  sales: number
  daysOld: number
  isNew: boolean
  bestseller: boolean
}

export interface CartLine {
  /** `${productId}|${size}|${color}` */
  id: string
  productId: string
  size: string
  color: string
  quantity: number
}

export interface Review {
  id: string
  author: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
  size?: string
}

export interface Address {
  id: string
  label: string
  fullName: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered'

export interface OrderItem {
  productId: string
  name: string
  brand: string
  size: string
  color: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  placedAt: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  deliveryMethod: string
  demo?: boolean
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthday: string
  newsletter: boolean
}
