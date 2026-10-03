import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PromoBar } from '@/components/layout/PromoBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileMenu } from '@/components/layout/MobileMenu'

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[80] bg-ink px-4 py-3 text-sm text-ivory focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <PromoBar />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
      <MobileMenu />
    </div>
  )
}
