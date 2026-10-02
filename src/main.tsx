import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { CartProvider } from '@/context/CartContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { ToastProvider } from '@/context/ToastContext'
import { UIProvider } from '@/context/UIContext'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CurrencyProvider>
        <FavoritesProvider>
          <CartProvider>
            <ToastProvider>
              <UIProvider>
                <App />
              </UIProvider>
            </ToastProvider>
          </CartProvider>
        </FavoritesProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </StrictMode>,
)
