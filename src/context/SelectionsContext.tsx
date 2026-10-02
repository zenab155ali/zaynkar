import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/config'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useProducts } from '@/context/ProductsContext'
import type { CatalogProduct, SelectionLine } from '@/types/catalog'

export interface SelectionLineDetailed extends SelectionLine {
  product: CatalogProduct
}

interface AddInput {
  productId: string
  size: string
  colorName: string
  quantity?: number
}

interface SelectionsContextValue {
  lines: SelectionLineDetailed[]
  count: number
  add: (input: AddInput) => void
  remove: (lineId: string) => void
  setQuantity: (lineId: string, quantity: number) => void
  clear: () => void
}

const SelectionsContext = createContext<SelectionsContextValue | null>(null)
const makeLineId = (productId: string, size: string, colorName: string) => `${productId}|${size}|${colorName}`

export function SelectionsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<SelectionLine[]>(STORAGE_KEYS.selections, [])
  const { getById } = useProducts()

  const lines = useMemo<SelectionLineDetailed[]>(
    () => items.flatMap((line) => {
      const product = getById(line.productId)
      return product ? [{ ...line, product }] : []
    }),
    [items, getById],
  )

  const add = useCallback(
    ({ productId, size, colorName, quantity = 1 }: AddInput) => {
      const id = makeLineId(productId, size, colorName)
      setItems((prev) =>
        prev.some((l) => l.id === id)
          ? prev.map((l) => (l.id === id ? { ...l, quantity: l.quantity + quantity } : l))
          : [...prev, { id, productId, size, colorName, quantity }],
      )
    },
    [setItems],
  )

  const remove = useCallback((lineId: string) => setItems((prev) => prev.filter((l) => l.id !== lineId)), [setItems])
  const setQuantity = useCallback(
    (lineId: string, quantity: number) => setItems((prev) => prev.map((l) => (l.id === lineId ? { ...l, quantity: Math.max(1, quantity) } : l))),
    [setItems],
  )
  const clear = useCallback(() => setItems([]), [setItems])

  const value = useMemo<SelectionsContextValue>(
    () => ({ lines, count: lines.reduce((sum, l) => sum + l.quantity, 0), add, remove, setQuantity, clear }),
    [lines, add, remove, setQuantity, clear],
  )

  return <SelectionsContext.Provider value={value}>{children}</SelectionsContext.Provider>
}

export function useSelections(): SelectionsContextValue {
  const ctx = useContext(SelectionsContext)
  if (!ctx) throw new Error('useSelections must be used within SelectionsProvider')
  return ctx
}
