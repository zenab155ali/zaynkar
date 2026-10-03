/**
 * Real catalog types — one row per Supabase table. These replace the old mock
 * `Product` shape from src/types/index.ts for everything customer/admin-facing now
 * that the catalog lives in a real database instead of src/data/products.ts.
 */

export interface Category {
  id: string
  name: string
  sortOrder: number
}

export interface ProductColor {
  id: string
  colorName: string
  /** null = no photo was uploaded for this color; fall back to the product's general photos. */
  photoUrl: string | null
  sortOrder: number
}

export type MediaType = 'image' | 'video'

export interface ProductMedia {
  id: string
  url: string
  type: MediaType
  sortOrder: number
}

export interface CatalogProduct {
  id: string
  /** Unique, auto-generated (e.g. "D-0001"). Shown to customers and searchable. */
  code: string
  name: string
  categoryId: string
  categoryName: string
  description: string
  price: number
  sizes: string[]
  isActive: boolean
  /** General photos and/or videos — as many as the admin likes, shown by default and as the fallback for colors with no photo of their own. */
  media: ProductMedia[]
  colors: ProductColor[]
  createdAt: string
  /** Times this product appears across all submitted customer requests. */
  pickCount: number
  /** Times a customer has liked (hearted) this product. */
  likeCount: number
}

export interface CustomerProfile {
  userId: string
  fullName: string
  phone: string
}

export type RequestStatus = 'new' | 'seen' | 'fulfilled'

export interface RequestItem {
  id: string
  productId: string | null
  productCode: string
  productName: string
  colorName: string
  photoUrl: string | null
  size: string
  price: number
  quantity: number
}

export interface CustomerRequest {
  id: string
  customerId: string
  status: RequestStatus
  note: string
  createdAt: string
  items: RequestItem[]
  /** Present only when loaded by an admin (joined from customer_profiles). */
  customer?: { fullName: string; phone: string }
}

/** One item a customer has picked, kept client-side until they press "Submit". */
export interface SelectionLine {
  id: string
  productId: string
  size: string
  colorName: string
  quantity: number
}
