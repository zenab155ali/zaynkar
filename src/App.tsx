import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import AccountPage from '@/pages/AccountPage'
import BagPage from '@/pages/BagPage'
import CheckoutPage from '@/pages/CheckoutPage'
import CollectionPage from '@/pages/CollectionPage'
import FavoritesPage from '@/pages/FavoritesPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import ProductPage from '@/pages/ProductPage'
import SearchPage from '@/pages/SearchPage'
import StaticPage from '@/pages/StaticPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<Navigate to="/shop/women" replace />} />
        <Route path="shop/:slug" element={<CollectionPage mode="shop" />} />
        <Route path="country/:code" element={<CollectionPage mode="country" />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="bag" element={<BagPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/:tab" element={<AccountPage />} />
        <Route path="info/:slug" element={<StaticPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
