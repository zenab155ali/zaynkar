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
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminProductFormPage from '@/pages/admin/AdminProductFormPage'
import AdminProductsPage from '@/pages/admin/AdminProductsPage'
import AdminRequestsPage from '@/pages/admin/AdminRequestsPage'
import MyLikedItemsPage from '@/pages/store/MyLikedItemsPage'
import MyRequestsPage from '@/pages/store/MyRequestsPage'
import SelectionsPage from '@/pages/store/SelectionsPage'
import SignInPage from '@/pages/store/SignInPage'
import SignUpPage from '@/pages/store/SignUpPage'
import StorePage from '@/pages/store/StorePage'
import StoreProductPage from '@/pages/store/StoreProductPage'
import { usePageViewTracking } from '@/hooks/usePageViewTracking'

export default function App() {
  usePageViewTracking()
  return (
    <Routes>
      {/* Admin — separate shell, no site header/footer, reached only by knowing the URL + the admin login. */}
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:productId" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
      </Route>

      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        {/* The real, live shop — connected to the real database. */}
        <Route path="store" element={<StorePage />} />
        <Route path="store/:code" element={<StoreProductPage />} />
        <Route path="selections" element={<SelectionsPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="my-requests" element={<MyRequestsPage />} />
        <Route path="liked" element={<MyLikedItemsPage />} />

        {/* Prototype marketplace demo (mock data) — kept for reference / future expansion. */}
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
