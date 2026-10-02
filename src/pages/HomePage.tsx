import { CategoryGrid } from '@/components/home/CategoryGrid'
import { CompleteMyLookBanner } from '@/components/home/CompleteMyLookBanner'
import { Hero } from '@/components/home/Hero'
import { LiveShopBanner } from '@/components/home/LiveShopBanner'
import { ModestEdit } from '@/components/home/ModestEdit'
import { NewArrivals } from '@/components/home/NewArrivals'
import { SellersStrip } from '@/components/home/SellersStrip'
import { TrendingNow } from '@/components/home/TrendingNow'
import { ValueProps } from '@/components/home/ValueProps'
import { WorldSection } from '@/components/home/WorldSection'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle()
  return (
    <>
      <LiveShopBanner />
      <Hero />
      <ValueProps />
      <CategoryGrid />
      <NewArrivals />
      <TrendingNow />
      <WorldSection />
      <ModestEdit />
      <CompleteMyLookBanner />
      <SellersStrip />
    </>
  )
}
