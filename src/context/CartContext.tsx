import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { CartLine, Product } from '@/types'
import { MAX_LINE_QUANTITY, STORAGE_KEYS } from '@/config'
import { getProduct } from '@/data/products'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { shippingFor } from '@/utils/pricing'

export interface CartLineDetailed extends CartLine {
  product: Product
}

interface AddInput {
  productId: string
  size: string
  color: string
  quantity?: number
}

interface CartContextValue {
  lines: CartLineDetailed[]
  count: number
  subtotal: number
  /** Estimated standard shipping (base currency). */
  shipping: number
  total: number
  add: (input: AddInput) => void
  remove: (lineId: string) => void
  setQuantity: (lineId: string, quantity: number) => void
  setSize: (lineId: string, size: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export const makeLineId = (productId: string, size: string, color: string): string => `${productId}|${size}|${color}`
const clampQty = (q: number): number => Math.max(1, Math.min(MAX_LINE_QUANTITY, Math.floor(q) || 1))

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartLine[]>(STORAGE_KEYS.cart, [])

  const lines = useMemo<CartLineDetailed[]>(
    () =>
      Array.isArray(items)
        ? items.flatMap((line) => {
            const product = getProduct(line.productId)
            return product ? [{ ...line, product }] : []
          })
        : [],
    [items],
  )

  const add = useCallback(
    ({ productId, size, color, quantity = 1 }: AddInput) => {
      const id = makeLineId(productId, size, color)
      setItems((prev) =>
        prev.some((l) => l.id === id)
          ? prev.map((l) => (l.id === id ? { ...l, quantity: clampQty(l.quantity + quantity) } : l))
          : [...prev, { id, productId, size, color, quantity: clampQty(quantity) }],
      )
    },
    [setItems],
  )

  const remove = useCallback((lineId: string) => setItems((prev) => prev.filter((l) => l.id !== lineId)), [setItems])

  const setQuantity = useCallback(
    (lineId: string, quantity: number) =>
      setItems((prev) => prev.map((l) => (l.id === lineId ? { ...l, quantity: clampQty(quantity) } : l))),
    [setItems],
  )

  /** Changing size may collide with an existing line for the same item — merge them. */
  const setSize = useCallback(
    (lineId: string, size: string) =>
      setItems((prev) => {
        const line = prev.find((l) => l.id === lineId)
        if (!line || line.size === size) return prev
        const newId = makeLineId(line.productId, size, line.color)
        const target = prev.find((l) => l.id === newId)
        if (target) {
          return prev
            .filter((l) => l.id !== lineId)
            .map((l) => (l.id === newId ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l))
        }
        return prev.map((l) => (l.id === lineId ? { ...l, id: newId, size } : l))
      }),
    [setItems],
  )

  const clear = useCallback(() => setItems([]), [setItems])

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)
    const shipping = shippingFor(subtotal)
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      add,
      remove,
      setQuantity,
      setSize,
      clear,
    }
  }, [lines, add, remove, setQuantity, setSize, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
