/**
 * Currency architecture
 * ---------------------
 * All product prices are stored in the BASE currency (ILS). Display currency is resolved at render time
 * with `formatPrice`, so multi-currency support later only needs: (1) flip `enabled`, (2) real FX rates,
 * (3) a switcher UI wired to CurrencyContext.
 */
export type CurrencyCode = 'ILS' | 'USD' | 'EUR' | 'TRY' | 'AED'

export interface CurrencyDef {
  code: CurrencyCode
  symbol: string
  name: string
  /** Units of this currency per 1 unit of the base currency. */
  rate: number
  enabled: boolean
}

export const BASE_CURRENCY: CurrencyCode = 'ILS'

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', rate: 1, enabled: true },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.27, enabled: false },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.25, enabled: false },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 11, enabled: false },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rate: 0.99, enabled: false },
}

export const DEFAULT_CURRENCY: CurrencyCode = 'ILS'

export const convertPrice = (amountInBase: number, currency: CurrencyCode): number =>
  amountInBase * CURRENCIES[currency].rate

export function formatPrice(amountInBase: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  const { symbol } = CURRENCIES[currency]
  const value = convertPrice(amountInBase, currency)
  const hasCents = Math.abs(value % 1) > 0.004
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)
  return `${symbol}${formatted}`
}
