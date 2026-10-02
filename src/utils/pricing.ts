import { EXPRESS_SHIPPING, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from '@/config'

export type DeliveryMethod = 'standard' | 'express'

export const DELIVERY_OPTIONS: { id: DeliveryMethod; label: string; eta: string }[] = [
  { id: 'standard', label: 'Standard delivery', eta: '4–7 business days' },
  { id: 'express', label: 'Express delivery', eta: '1–3 business days' },
]

/** Shipping in base currency. Standard is free above the threshold; an empty bag ships free (0). */
export function shippingFor(subtotal: number, method: DeliveryMethod = 'standard'): number {
  if (subtotal <= 0) return 0
  if (method === 'express') return EXPRESS_SHIPPING
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
}
