import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { ProductsProvider } from '@/context/ProductsContext'
import { SelectionsProvider } from '@/context/SelectionsContext'
import { ToastProvider } from '@/context/ToastContext'
import { UIProvider } from '@/context/UIContext'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CurrencyProvider>
        <ToastProvider>
          <AuthProvider>
            <ProductsProvider>
              <SelectionsProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <UIProvider>
                      <App />
                    </UIProvider>
                  </CartProvider>
                </FavoritesProvider>
              </SelectionsProvider>
            </ProductsProvider>
          </AuthProvider>
        </ToastProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </StrictMode>,
)
