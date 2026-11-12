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
    title: 'سياسة الخصوصية',
    eyebrow: 'قانوني',
    intro: 'كيف نتعامل مع معلوماتكِ.',
    sections: [
      {
        heading: '١. المعلومات التي نجمعها',
        body: [
          'عند إنشاء حساب أو إرسال طلب، نجمع اسمكِ ورقم هاتفكِ وبريدكِ الإلكتروني، وبلدكِ/مدينتكِ إذا أدخلتيها. إذا اخترتِ عرض فستان للبيع عبر "فستانك لغيرك"، نجمع أيضًا حساب الإنستغرام إذا أضفتيه — وهاد ما بيظهر لأي زبونة تانية، بس إلنا.',
        ],
      },
      {
        heading: '٢. كيف نستخدم معلوماتكِ',
        body: ['نستخدم هاي المعلومات فقط للتواصل معكِ وتأكيد طلبكِ وتنسيق التوصيل — ما منبيعها ولا منشاركها مع أي جهة خارجية.'],
      },
      {
        heading: '٣. أمان البيانات',
        body: ['بياناتكِ محفوظة بشكل آمن عبر مزود خدمة موثوق (Supabase)، وما حدا يقدر يوصلها غيرنا.'],
      },
      {
        heading: '٤. إحصائيات الزيارات',
        body: ['منجمع عدد زيارات الموقع بشكل عام فقط (بدون أي معلومة شخصية) عشان نفهم كيف يستخدم الزبائن الموقع ونحسّنه.'],
      },
      {
        heading: '٥. حذف بياناتكِ',
        body: ['إذا بدّكِ تمسحي حسابكِ أو بياناتكِ بشكل كامل، تواصلي معنا مباشرة وبنساعدكِ فورًا.'],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'الشروط والأحكام',
    eyebrow: 'قانوني',
    intro: 'كل اللي بدّكِ تعرفيه قبل ما تطلبي.',
    sections: [
      {
        heading: '١. تأكيد الطلب',
        body: ['إرسال قائمتكِ ما بياخد أي دفعة — هو بس طلب نراجعه ونتواصل معكِ لتأكيد التفاصيل وإتمام الطلب.'],
      },
      {
        heading: '٢. الطلب والشحن من تركيا',
        body: [
          'جميع القطع التي نعرضها يتم طلبها وشحنها من تركيا.',
          'وبما أننا نجمع عدة طلبات في شحنة واحدة، فإن الشحن لا يتم بشكل يومي.',
          'قد تختلف مواعيد الشحن والتوصيل حسب عدد الطلبات وجاهزية المنتجات لدى الموردين.',
          'نحرص على إبلاغكِ بموعد الشحنة المتوقع عندما تتوفر لدينا المعلومات.',
          'وإذا كنتِ بحاجة إلى قطعة لمناسبة معينة، فنرجو إخبارنا بموعد المناسبة قبل الطلب.',
          'حتى نتمكن من توضيح إمكانية وصولها في الوقت المناسب، دون تقديم وعود غير مؤكدة.',
          'نحن نقدّر صبركِ وثقتكِ، ونسعى لأن تكون تجربة طلبكِ واضحة ومريحة قدر الإمكان. 🤎',
        ],
      },
      {
        heading: '٣. سياسة الاسترجاع والاستبدال',
        body: [
          'نرجو منكِ التأكد جيدًا من المقاس واللون وجميع تفاصيل المنتج قبل تأكيد الطلب.',
          'فمعظم القطع يتم طلبها خصيصًا لكِ من الموردين في تركيا.',
          'ولهذا السبب، لا نستطيع توفير استرجاع أو استبدال اختياري بعد تأكيد الطلب لمجرد تغيير الرأي.',
          'إذا كنتِ مترددة بشأن المقاس أو لديكِ أي استفسار، فلا تترددي في التواصل معنا قبل الطلب.',
          'يسعدنا مساعدتكِ في اختيار القطعة المناسبة وتوضيح التفاصيل المتوفرة لدينا.',
          'وفي حال وصول منتج معيب أو مختلف عن طلبكِ، يرجى التواصل معنا لنراجع المشكلة ونعالجها وفقًا لحقوقكِ القانونية.',
          'نحرص على الوضوح معكِ منذ البداية، لأن ثقتكِ ورضاكِ يهمّاننا. 🤎',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Settings',
    eyebrow: 'قانوني',
    intro: 'Choose which optional storage ZAYNKAR may use. Essential storage keeps your bag and favorites working.',
    kind: 'cookies',
  },
]

export const getStaticPage = (slug: string): StaticPageDef | undefined => STATIC_PAGES.find((p) => p.slug === slug)
