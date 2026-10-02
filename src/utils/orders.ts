import type { Address, Order, OrderItem, UserProfile } from '@/types'
import { STORAGE_KEYS } from '@/config'
import { getProduct } from '@/data/products'
import { shippingFor } from '@/utils/pricing'

export const MOCK_PROFILE: UserProfile = {
  firstName: 'Selin',
  lastName: 'Aydin',
  email: 'selin.demo@example.com',
  phone: '+972 50 000 0000',
  birthday: '',
  newsletter: true,
}

export const MOCK_ADDRESSES: Address[] = [
  { id: 'addr-1', label: 'Home', fullName: 'Selin Aydin', line1: '12 Herzl Street', line2: 'Apt 4', city: 'Tel Aviv', postalCode: '6578901', country: 'Israel', phone: '+972 50 000 0000', isDefault: true },
  { id: 'addr-2', label: 'Work', fullName: 'Selin Aydin', line1: '5 Rothschild Blvd', city: 'Tel Aviv', postalCode: '6688101', country: 'Israel', phone: '+972 50 000 0000', isDefault: false },
]

const seedItem = (productId: string, size: string, color: string, quantity = 1): OrderItem => {
  const p = getProduct(productId)
  if (!p) throw new Error(`Unknown product in seed order: ${productId}`)
  return { productId, name: p.name, brand: p.brand, size, color, quantity, price: p.price }
}

const seedOrder = (id: string, placedAt: string, status: Order['status'], items: OrderItem[]): Order => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = shippingFor(subtotal)
  return { id, placedAt, status, items, subtotal, shipping, total: subtotal + shipping, deliveryMethod: 'Standard delivery' }
}

const SEED_ORDERS: Order[] = [
  seedOrder('ZK-204981', '2026-09-02', 'Shipped', [seedItem('black-pleated-maxi-skirt', 'M', 'Black'), seedItem('ivory-cotton-hijab', 'One Size', 'Ivory', 2)]),
  seedOrder('ZK-198244', '2026-08-14', 'Delivered', [seedItem('cognac-woven-leather-tote', 'One Size', 'Cognac')]),
  seedOrder('ZK-187530', '2026-07-03', 'Delivered', [seedItem('poppy-polka-dot-midi-dress', 'S', 'Red'), seedItem('nude-pointed-pumps', '38', 'Beige')]),
]

const readSaved = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.orders)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

/** Orders placed through the demo checkout (newest first) followed by the seeded history. */
export const loadOrders = (): Order[] => [...readSaved(), ...SEED_ORDERS]

export const getOrder = (id: string): Order | undefined => loadOrders().find((o) => o.id === id)

export function saveOrder(order: Order): void {
  try {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([order, ...readSaved()]))
  } catch {
    /* storage unavailable — order still shown on the confirmation page via router state */
  }
}

export const generateOrderId = (): string => `ZK-${Math.floor(100000 + Math.random() * 900000)}`
