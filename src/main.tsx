import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { LikesProvider } from '@/context/LikesContext'
import { ProductsProvider } from '@/context/ProductsContext'
import { SelectionsProvider } from '@/context/SelectionsContext'
import { ToastProvider } from '@/context/ToastContext'
import { UIProvider } from '@/context/UIContext'
import '@/index.css'

// React Router's basename must not end in a slash (it strips exactly `basename` as a
// prefix) — this matters once the base is nested more than one level deep, e.g. the
// archived "/zaynkar/versions/v4/" builds, where a trailing slash breaks route matching.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <CurrencyProvider>
        <ToastProvider>
          <AuthProvider>
            <ProductsProvider>
              <LikesProvider>
                <SelectionsProvider>
                  <FavoritesProvider>
                    <CartProvider>
                      <UIProvider>
                        <App />
                      </UIProvider>
                    </CartProvider>
                  </FavoritesProvider>
                </SelectionsProvider>
              </LikesProvider>
            </ProductsProvider>
          </AuthProvider>
        </ToastProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </StrictMode>,
)
