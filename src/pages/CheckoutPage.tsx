import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, CreditCard, Lock, ShoppingBag } from 'lucide-react'
import { OrderSummary } from '@/components/bag/OrderSummary'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { TextField } from '@/components/ui/TextField'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { EXPRESS_SHIPPING, FREE_SHIPPING_THRESHOLD } from '@/config'
import { DELIVERY_OPTIONS, shippingFor, type DeliveryMethod } from '@/utils/pricing'
import { generateOrderId, saveOrder } from '@/utils/orders'
import type { Order } from '@/types'

const STEPS = ['Contact', 'Shipping address', 'Delivery', 'Payment'] as const
const COUNTRIES = ['Israel', 'Turkey', 'Italy', 'South Korea', 'United Arab Emirates', 'United Kingdom', 'United States', 'Germany', 'France']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface Form {
  email: string
  phone: string
  firstName: string
  lastName: string
  line1: string
  line2: string
  city: string
  postalCode: string
  country: string
  delivery: DeliveryMethod
}

const INITIAL: Form = { email: '', phone: '', firstName: '', lastName: '', line1: '', line2: '', city: '', postalCode: '', country: 'Israel', delivery: 'standard' }

function validate(step: number, f: Form): Record<string, string> {
  const errors: Record<string, string> = {}
  if (step === 0) {
    if (!f.email.trim()) errors.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Enter a valid email address, like name@example.com.'
  }
  if (step === 1) {
    if (!f.firstName.trim()) errors.firstName = 'Enter your first name.'
    if (!f.lastName.trim()) errors.lastName = 'Enter your last name.'
    if (!f.line1.trim()) errors.line1 = 'Enter your street address.'
    if (!f.city.trim()) errors.city = 'Enter your city.'
    if (!f.postalCode.trim()) errors.postalCode = 'Enter your postal code.'
  }
  return errors
}

