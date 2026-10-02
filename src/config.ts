/** Global site configuration. Money amounts here are in the BASE currency (see utils/currency.ts). */
export const SITE_NAME = 'ZAYNKAR'
export const SITE_TAGLINE = 'Your Style. Your World.'

export const FREE_SHIPPING_THRESHOLD = 250
export const STANDARD_SHIPPING = 25
export const EXPRESS_SHIPPING = 49
export const MAX_LINE_QUANTITY = 10
export const PRODUCTS_PER_PAGE = 24

export const STORAGE_KEYS = {
  cart: 'zaynkar:cart:v1',
  favorites: 'zaynkar:favorites:v1',
  recentlyViewed: 'zaynkar:recent:v1',
  orders: 'zaynkar:orders:v1',
  profile: 'zaynkar:profile:v1',
  addresses: 'zaynkar:addresses:v1',
  currency: 'zaynkar:currency:v1',
  cookies: 'zaynkar:cookies:v1',
  recentSearches: 'zaynkar:searches:v1',
} as const
