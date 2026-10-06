import { CategoryTiles } from '@/components/home/CategoryTiles'
import { Hero } from '@/components/home/Hero'
import { LiveShopBanner } from '@/components/home/LiveShopBanner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle()
  return (
    <>
      <LiveShopBanner />
      <Hero />
      <CategoryTiles />
    </>
  )
}