function StepShell({ index, current, title, summary, onEdit, children }: { index: number; current: number; title: string; summary?: ReactNode; onEdit: () => void; children: ReactNode }) {
  const done = index < current
  const active = index === current
  return (
    <section aria-labelledby={`step-${index}`} className={`border-b border-line py-6 ${!done && !active ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-medium ${done ? 'bg-success text-white' : active ? 'bg-ink text-ivory' : 'bg-sand-deep text-muted'}`}>
          {done ? <Check size={14} aria-hidden="true" /> : index + 1}
        </span>
        <h2 id={`step-${index}`} className="display text-2xl">
          {title}
        </h2>
        {done && (
          <button type="button" onClick={onEdit} className="ml-auto text-xs underline underline-offset-4">
            Edit<span className="sr-only"> {title}</span>
          </button>
        )}
      </div>
      {done && summary && <div className="mt-3 pl-10 text-sm text-muted">{summary}</div>}
      {active && <div className="mt-6 sm:pl-10">{children}</div>}
    </section>
  )
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const navigate = useNavigate()
  const { format } = useCurrency()
  const { lines, subtotal, clear } = useCart()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const placed = useRef(false)
  const formRef = useRef<HTMLDivElement>(null)

  const shipping = shippingFor(subtotal, form.delivery)
  const total = subtotal + shipping
  const deliveryLabel = DELIVERY_OPTIONS.find((d) => d.id === form.delivery)

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  if (lines.length === 0 && !placed.current) {
    return (
      <div className="container-page pt-4 sm:pt-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping Bag', to: '/bag' }, { label: 'Checkout' }]} />
        <EmptyState icon={<ShoppingBag size={28} strokeWidth={1.3} />} title="Nothing to check out" description="Your bag is empty. Add a few pieces first.">
          <Link to="/shop/new-in" className="btn btn-primary">
            Shop new in
          </Link>
        </EmptyState>
      </div>
    )
  }

  const next = (e: FormEvent) => {
    e.preventDefault()
    const found = validate(step, form)
    setErrors(found)
    if (Object.keys(found).length) {
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0)
      return
    }
    setStep((s) => s + 1)
  }

  const placeOrder = () => {
    placed.current = true
    const order: Order = {
      id: generateOrderId(),
      placedAt: new Date().toISOString().slice(0, 10),
      status: 'Processing',
      items: lines.map((l) => ({ productId: l.productId, name: l.product.name, brand: l.product.brand, size: l.size, color: l.color, quantity: l.quantity, price: l.product.price })),
      subtotal,
      shipping,
      total,
      deliveryMethod: deliveryLabel?.label ?? 'Standard delivery',
      demo: true,
    }
    saveOrder(order)
    clear()
    navigate(`/order-confirmation/${order.id}`, { replace: true, state: { order } })
  }

  const backTo = (i: number) => setStep(i)

  return (
    <div className="container-page pt-4 sm:pt-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping Bag', to: '/bag' }, { label: 'Checkout' }]} />
      <h1 className="display mt-5 text-4xl sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-xs text-muted sm:hidden" aria-live="polite">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {/* Mobile summary */}
      <details className="mt-6 border border-line bg-sand/60 lg:hidden">
        <summary className="flex items-center justify-between px-4 py-3.5 text-sm font-medium">
          <span>Order summary ({lines.length})</span>
          <span>{format(total)}</span>
        </summary>
        <div className="border-t border-line p-4">
          <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} total={total} showItems shippingLabel="Shipping" />
        </div>
      </details>

      <div className="mt-6 grid gap-12 lg:mt-8 lg:grid-cols-[1fr_24rem] lg:gap-16">
        <div ref={formRef}>
          <StepShell index={0} current={step} title="Contact" onEdit={() => backTo(0)} summary={`${form.email}${form.phone ? ` · ${form.phone}` : ''}`}>
            <form onSubmit={next} noValidate className="max-w-xl space-y-4">
              <TextField label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
              <TextField label="Phone (for delivery updates)" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                Continue to shipping
              </button>
            </form>
          </StepShell>

          <StepShell index={1} current={step} title="Shipping address" onEdit={() => backTo(1)} summary={`${form.firstName} ${form.lastName}, ${form.line1}${form.line2 ? `, ${form.line2}` : ''}, ${form.city} ${form.postalCode}, ${form.country}`}>
            <form onSubmit={next} noValidate className="grid max-w-xl gap-4 sm:grid-cols-2">
              <TextField label="First name" autoComplete="given-name" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} />
              <TextField label="Last name" autoComplete="family-name" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} />
              <TextField className="sm:col-span-2" label="Street address" autoComplete="address-line1" required value={form.line1} onChange={(e) => set('line1', e.target.value)} error={errors.line1} />
              <TextField className="sm:col-span-2" label="Apartment, suite, etc. (optional)" autoComplete="address-line2" value={form.line2} onChange={(e) => set('line2', e.target.value)} />
              <TextField label="City" autoComplete="address-level2" required value={form.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
              <TextField label="Postal code" autoComplete="postal-code" required value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} error={errors.postalCode} />
              <div className="sm:col-span-2">
                <label htmlFor="checkout-country" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
                  Country / region
                </label>
                <select id="checkout-country" autoComplete="country-name" value={form.country} onChange={(e) => set('country', e.target.value)} className="field">
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  Continue to delivery
                </button>
              </div>
            </form>
          </StepShell>

          <StepShell index={2} current={step} title="Delivery" onEdit={() => backTo(2)} summary={`${deliveryLabel?.label} · ${deliveryLabel?.eta} · ${shipping === 0 ? 'Free' : format(shipping)}`}>
            <form onSubmit={next} className="max-w-xl">
              <fieldset>
                <legend className="sr-only">Delivery method</legend>
                <div className="space-y-3">
                  {DELIVERY_OPTIONS.map((opt) => {
                    const price = shippingFor(subtotal, opt.id)
                    const selected = form.delivery === opt.id
                    return (
                      <label key={opt.id} className={`flex cursor-pointer items-center gap-4 border p-4 transition-colors ${selected ? 'border-ink bg-white' : 'border-line hover:border-taupe'}`}>
                        <input type="radio" name="delivery" checked={selected} onChange={() => set('delivery', opt.id)} className="h-4 w-4 accent-ink" />
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{opt.label}</span>
                          <span className="text-xs text-muted">{opt.eta}</span>
                        </span>
                        <span className="text-sm font-medium">{price === 0 ? 'Free' : format(price)}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
              <p className="mt-3 text-xs text-muted">
                Standard delivery is free on orders over {format(FREE_SHIPPING_THRESHOLD)}. Express is a flat {format(EXPRESS_SHIPPING)}. Items from different sellers may ship in separate parcels.
              </p>
              <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto">
                Continue to payment
              </button>
            </form>
          </StepShell>

          <StepShell index={3} current={step} title="Payment" onEdit={() => backTo(3)}>
            <div className="max-w-xl">
              <div role="note" className="mb-6 flex gap-3 border border-mocha/40 bg-sand p-4 text-sm">
                <CreditCard size={20} className="mt-0.5 shrink-0 text-mocha" aria-hidden="true" />
                <div>
                  <p className="font-medium">
                    <span className="mr-2 bg-mocha px-1.5 py-0.5 text-[0.625rem] font-medium tracking-[0.14em] text-ivory">DEMO MODE</span>
                    No payment is taken
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">This is a prototype. The card details below are pre-filled placeholders and cannot be edited. Nothing is collected, stored or sent anywhere — never enter real card details on a demo.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="demo-card" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
                    Card number (demo)
                  </label>
                  <input id="demo-card" className="field tracking-widest" value="4242 4242 4242 4242" readOnly aria-readonly="true" tabIndex={-1} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="demo-name" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
                    Name on card (demo)
                  </label>
                  <input id="demo-name" className="field" value="DEMO CUSTOMER" readOnly aria-readonly="true" tabIndex={-1} />
                </div>
                <div>
                  <label htmlFor="demo-exp" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
                    Expiry (demo)
                  </label>
                  <input id="demo-exp" className="field" value="12 / 34" readOnly aria-readonly="true" tabIndex={-1} />
                </div>
                <div>
                  <label htmlFor="demo-cvc" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
                    CVC (demo)
                  </label>
                  <input id="demo-cvc" className="field" value="•••" readOnly aria-readonly="true" tabIndex={-1} />
                </div>
              </div>

              <button type="button" onClick={placeOrder} className="btn btn-primary mt-8 !h-14 w-full text-[0.8125rem]">
                <Lock size={16} aria-hidden="true" />
                Place demo order · {format(total)}
              </button>
              <p className="mt-3 text-center text-xs text-muted">By placing this demo order you agree it is for demonstration only.</p>
            </div>
          </StepShell>
        </div>

        <aside aria-label="Order summary" className="hidden h-fit bg-sand/60 p-6 lg:sticky lg:top-36 lg:block">
          <h2 className="display mb-5 text-2xl">Order summary</h2>
          <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} total={total} showItems shippingLabel="Shipping" />
          <Link to="/bag" className="mt-5 inline-block text-xs underline underline-offset-4">
            Edit bag
          </Link>
        </aside>
      </div>
    </div>
  )
}
