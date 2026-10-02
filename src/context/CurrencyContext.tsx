import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/config'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { CURRENCIES, DEFAULT_CURRENCY, formatPrice, type CurrencyCode } from '@/utils/currency'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  /** Format an amount expressed in the base currency for display. */
  format: (amountInBase: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<CurrencyCode>(STORAGE_KEYS.currency, DEFAULT_CURRENCY)
  // Guard against a stale/disabled currency in storage.
  const currency = CURRENCIES[stored]?.enabled ? stored : DEFAULT_CURRENCY

  const setCurrency = useCallback(
    (code: CurrencyCode) => {
      if (CURRENCIES[code].enabled) setStored(code)
    },
    [setStored],
  )
  const format = useCallback((amount: number) => formatPrice(amount, currency), [currency])
  const value = useMemo(() => ({ currency, setCurrency, format }), [currency, setCurrency, format])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
