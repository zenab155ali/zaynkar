/**
 * Real catalog types — one row per Supabase table. These replace the old mock
 * `Product` shape from src/types/index.ts for everything customer/admin-facing now
 * that the catalog lives in a real database instead of src/data/products.ts.
 */

export interface Category {
  id: string
  name: string
  /** Auto-translated when the category is created; null until then, or if translation failed. */
  nameHe: string | null
  sortOrder: number
  photoUrl: string | null
}

export interface ProductColor {
  id: string
  colorName: string
  colorNameHe: string | null
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
  nameHe: string | null
  categoryId: string
  categoryName: string
  description: string
  descriptionHe: string | null
  price: number
  sizes: string[]
  isActive: boolean
  /** General photos and/or videos — as many as the admin likes, shown by default and as the fallback for colors with no photo of their own. */
  media: ProductMedia[]
  colors: ProductColor[]
  /** Where to center the cover photo crop in the product grid, as a percentage (50/50 = center). */
  coverFocalX: number
  coverFocalY: number
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

/** Fulfilment stage, set by the admin so the customer can follow their order's journey. */
export type RequestStage = 'products_selected' | 'confirmed' | 'shipped' | 'arrived_country' | 'at_delivery_company' | 'delivered'

export const REQUEST_STAGES: RequestStage[] = ['products_selected', 'confirmed', 'shipped', 'arrived_country', 'at_delivery_company', 'delivered']

export const REQUEST_STAGE_LABELS: Record<RequestStage, string> = {
  products_selected: 'تم اختيار المنتجات',
  confirmed: 'تم تأكيد الطلب',
  shipped: 'تم الشحن',
  arrived_country: 'وصل إلى بلدكِ',
  at_delivery_company: 'وصل لشركة التوصيل',
  delivered: 'تم التوصيل للمنزل',
}

export const REQUEST_STAGE_LABELS_HE: Record<RequestStage, string> = {
  products_selected: 'המוצרים נבחרו',
  confirmed: 'ההזמנה אושרה',
  shipped: 'נשלח',
  arrived_country: 'הגיע לארצך',
  at_delivery_company: 'הגיע לחברת המשלוחים',
  delivered: 'נמסר לבית',
}

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

export interface RequestMessage {
  id: string
  requestId: string
  body: string
  createdAt: string
}

export interface CustomerRequest {
  id: string
  /** Short human-friendly reference, e.g. "ORD-00001" — shown instead of the raw id. */
  orderNumber: string
  customerId: string | null
  status: RequestStatus
  stage: RequestStage
  note: string
  createdAt: string
  items: RequestItem[]
  messages: RequestMessage[]
  /** Set only for guest orders (no customer account). */
  guestFullName: string | null
  guestCountry: string | null
  guestPhone: string | null
  guestInstagram: string | null
  /** Present only when loaded by an admin (joined from customer_profiles) for a signed-in customer. */
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
