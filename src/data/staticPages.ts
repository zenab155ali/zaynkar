export type StaticKind = 'default' | 'sellers' | 'cookies' | 'contact' | 'faq' | 'size-guide'

export interface StaticSection {
  heading: string
  body: string[]
}

export interface StaticPageDef {
  slug: string
  title: string
  eyebrow: string
  intro: string
  kind?: StaticKind
  sections?: StaticSection[]
  faqs?: { q: string; a: string }[]
}

const PROTOTYPE_NOTE = 'ZAYNKAR is currently an early prototype. This page is placeholder content and will be replaced before launch.'

export const STATIC_PAGES: StaticPageDef[] = [
  {
    slug: 'contact',
    title: 'Contact Us',
    eyebrow: 'Help',
    intro: 'Questions about an order, a seller or your account? Send us a message and we’ll get back to you.',
    kind: 'contact',
  },
  {
    slug: 'shipping',
    title: 'Shipping',
    eyebrow: 'Help',
    intro: 'Every seller ships directly to you. Here is how delivery works on ZAYNKAR.',
    sections: [
      { heading: 'Delivery times', body: ['Standard delivery takes 4–7 business days and Express takes 1–3 business days once your order has been dispatched by the seller.', 'Handling times can vary by seller — the estimated delivery is shown at checkout.'] },
      { heading: 'Shipping costs', body: ['Standard shipping is free on orders over ₪250, otherwise ₪25. Express delivery is a flat ₪49.'] },
      { heading: 'Multiple sellers', body: ['If your bag contains items from different sellers, they may arrive in separate parcels. You’ll receive tracking for each.'] },
      { heading: 'Prototype note', body: [PROTOTYPE_NOTE] },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns',
    eyebrow: 'Help',
    intro: 'Changed your mind? Returns are simple.',
    sections: [
      { heading: '30-day returns', body: ['Return unworn items with their tags attached within 30 days of delivery for a full refund to your original payment method.'] },
      { heading: 'How to return', body: ['Start a return from your account, print the label included in your parcel, and drop the package at your nearest collection point.'] },
      { heading: 'Non-returnable items', body: ['For hygiene reasons, jewellery worn on pierced ears and hijabs whose packaging has been opened cannot be returned unless faulty.'] },
      { heading: 'Prototype note', body: [PROTOTYPE_NOTE] },
    ],
  },
  {
    slug: 'size-guide',
    title: 'Size Guide',
    eyebrow: 'Help',
    intro: 'Find your best fit. Sellers may vary slightly, so always check the fit note on each product page.',
    kind: 'size-guide',
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    eyebrow: 'Help',
    intro: 'Quick answers about shopping on ZAYNKAR.',
    kind: 'faq',
    faqs: [
      { q: 'What is ZAYNKAR?', a: 'ZAYNKAR is a fashion marketplace that connects independent stores and brands from different countries in one place. We are starting with Turkey and expanding to more markets.' },
      { q: 'Who sells the products?', a: 'Each product is sold and shipped by an independent store. You will always see the seller name and where the item ships from on the product page.' },
      { q: 'Is ZAYNKAR only for modest fashion?', a: 'No. ZAYNKAR is a full fashion marketplace. Modest fashion is an important collection — The Modest Edit — alongside dresses, tops, shoes, bags and more.' },
      { q: 'Which currency do you use?', a: 'Prices are currently shown in Israeli shekels (₪). More currencies will be added as we grow.' },
      { q: 'Can I really buy something?', a: 'Not yet. This is a prototype with sample products — the checkout is a demo and no payment is processed.' },
    ],
  },
  {
    slug: 'our-story',
    title: 'Our Story',
    eyebrow: 'About ZAYNKAR',
    intro: 'A global fashion marketplace, built for discovery.',
    sections: [
      { heading: 'Why we exist', body: ['Great fashion is made everywhere, but it’s hard to find. ZAYNKAR brings independent stores and brands from around the world together, so you can discover — and buy — in one place.'] },
      { heading: 'Starting in Turkey', body: ['We’re beginning with Turkish designers and ateliers, then growing to Italy, South Korea, the UAE and beyond.'] },
      { heading: 'Fashion for everyone', body: ['From everyday essentials to evening dresses and modest fashion, ZAYNKAR is designed for a young, international shopper who wants style with story.'] },
    ],
  },
  {
    slug: 'our-sellers',
    title: 'Our Sellers',
    eyebrow: 'About ZAYNKAR',
    intro: 'Independent stores and brands, each reviewed by the ZAYNKAR team. All stores shown here are fictional and used for this prototype.',
    kind: 'sellers',
  },
  {
    slug: 'careers',
    title: 'Careers',
    eyebrow: 'About ZAYNKAR',
    intro: 'We’re building the future of global fashion shopping.',
    sections: [
      { heading: 'Join us', body: ['We’ll be hiring across product, engineering, seller success and merchandising as we grow. Check back soon.'] },
      { heading: 'Prototype note', body: [PROTOTYPE_NOTE] },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    eyebrow: 'Legal',
    intro: 'How we treat your information.',
    sections: [
      { heading: 'This prototype', body: ['This prototype stores your bag, favorites and preferences only in your browser (localStorage). Nothing is sent to a server, and no payment or card data is collected.'] },
      { heading: 'Future policy', body: ['A full privacy policy covering accounts, payments, sellers and cookies will be published before ZAYNKAR launches.'] },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    eyebrow: 'Legal',
    intro: 'The rules for using ZAYNKAR.',
    sections: [
      { heading: 'Prototype', body: ['ZAYNKAR is a demonstration. Products, stores, reviews and prices are sample content. No orders can be placed and no payments are processed.'] },
      { heading: 'Future terms', body: ['Full terms for buyers and sellers will be published before launch.'] },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Settings',
    eyebrow: 'Legal',
    intro: 'Choose which optional storage ZAYNKAR may use. Essential storage keeps your bag and favorites working.',
    kind: 'cookies',
  },
]

export const getStaticPage = (slug: string): StaticPageDef | undefined => STATIC_PAGES.find((p) => p.slug === slug)
