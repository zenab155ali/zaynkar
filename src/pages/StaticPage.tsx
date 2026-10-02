import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { AccordionItem } from '@/components/ui/Accordion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Flag } from '@/components/ui/Flag'
import { TextField } from '@/components/ui/TextField'
import { SizeGuideModal } from '@/components/product/SizeGuideModal'
import { STORAGE_KEYS } from '@/config'
import { useToast } from '@/context/ToastContext'
import { COUNTRIES } from '@/data/countries'
import { PRODUCTS } from '@/data/products'
import { STATIC_PAGES, getStaticPage } from '@/data/staticPages'
import { STORES } from '@/data/stores'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import NotFoundPage from '@/pages/NotFoundPage'

function SellersGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STORES.map((s) => (
        <li key={s.id} className="flex flex-col border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="display text-2xl leading-tight">{s.name}</p>
            <Flag code={s.country} size={14} />
          </div>
          <p className="mt-1 text-xs text-muted">
            {s.city}, {COUNTRIES[s.country].name} · Since {s.since}
          </p>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.about}</p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1">
              <Star size={13} fill="currentColor" strokeWidth={0} className="text-mocha" aria-hidden="true" /> {s.rating.toFixed(1)}
            </span>
            <Link to={`/search?q=${encodeURIComponent(s.name)}`} className="underline underline-offset-4">
              Shop {PRODUCTS.filter((p) => p.storeId === s.id).length} styles
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}

function CookieSettings() {
  const { toast } = useToast()
  const [prefs, setPrefs] = useLocalStorage(STORAGE_KEYS.cookies, { analytics: false, marketing: false })
  const rows: { key: 'analytics' | 'marketing'; title: string; text: string }[] = [
    { key: 'analytics', title: 'Analytics', text: 'Help us understand how the site is used. (Not active in this prototype.)' },
    { key: 'marketing', title: 'Marketing', text: 'Personalised recommendations and promotions. (Not active in this prototype.)' },
  ]
  return (
    <div className="max-w-2xl">
      <ul className="divide-y divide-line border-y border-line">
        <li className="flex items-center justify-between gap-6 py-5">
          <div>
            <p className="text-sm font-medium">Essential</p>
            <p className="mt-1 text-xs text-muted">Keeps your bag, favorites and preferences on this device. Always on.</p>
          </div>
          <input type="checkbox" checked disabled aria-label="Essential storage (always on)" className="h-5 w-5 accent-ink" />
        </li>
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-6 py-5">
            <div>
              <label htmlFor={`cookie-${r.key}`} className="text-sm font-medium">
                {r.title}
              </label>
              <p className="mt-1 text-xs text-muted">{r.text}</p>
            </div>
            <input id={`cookie-${r.key}`} type="checkbox" checked={prefs[r.key]} onChange={(e) => setPrefs({ ...prefs, [r.key]: e.target.checked })} className="h-5 w-5 accent-ink" />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => toast({ title: 'Preferences saved' })} className="btn btn-primary mt-6">
        Save preferences
      </button>
    </div>
  )
}

function ContactForm() {
  const { toast } = useToast()
  const [sent, setSent] = useState(false)
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.currentTarget.reset()
    setSent(true)
    toast({ title: 'Message sent', description: 'Demo only — nothing was transmitted.' })
  }
  return (
    <form onSubmit={submit} className="grid max-w-xl gap-4">
      <TextField label="Your name" required autoComplete="name" />
      <TextField label="Email" type="email" required autoComplete="email" />
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
          How can we help? *
        </label>
        <textarea id="contact-message" required rows={5} className="field !h-auto py-3" />
      </div>
      <div>
        <button type="submit" className="btn btn-primary">
          Send message
        </button>
        {sent && (
          <p role="status" className="mt-3 text-sm text-success">
            Thanks — this is a demo form, so your message wasn’t actually sent.
          </p>
        )}
      </div>
    </form>
  )
}

export default function StaticPage() {
  const { slug = '' } = useParams()
  const page = getStaticPage(slug)
  const [guide, setGuide] = useState<'clothing' | 'shoes' | null>(null)
  useDocumentTitle(page?.title)
  if (!page) return <NotFoundPage />

  return (
    <div className="container-page pt-4 sm:pt-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: page.eyebrow }, { label: page.title }]} />

      <div className="grid gap-10 pb-6 pt-8 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <nav aria-label={page.eyebrow} className="hidden lg:block">
          <p className="eyebrow mb-4">{page.eyebrow}</p>
          <ul className="space-y-2.5 text-sm">
            {STATIC_PAGES.filter((p) => p.eyebrow === page.eyebrow).map((p) => (
              <li key={p.slug}>
                <Link to={`/info/${p.slug}`} aria-current={p.slug === page.slug ? 'page' : undefined} className={p.slug === page.slug ? 'font-medium' : 'text-muted hover:text-ink'}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0">
          <p className="eyebrow lg:hidden">{page.eyebrow}</p>
          <h1 className="display mt-1 text-4xl sm:text-6xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{page.intro}</p>

          <div className="mt-10">
            {page.kind === 'sellers' && <SellersGrid />}
            {page.kind === 'cookies' && <CookieSettings />}
            {page.kind === 'contact' && <ContactForm />}
            {page.kind === 'size-guide' && (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setGuide('clothing')} className="btn btn-primary">
                  Clothing sizes
                </button>
                <button type="button" onClick={() => setGuide('shoes')} className="btn btn-outline">
                  Shoe sizes
                </button>
              </div>
            )}
            {page.kind === 'faq' && page.faqs && (
              <div className="max-w-2xl border-t border-line">
                {page.faqs.map((f, i) => (
                  <AccordionItem key={f.q} title={f.q} defaultOpen={i === 0}>
                    {f.a}
                  </AccordionItem>
                ))}
              </div>
            )}
            {page.sections && (
              <div className="max-w-2xl space-y-8">
                {page.sections.map((s) => (
                  <section key={s.heading}>
                    <h2 className="display text-2xl sm:text-3xl">{s.heading}</h2>
                    {s.body.map((para) => (
                      <p key={para} className="mt-3 text-sm leading-relaxed text-muted">
                        {para}
                      </p>
                    ))}
                  </section>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>

      <SizeGuideModal open={guide !== null} onClose={() => setGuide(null)} defaultTab={guide ?? 'clothing'} />
    </div>
  )
}
