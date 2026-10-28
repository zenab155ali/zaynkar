import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import MyLikedItemsPage from '@/pages/store/MyLikedItemsPage'
import MyRequestsPage from '@/pages/store/MyRequestsPage'
import SelectionsPage from '@/pages/store/SelectionsPage'
import SellYourDressPage from '@/pages/store/SellYourDressPage'
import SignInPage from '@/pages/store/SignInPage'
import SignUpPage from '@/pages/store/SignUpPage'
import StorePage from '@/pages/store/StorePage'
import StoreProductPage from '@/pages/store/StoreProductPage'
import { usePageViewTracking } from '@/hooks/usePageViewTracking'

// Loaded on demand instead of shipped to every customer: the admin panel (customers never
// open it) and the old prototype/mock-data pages (nothing links to them anymore) were
// previously bundled into the same file every shopper had to download before seeing a
// single product — a meaningful chunk of what made the store feel slow to load.
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'))
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminRequestsPage = lazy(() => import('@/pages/admin/AdminRequestsPage'))
const AdminResaleSubmissionsPage = lazy(() => import('@/pages/admin/AdminResaleSubmissionsPage'))

const AccountPage = lazy(() => import('@/pages/AccountPage'))
const BagPage = lazy(() => import('@/pages/BagPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const CollectionPage = lazy(() => import('@/pages/CollectionPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const StaticPage = lazy(() => import('@/pages/StaticPage'))

export default function App() {
  usePageViewTracking()
  return (
    <Suspense fallback={null}>
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
        <Route path="resale" element={<AdminResaleSubmissionsPage />} />
      </Route>

      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        {/* The real, live shop — connected to the real database. */}
        <Route path="store" element={<StorePage />} />
        <Route path="store/:code" element={<StoreProductPage />} />
        <Route path="sell-your-dress" element={<SellYourDressPage />} />
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
    </Suspense>
  )
}
