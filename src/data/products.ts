import type { Category, Product, ProductImage, StyleTag } from '@/types'
import type { ImageKey } from '@/data/imageLibrary'
import { getStore } from '@/data/stores'

/* -------------------------------------------------------------------------- */
/*  Compact product spec → full Product                                        */
/* -------------------------------------------------------------------------- */

interface Spec {
  id: string
  name: string
  store: string
  cat: Category
  sub: string
  price: number
  was?: number
  colors: string[]
  imgs: ProductImage[]
  blurb: string
  mat: string
  /** Days since the product was listed (<= 21 counts as "NEW"). */
  days: number
  tags?: string[]
  styles?: StyleTag[]
  modest?: boolean
  best?: boolean
  sizes?: string[]
  oos?: string[]
  fit?: string
  rating?: number
  reviews?: number
}

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41']
const ONE_SIZE = ['One Size']

/** Main photo + two detail crops of the same photo (+ optional extra photos). */
const g = (main: ImageKey, ...alts: ImageKey[]): ProductImage[] => [
  { key: main },
  { key: main, focus: { x: 0.5, y: 0.3, zoom: 2.2 } },
  { key: main, focus: { x: 0.5, y: 0.78, zoom: 2 } },
  ...alts.map((key) => ({ key })),
]

const hash = (s: string): number => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return Math.abs(h)
}

const DEFAULT_FIT: Record<Category, string> = {
  dresses: 'True to size. Model is 176 cm and wears size S.',
  tops: 'Regular fit, true to size. Model is 176 cm and wears size S.',
  bottoms: 'True to size with a comfortable rise. Model is 176 cm and wears size S.',
  sets: 'True to size. Model is 176 cm and wears size S.',
  outerwear: 'Relaxed fit — size down for a closer cut. Model is 176 cm and wears size S.',
  shoes: 'True to size. If you are between sizes, we recommend sizing up.',
  bags: 'Dimensions approx. 26 × 19 × 9 cm. Adjustable strap where shown.',
  accessories: 'One size fits most.',
}

const DEFAULT_CARE: Record<Category, string> = {
  dresses: 'Machine wash cold on a gentle cycle. Do not tumble dry. Cool iron if needed.',
  tops: 'Machine wash cold on a gentle cycle. Do not tumble dry. Cool iron if needed.',
  bottoms: 'Machine wash cold. Wash with similar colours. Do not bleach.',
  sets: 'Machine wash cold on a gentle cycle. Wash both pieces together.',
  outerwear: 'Dry clean recommended. Steam to refresh. Store on a wide hanger.',
  shoes: 'Wipe clean with a soft, dry cloth. Use a protective spray on suede. Keep away from heat.',
  bags: 'Wipe with a soft dry cloth. Avoid prolonged contact with water. Store in the dust bag.',
  accessories: 'Store separately in a soft pouch. Avoid contact with perfume and water.',
}

const DEFAULT_STYLES: Record<Category, StyleTag[]> = {
  dresses: ['Elegant'],
  tops: ['Everyday'],
  bottoms: ['Everyday'],
  sets: ['Casual'],
  outerwear: ['Elegant'],
  shoes: ['Elegant'],
  bags: ['Everyday'],
  accessories: ['Elegant'],
}

const build = (s: Spec): Product => {
  const store = getStore(s.store)
  if (!store) throw new Error(`Unknown store "${s.store}" for product "${s.id}"`)
  const h = hash(s.id)
  const discount = s.was ? Math.round((1 - s.price / s.was) * 100) : undefined
  const sales = s.best ? 900 + (h % 500) : 60 + (h % 640)
  return {
    id: s.id,
    slug: s.id,
    name: s.name,
    storeId: store.id,
    brand: store.name,
    country: store.country,
    category: s.cat,
    subcategory: s.sub,
    modest: s.modest ?? false,
    styles: s.styles ?? DEFAULT_STYLES[s.cat],
    tags: s.tags ?? [],
    price: s.price,
    oldPrice: s.was,
    discount,
    colors: s.colors,
    sizes: s.sizes ?? (s.cat === 'shoes' ? SHOE_SIZES : s.cat === 'bags' || s.cat === 'accessories' ? ONE_SIZE : CLOTHING_SIZES),
    unavailableSizes: s.oos ?? [],
    images: s.imgs,
    description: `${s.blurb} Designed by ${store.name} in ${store.city}.`,
    material: s.mat,
    fit: s.fit ?? DEFAULT_FIT[s.cat],
    care: DEFAULT_CARE[s.cat],
    rating: s.rating ?? Math.round((4.3 + (h % 60) / 100) * 10) / 10,
    reviewCount: s.reviews ?? 14 + (h % 380),
    sales,
    daysOld: s.days,
    isNew: s.days <= 21,
    bestseller: s.best ?? false,
  }
}

/* -------------------------------------------------------------------------- */
/*  Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

const SPECS: Spec[] = [
  /* ------------------------------ Dresses ------------------------------ */
  { id: 'floral-wrap-midi-dress', name: 'Floral Wrap Midi Dress', store: 'nisan', cat: 'dresses', sub: 'Midi Dresses', price: 289, colors: ['Ivory', 'Blush'], imgs: g('floralWrap'), blurb: 'A fluid wrap silhouette with a tie waist and a soft painterly floral print.', mat: '100% viscose. Lining: 100% polyester.', days: 6, tags: ['midi', 'wrap', 'floral', 'summer'], styles: ['Everyday', 'Elegant'], oos: ['XS'] },
  { id: 'ruby-flowy-maxi-dress', name: 'Ruby Flowy Maxi Dress', store: 'sura', cat: 'dresses', sub: 'Maxi Dresses', price: 389, was: 469, colors: ['Red', 'Black', 'Sage'], imgs: g('rubyMaxi'), blurb: 'A sweeping, floor-length dress in fluid chiffon with a fitted bodice and dramatic movement.', mat: '100% polyester chiffon. Lining: 100% polyester.', days: 40, best: true, tags: ['maxi', 'flowy', 'long', 'evening', 'gown'], styles: ['Evening', 'Statement'], oos: ['XL'] },
  { id: 'plum-off-shoulder-gown', name: 'Plum Off-Shoulder Gown', store: 'lale', cat: 'dresses', sub: 'Evening Dresses', price: 459, colors: ['Plum', 'Black'], imgs: g('plumGown'), blurb: 'A sculpted off-the-shoulder gown in stretch crepe with a floor-skimming skirt.', mat: '95% polyester, 5% elastane.', days: 55, tags: ['evening', 'gown', 'off-shoulder', 'maxi', 'occasion'], styles: ['Evening', 'Statement'] },
  { id: 'poppy-polka-dot-midi-dress', name: 'Poppy Polka Dot Midi Dress', store: 'lale', cat: 'dresses', sub: 'Midi Dresses', price: 249, was: 329, colors: ['Red', 'Navy'], imgs: g('polkaDot'), blurb: 'A retro polka-dot midi with a flattering tie waist and a swishy hem.', mat: '100% viscose.', days: 18, tags: ['midi', 'polka dot', 'print', 'summer'], styles: ['Everyday', 'Casual'] },
  { id: 'denim-button-shirt-dress', name: 'Denim Button Shirt Dress', store: 'bosphora', cat: 'dresses', sub: 'Shirt Dresses', price: 259, colors: ['Blue'], imgs: g('denimShirtDress'), blurb: 'A softly washed chambray shirt dress with a gathered skirt and pearl-effect buttons.', mat: '100% lyocell denim.', days: 75, tags: ['shirt dress', 'denim', 'midi', 'casual'], styles: ['Casual', 'Everyday'] },
  { id: 'burgundy-corduroy-midi-dress', name: 'Burgundy Corduroy Long-Sleeve Midi Dress', store: 'zeyn', cat: 'dresses', sub: 'Long Sleeve Dresses', price: 319, colors: ['Burgundy', 'Camel'], imgs: g('corduroyDress'), blurb: 'A buttoned, long-sleeve midi in fine corduroy — cosy, covered and effortlessly polished.', mat: '98% cotton corduroy, 2% elastane.', days: 9, modest: true, tags: ['long sleeve', 'midi', 'corduroy', 'autumn'], styles: ['Everyday', 'Elegant'] },
  { id: 'ivory-ruffle-mini-dress', name: 'Ivory Ruffle Mini Dress', store: 'serena', cat: 'dresses', sub: 'Mini Dresses', price: 349, colors: ['Ivory', 'Blush'], imgs: g('ruffleMini'), blurb: 'A tiered cotton-blend mini with an off-shoulder ruffle neckline.', mat: '70% cotton, 30% polyamide.', days: 27, tags: ['mini', 'ruffle', 'summer', 'off-shoulder'], styles: ['Casual', 'Statement'] },
  { id: 'wine-tulle-evening-dress', name: 'Wine Tulle Evening Dress', store: 'marello', cat: 'dresses', sub: 'Evening Dresses', price: 599, was: 749, colors: ['Burgundy', 'Black'], imgs: g('wineTulle'), blurb: 'Layered tulle over a corseted bodice, finished with delicate lace sleeves.', mat: '100% polyester tulle. Lining: 100% silk-touch satin.', days: 62, tags: ['evening', 'tulle', 'lace', 'occasion', 'gown'], styles: ['Evening', 'Statement'] },
  { id: 'navy-satin-balloon-sleeve-maxi', name: 'Navy Satin Balloon-Sleeve Maxi Dress', store: 'zeyn', cat: 'dresses', sub: 'Maxi Dresses', price: 379, colors: ['Navy', 'Plum', 'Black'], imgs: g('navySatin'), blurb: 'A fluid satin maxi with gathered balloon sleeves and a tie waist — modest and occasion-ready.', mat: '100% polyester satin.', days: 12, best: true, modest: true, tags: ['maxi', 'long sleeve', 'satin', 'occasion', 'long'], styles: ['Evening', 'Elegant'] },
  { id: 'black-long-sleeve-modest-maxi', name: 'Black Long-Sleeve Modest Maxi Dress', store: 'zeyn', cat: 'dresses', sub: 'Maxi Dresses', price: 349, colors: ['Black', 'Navy'], imgs: g('blackModestMaxi'), blurb: 'A minimal, floor-length dress with a high neck, long sleeves and a cinched waist.', mat: '95% viscose crepe, 5% elastane.', days: 33, best: true, modest: true, tags: ['maxi', 'long sleeve', 'long', 'minimal'], styles: ['Minimal', 'Elegant'] },

  /* ------------------------------ Sets ------------------------------ */
  { id: 'sunshine-fleece-tracksuit-set', name: 'Sunshine Fleece Tracksuit Set', store: 'haneul', cat: 'sets', sub: 'Co-ord Sets', price: 339, colors: ['Yellow', 'Grey', 'Black'], imgs: g('tracksuit'), blurb: 'A cropped hoodie and relaxed jogger co-ord in brushed-back fleece.', mat: '80% cotton, 20% polyester.', days: 8, best: true, tags: ['tracksuit', 'co-ord', 'hoodie', 'joggers', 'loungewear'], styles: ['Casual', 'Everyday'] },
  { id: 'sequin-two-piece-party-set', name: 'Sequin Two-Piece Party Set', store: 'lale', cat: 'sets', sub: 'Party Sets', price: 459, was: 599, colors: ['Burgundy', 'Black'], imgs: g('sequinSet'), blurb: 'A sequinned bandeau top and tiered pleated skirt made for a standout evening.', mat: '100% polyester. Sequin embellishment.', days: 48, tags: ['sequin', 'party', 'two-piece', 'skirt', 'evening'], styles: ['Evening', 'Statement'] },
  { id: 'turtleneck-long-skirt-set', name: 'Turtleneck & Long Skirt Set', store: 'zeyn', cat: 'sets', sub: 'Modest Sets', price: 329, colors: ['Black', 'Grey'], imgs: g('turtleneckSkirtSet'), blurb: 'A fine-knit turtleneck with a matching wrap-tie long check skirt.', mat: '65% viscose, 35% polyamide knit.', days: 15, modest: true, tags: ['set', 'long skirt', 'turtleneck', 'two-piece', 'check'], styles: ['Workwear', 'Elegant'] },
  { id: 'champagne-pleated-skirt-blouse-set', name: 'Champagne Pleated Skirt & Blouse Set', store: 'nisan', cat: 'sets', sub: 'Modest Sets', price: 379, colors: ['Beige', 'Cream'], imgs: g('pleatSkirtBlouse'), blurb: 'A sheer-sleeved blouse styled with a glossy pleated midi skirt.', mat: '100% polyester chiffon. Lining: 100% polyester.', days: 20, modest: true, tags: ['set', 'pleated', 'skirt', 'blouse', 'two-piece'], styles: ['Elegant', 'Workwear'] },
  { id: 'teal-halter-jumpsuit', name: 'Teal Halter Jumpsuit', store: 'sura', cat: 'sets', sub: 'Jumpsuits', price: 329, colors: ['Teal', 'Black'], imgs: g('jumpsuit'), blurb: 'A plunging halter jumpsuit in satin-finish crepe with wide, floor-skimming legs.', mat: '96% polyester, 4% elastane.', days: 36, tags: ['jumpsuit', 'halter', 'satin', 'wide leg'], styles: ['Evening', 'Statement'] },

  /* ------------------------------ Bottoms ------------------------------ */
  { id: 'blush-satin-jogger-trousers', name: 'Blush Satin Jogger Trousers', store: 'bosphora', cat: 'bottoms', sub: 'Trousers', price: 189, colors: ['Blush', 'Black', 'Olive'], imgs: g('satinJoggers'), blurb: 'Dressed-up joggers in a fluid satin with an elasticated waist and cuffed ankle.', mat: '100% polyester satin.', days: 14, tags: ['joggers', 'trousers', 'pants', 'satin'], styles: ['Casual', 'Everyday'] },
  { id: 'pinstripe-wide-leg-trousers', name: 'Pinstripe Wide-Leg Trousers', store: 'bosphora', cat: 'bottoms', sub: 'Trousers', price: 219, colors: ['Ivory', 'Navy'], imgs: g('stripeTrousers'), blurb: 'High-waisted wide-leg trousers with a subtle vertical pinstripe.', mat: '68% viscose, 28% polyester, 4% elastane.', days: 52, tags: ['wide leg', 'trousers', 'pants', 'stripe'], styles: ['Workwear', 'Minimal'] },
  { id: 'utility-cargo-trousers', name: 'Utility Cargo Trousers', store: 'bosphora', cat: 'bottoms', sub: 'Trousers', price: 229, colors: ['Olive', 'Black'], imgs: g('cargo'), blurb: 'Relaxed cargo trousers with adjustable ankle toggles and roomy utility pockets.', mat: '100% cotton twill.', days: 80, tags: ['cargo', 'utility', 'trousers', 'pants'], styles: ['Casual'] },
  { id: 'patchwork-straight-jeans', name: 'Patchwork Straight Jeans', store: 'mira', cat: 'bottoms', sub: 'Jeans', price: 279, was: 349, colors: ['Blue'], imgs: g('patchJeans'), blurb: 'Straight-leg jeans with playful embroidered patches and a worn-in wash.', mat: '100% cotton denim.', days: 44, tags: ['jeans', 'denim', 'straight', 'patch'], styles: ['Casual', 'Statement'] },
  { id: 'black-pleated-maxi-skirt', name: 'Black Pleated Maxi Skirt', store: 'zeyn', cat: 'bottoms', sub: 'Long Skirts', price: 199, colors: ['Black', 'Navy'], imgs: g('blackPleatSkirt'), blurb: 'A flowing, full-length pleated skirt with a soft elasticated waistband.', mat: '100% polyester georgette.', days: 11, best: true, modest: true, tags: ['maxi', 'skirt', 'long skirt', 'pleated', 'long'], styles: ['Elegant', 'Everyday'] },
  { id: 'ivory-chiffon-pleated-maxi-skirt', name: 'Ivory Chiffon Pleated Maxi Skirt', store: 'nisan', cat: 'bottoms', sub: 'Long Skirts', price: 209, colors: ['Ivory', 'Beige'], imgs: g('ivoryPleatSkirt', 'ivoryPleatSkirt2', 'ivoryPleatSkirt3'), blurb: 'Airy accordion pleats in translucent chiffon, lined to the knee.', mat: '100% polyester chiffon. Lining: 100% polyester.', days: 5, modest: true, tags: ['maxi', 'skirt', 'long skirt', 'pleated', 'chiffon', 'long'], styles: ['Elegant'] },

  /* ------------------------------ Tops ------------------------------ */
  { id: 'classic-stripe-poplin-shirt', name: 'Classic Stripe Poplin Shirt', store: 'bosphora', cat: 'tops', sub: 'Shirts', price: 179, colors: ['Black', 'White'], imgs: g('stripeShirt'), blurb: 'A crisp cotton poplin shirt in a timeless monochrome stripe.', mat: '100% cotton poplin.', days: 70, tags: ['shirt', 'stripe', 'poplin', 'workwear'], styles: ['Workwear', 'Everyday'] },
  { id: 'broderie-puff-sleeve-blouse', name: 'Broderie Puff-Sleeve Blouse', store: 'lale', cat: 'tops', sub: 'Blouses', price: 199, colors: ['White', 'Ivory'], imgs: g('broderie'), blurb: 'A breezy broderie-anglaise blouse with voluminous sleeves and a tie front.', mat: '100% cotton.', days: 10, best: true, tags: ['blouse', 'broderie', 'puff sleeve', 'summer', 'white'], styles: ['Casual', 'Everyday'] },
  { id: 'embroidered-floral-blouse', name: 'Embroidered Floral Blouse', store: 'nisan', cat: 'tops', sub: 'Blouses', price: 189, colors: ['White'], imgs: g('embroideredBlouse'), blurb: 'A cotton-poplin blouse hand-finished with delicate floral embroidery.', mat: '100% cotton. Embroidery: 100% polyester thread.', days: 30, tags: ['blouse', 'embroidered', 'floral', 'white'], styles: ['Everyday', 'Elegant'] },
  { id: 'linen-stripe-tunic', name: 'Linen Stripe Tunic', store: 'anadolu', cat: 'tops', sub: 'Tunics', price: 169, colors: ['Stone', 'White'], imgs: g('linenTunic'), blurb: 'A long, relaxed tunic in soft washed linen with a boat neckline.', mat: '100% linen.', days: 24, modest: true, tags: ['tunic', 'linen', 'stripe', 'long sleeve', 'relaxed'], styles: ['Minimal', 'Everyday'] },
  { id: 'blush-puff-sleeve-blouse', name: 'Blush Puff-Sleeve Blouse', store: 'haneul', cat: 'tops', sub: 'Blouses', price: 279, colors: ['Blush'], imgs: g('puffBlouse'), blurb: 'A sculpted tulle-overlay blouse with sheer puffed sleeves and delicate dot texture.', mat: '100% polyester tulle. Lining: 100% polyester.', days: 4, tags: ['blouse', 'puff sleeve', 'tulle', 'pink', 'k-fashion'], styles: ['Statement', 'Evening'] },
  { id: 'powder-blue-ribbed-turtleneck', name: 'Powder Blue Ribbed Turtleneck', store: 'serena', cat: 'tops', sub: 'Knitwear', price: 229, colors: ['Blue', 'Ivory', 'Black'], imgs: g('turtleneckKnit'), blurb: 'A fitted ribbed turtleneck in a soft cotton–merino blend.', mat: '60% cotton, 30% merino wool, 10% polyamide.', days: 22, tags: ['turtleneck', 'knit', 'sweater', 'jumper', 'ribbed'], styles: ['Minimal', 'Everyday'] },
  { id: 'chevron-knit-sweater', name: 'Chevron Knit Sweater', store: 'marello', cat: 'tops', sub: 'Knitwear', price: 299, colors: ['Camel', 'Cream'], imgs: g('chevronSweater'), blurb: 'A cosy intarsia knit with a bold chevron pattern and a slightly cropped body.', mat: '55% cotton, 45% acrylic.', days: 58, tags: ['sweater', 'knit', 'jumper', 'chevron', 'autumn'], styles: ['Casual', 'Statement'] },

  /* ------------------------------ Outerwear ------------------------------ */
  { id: 'cream-crochet-poncho', name: 'Cream Crochet Poncho', store: 'anadolu', cat: 'outerwear', sub: 'Knitwear', price: 219, colors: ['Cream'], imgs: g('poncho'), blurb: 'A hand-crocheted poncho with a long fringe hem — an easy layer over anything.', mat: '100% cotton.', days: 46, modest: true, tags: ['poncho', 'crochet', 'fringe', 'layer', 'boho'], styles: ['Casual', 'Statement'] },
  { id: 'tailored-cream-blazer', name: 'Tailored Cream Blazer', store: 'marello', cat: 'outerwear', sub: 'Blazers', price: 549, colors: ['Cream', 'Black'], imgs: g('creamBlazer'), blurb: 'A sharply cut single-breasted blazer with a peak lapel and a structured shoulder.', mat: '72% polyester, 24% viscose, 4% elastane. Lining: 100% viscose.', days: 60, best: true, tags: ['blazer', 'tailored', 'jacket', 'suit', 'workwear'], styles: ['Workwear', 'Elegant'] },
  { id: 'plaid-oversized-blazer', name: 'Plaid Oversized Blazer', store: 'bosphora', cat: 'outerwear', sub: 'Blazers', price: 389, was: 469, colors: ['Green', 'Navy'], imgs: g('plaidBlazer'), blurb: 'An oversized, longline blazer in a rich tonal plaid.', mat: '62% polyester, 32% viscose, 6% elastane.', days: 35, tags: ['blazer', 'plaid', 'check', 'oversized', 'jacket'], styles: ['Workwear', 'Statement'] },
  { id: 'burgundy-wool-blend-coat', name: 'Burgundy Wool-Blend Coat', store: 'serena', cat: 'outerwear', sub: 'Coats', price: 729, was: 899, colors: ['Burgundy', 'Camel', 'Black'], imgs: g('burgundyCoat'), blurb: 'A wool-blend coat with a wide funnel collar and a clean, wrap-over front.', mat: '60% wool, 30% polyester, 10% polyamide. Lining: 100% viscose.', days: 90, tags: ['coat', 'wool', 'winter', 'collar'], styles: ['Elegant', 'Workwear'] },
  { id: 'sky-blue-longline-coat', name: 'Sky Blue Longline Coat', store: 'serena', cat: 'outerwear', sub: 'Coats', price: 679, colors: ['Blue', 'Beige'], imgs: g('skyCoat'), blurb: 'A longline, calf-length coat in a soft brushed twill with a relaxed, open drape.', mat: '80% polyester, 20% wool. Lining: 100% viscose.', days: 7, modest: true, tags: ['coat', 'longline', 'long', 'trench', 'winter'], styles: ['Elegant', 'Statement'] },

  /* ------------------------------ Abayas ------------------------------ */
  { id: 'classic-open-abaya', name: 'Classic Open Abaya with Contrast Lining', store: 'noor', cat: 'outerwear', sub: 'Abayas', price: 489, colors: ['Black'], imgs: g('abayaOpen', 'abayaPanel'), blurb: 'A flowing open-front abaya in matte crepe with a contrast satin lining and cuff.', mat: '100% crepe polyester. Lining: 100% polyester satin.', days: 13, best: true, modest: true, tags: ['abaya', 'open', 'long', 'maxi', 'kimono'], styles: ['Elegant', 'Minimal'] },
  { id: 'floral-embellished-black-abaya', name: 'Floral Embellished Black Abaya', store: 'sahara', cat: 'outerwear', sub: 'Abayas', price: 679, colors: ['Black'], imgs: g('abayaEmbellished'), blurb: 'A luxurious black abaya with hand-applied tonal floral appliqué and beaded lace cuffs.', mat: '100% polyester crepe. Embellishment: beads and lace.', days: 26, modest: true, tags: ['abaya', 'embellished', 'beaded', 'long', 'occasion'], styles: ['Evening', 'Statement'] },
  { id: 'gold-trim-open-abaya', name: 'Gold-Trim Open Abaya', store: 'noor', cat: 'outerwear', sub: 'Abayas', price: 559, colors: ['Black', 'Navy'], imgs: g('abayaTrim'), blurb: 'An open-front abaya finished with an embroidered gold-thread border along the front and sleeves.', mat: '100% polyester crepe. Trim: 100% polyester.', days: 64, modest: true, tags: ['abaya', 'open', 'gold', 'embroidered', 'long'], styles: ['Evening', 'Elegant'] },
  { id: 'champagne-flared-abaya', name: 'Champagne Flared Abaya', store: 'noor', cat: 'outerwear', sub: 'Abayas', price: 529, colors: ['Beige', 'Sand'], imgs: g('abayaChampagne'), blurb: 'A soft-champagne abaya with godet panels, a tie belt and delicate embroidered sleeves.', mat: '100% polyester crepe.', days: 17, modest: true, tags: ['abaya', 'flared', 'belted', 'long', 'beige'], styles: ['Elegant'] },
  { id: 'sand-belted-open-abaya', name: 'Sand Belted Open Abaya', store: 'sahara', cat: 'outerwear', sub: 'Abayas', price: 499, colors: ['Sand', 'Camel'], imgs: g('abayaSand'), blurb: 'A lightweight open abaya with a matching belt for a defined waist.', mat: '100% polyester crepe.', days: 3, modest: true, tags: ['abaya', 'open', 'belted', 'long', 'beige', 'neutral'], styles: ['Minimal', 'Elegant'] },
  { id: 'pearl-beaded-black-abaya', name: 'Pearl-Beaded Black Abaya', store: 'sahara', cat: 'outerwear', sub: 'Abayas', price: 749, was: 899, colors: ['Black'], imgs: g('abayaPearl'), blurb: 'An evening abaya with hand-set pearl and bead detailing along the sleeves and front.', mat: '100% polyester crepe. Embellishment: pearl-effect beads.', days: 42, modest: true, tags: ['abaya', 'pearl', 'beaded', 'long', 'occasion'], styles: ['Evening', 'Statement'] },

  /* ------------------------------ Hijabs ------------------------------ */
  { id: 'blush-chiffon-hijab', name: 'Blush Chiffon Hijab', store: 'zeyn', cat: 'accessories', sub: 'Hijabs', price: 55, colors: ['Blush', 'Ivory', 'Beige'], imgs: g('hijabBlush'), blurb: 'A weightless, crinkle-free chiffon hijab with a soft matte finish.', mat: '100% polyester chiffon. 180 × 75 cm.', days: 19, modest: true, tags: ['hijab', 'headscarf', 'chiffon', 'pink'], styles: ['Everyday', 'Elegant'], fit: 'One size. 180 × 75 cm.' },
  { id: 'ivory-cotton-hijab', name: 'Ivory Cotton Hijab', store: 'zeyn', cat: 'accessories', sub: 'Hijabs', price: 59, colors: ['Ivory', 'White'], imgs: g('hijabIvory', 'hijabPrinted'), blurb: 'A breathable cotton-blend hijab that drapes cleanly and stays in place.', mat: '70% cotton, 30% modal. 180 × 75 cm.', days: 68, best: true, modest: true, tags: ['hijab', 'headscarf', 'cotton', 'white'], styles: ['Everyday', 'Minimal'], fit: 'One size. 180 × 75 cm.' },
  { id: 'dusty-rose-satin-hijab', name: 'Dusty Rose Satin Hijab', store: 'zeyn', cat: 'accessories', sub: 'Hijabs', price: 69, colors: ['Rose', 'Beige', 'Terracotta'], imgs: g('hijabRose'), blurb: 'A lustrous satin hijab with a graceful drape, perfect for occasion styling.', mat: '100% polyester satin. 180 × 75 cm.', days: 31, modest: true, tags: ['hijab', 'headscarf', 'satin', 'pink'], styles: ['Elegant', 'Evening'], fit: 'One size. 180 × 75 cm.' },
  { id: 'golden-satin-hijab', name: 'Golden Satin Hijab', store: 'sahara', cat: 'accessories', sub: 'Hijabs', price: 79, was: 99, colors: ['Gold', 'Camel'], imgs: g('hijabGold'), blurb: 'A rich, sun-warmed satin hijab that catches the light beautifully.', mat: '100% polyester satin. 180 × 75 cm.', days: 50, modest: true, tags: ['hijab', 'headscarf', 'satin', 'gold'], styles: ['Statement', 'Elegant'], fit: 'One size. 180 × 75 cm.' },
  { id: 'stone-jersey-hijab', name: 'Stone Jersey Hijab', store: 'zeyn', cat: 'accessories', sub: 'Hijabs', price: 49, colors: ['Stone', 'Black', 'Navy'], imgs: g('hijabStone'), blurb: 'A stretchy premium jersey hijab — easy to style and comfortable all day.', mat: '95% modal jersey, 5% elastane. 170 × 65 cm.', days: 84, modest: true, tags: ['hijab', 'headscarf', 'jersey', 'grey'], styles: ['Everyday', 'Minimal'], fit: 'One size. 170 × 65 cm.' },
  { id: 'terracotta-chiffon-hijab', name: 'Terracotta Chiffon Hijab', store: 'noor', cat: 'accessories', sub: 'Hijabs', price: 59, colors: ['Terracotta', 'Rose'], imgs: g('hijabTerracotta'), blurb: 'A bold chiffon hijab in warm terracotta, made for statement layering.', mat: '100% polyester chiffon. 180 × 75 cm.', days: 2, modest: true, tags: ['hijab', 'headscarf', 'chiffon', 'orange', 'red'], styles: ['Statement', 'Everyday'], fit: 'One size. 180 × 75 cm.' },

  /* ------------------------------ Shoes ------------------------------ */
  { id: 'floral-stiletto-pumps', name: 'Floral Stiletto Pumps', store: 'marello', cat: 'shoes', sub: 'Heels', price: 449, colors: ['Blue'], imgs: g('floralHeels'), blurb: 'Show-stopping pointed pumps in a hand-printed floral satin on a 9 cm stiletto.', mat: 'Upper: printed satin. Lining and sole: leather.', days: 38, tags: ['heels', 'pumps', 'stiletto', 'floral', 'occasion'], styles: ['Evening', 'Statement'] },
  { id: 'navy-suede-court-heels', name: 'Navy Suede Court Heels', store: 'ege', cat: 'shoes', sub: 'Heels', price: 329, colors: ['Navy'], imgs: g('navyPumps'), blurb: 'Classic court shoes in soft suede with a comfortable 7 cm heel.', mat: 'Upper: suede leather. Lining: leather. Sole: leather.', days: 29, tags: ['heels', 'pumps', 'court', 'suede'], styles: ['Elegant', 'Workwear'] },
  { id: 'nude-pointed-pumps', name: 'Nude Pointed Pumps', store: 'ege', cat: 'shoes', sub: 'Heels', price: 299, was: 379, colors: ['Beige'], imgs: g('nudePumps'), blurb: 'A wardrobe-essential pointed pump in a neutral nude leather.', mat: 'Upper: grained leather. Lining: leather. Sole: leather.', days: 66, tags: ['heels', 'pumps', 'nude', 'beige', 'pointed'], styles: ['Elegant', 'Workwear'] },
  { id: 'sage-suede-brogues', name: 'Sage Suede Brogues', store: 'serena', cat: 'shoes', sub: 'Flats', price: 399, colors: ['Green', 'Camel'], imgs: g('brogues'), blurb: 'Hand-stitched suede brogues on a stacked sole, a refined flat for everyday.', mat: 'Upper: suede leather. Lining: leather. Sole: rubber.', days: 23, tags: ['flats', 'brogues', 'suede', 'loafers'], styles: ['Casual', 'Minimal'] },
  { id: 'minimal-leather-sneakers', name: 'Minimal Leather Sneakers', store: 'mira', cat: 'shoes', sub: 'Sneakers', price: 369, colors: ['White', 'Beige'], imgs: g('sneakers'), blurb: 'Clean, logo-free leather sneakers with a subtle tonal panel and cushioned insole.', mat: 'Upper: leather. Lining: textile. Sole: rubber.', days: 16, best: true, tags: ['sneakers', 'trainers', 'leather', 'white'], styles: ['Casual', 'Minimal'] },

  /* ------------------------------ Bags ------------------------------ */
  { id: 'cognac-woven-leather-tote', name: 'Cognac Woven Leather Tote', store: 'ege', cat: 'bags', sub: 'Totes', price: 459, colors: ['Cognac', 'Black'], imgs: g('wovenTote'), blurb: 'A slouchy tote in hand-woven leather with a polished chain strap detail.', mat: '100% full-grain leather. Lining: cotton canvas.', days: 21, best: true, tags: ['tote', 'woven', 'leather', 'shoulder bag', 'brown', 'tan'], styles: ['Everyday', 'Statement'] },
  { id: 'terracotta-basket-top-handle-bag', name: 'Terracotta Basket Top-Handle Bag', store: 'anadolu', cat: 'bags', sub: 'Top-Handle', price: 259, colors: ['Orange', 'Camel'], imgs: g('strawBag'), blurb: 'A hand-woven wicker basket bag with a structured leather top handle.', mat: 'Woven wicker, leather trim. Lining: cotton.', days: 28, tags: ['straw', 'basket', 'wicker', 'top handle', 'summer'], styles: ['Casual', 'Statement'] },
  { id: 'sand-turn-lock-top-handle-bag', name: 'Sand Turn-Lock Top-Handle Bag', store: 'serena', cat: 'bags', sub: 'Top-Handle', price: 359, colors: ['Beige', 'Cream'], imgs: g('beigeFlap'), blurb: 'A refined structured flap bag in a soft beige leather with a gold turn-lock and slim top handle.', mat: '100% calf leather. Lining: suede.', days: 4, tags: ['flap', 'top handle', 'leather', 'beige', 'neutral', 'work bag'], styles: ['Elegant', 'Workwear', 'Minimal'] },
  { id: 'camel-croc-embossed-bucket-bag', name: 'Camel Croc-Embossed Bucket Bag', store: 'ege', cat: 'bags', sub: 'Shoulder Bags', price: 419, was: 499, colors: ['Camel', 'Beige'], imgs: g('crocBucket'), blurb: 'A structured bucket bag in croc-embossed leather with a flap closure and a wide shoulder strap.', mat: '100% embossed leather. Lining: cotton canvas.', days: 19, tags: ['bucket', 'shoulder bag', 'croc', 'leather', 'tan', 'beige'], styles: ['Statement', 'Everyday'] },
  { id: 'cream-crescent-crossbody-bag', name: 'Cream Crescent Crossbody Bag', store: 'mira', cat: 'bags', sub: 'Crossbody', price: 249, colors: ['Cream', 'Beige'], imgs: g('creamCrescent'), blurb: 'A slouchy crescent-shaped crossbody in buttery soft leather with a zip top and adjustable strap.', mat: '100% leather. Lining: cotton.', days: 10, tags: ['crossbody', 'crescent', 'leather', 'cream', 'beige', 'shoulder bag'], styles: ['Casual', 'Minimal'] },
  { id: 'stone-chain-handle-mini-tote', name: 'Stone Chain-Handle Mini Tote', store: 'ege', cat: 'bags', sub: 'Totes', price: 389, colors: ['Beige', 'Stone'], imgs: g('chainTote'), blurb: 'A compact structured tote with a chain-link handle detail and a detachable long strap.', mat: '100% smooth leather. Lining: microfibre.', days: 30, tags: ['tote', 'mini', 'chain', 'leather', 'beige', 'neutral'], styles: ['Elegant', 'Everyday'] },
  { id: 'quilted-mini-crossbody', name: 'Quilted Mini Crossbody', store: 'mira', cat: 'bags', sub: 'Crossbody', price: 289, colors: ['Blush', 'Black'], imgs: g('quiltedBag'), blurb: 'A diamond-quilted mini bag with a signature teardrop clasp and detachable strap.', mat: 'Vegan leather. Lining: polyester.', days: 12, tags: ['mini', 'quilted', 'crossbody', 'pink', 'shoulder bag'], styles: ['Statement', 'Everyday'] },
  { id: 'blush-turn-lock-flap-bag', name: 'Blush Turn-Lock Flap Bag', store: 'serena', cat: 'bags', sub: 'Top-Handle', price: 339, colors: ['Blush', 'Grey'], imgs: g('blushFlap', 'greyFlap'), blurb: 'A structured leather flap bag with a gold turn-lock and a compact top handle.', mat: '100% calf leather. Lining: suede.', days: 6, tags: ['flap', 'top handle', 'leather', 'pink', 'clutch'], styles: ['Elegant', 'Minimal'] },
  { id: 'structured-black-tote', name: 'Structured Black Tote', store: 'ege', cat: 'bags', sub: 'Totes', price: 429, colors: ['Black'], imgs: g('blackTote'), blurb: 'A polished leather tote with a spacious interior and a padded laptop sleeve.', mat: '100% full-grain leather. Lining: microfibre.', days: 72, tags: ['tote', 'work bag', 'leather', 'black', 'workwear'], styles: ['Workwear', 'Minimal'] },
  { id: 'dove-grey-satchel', name: 'Dove Grey Satchel', store: 'ege', cat: 'bags', sub: 'Crossbody', price: 319, was: 399, colors: ['Grey', 'Black'], imgs: g('greySatchel'), blurb: 'A classic pebbled-leather satchel with twin buckles and a removable shoulder strap.', mat: '100% pebbled leather. Lining: cotton.', days: 54, tags: ['satchel', 'crossbody', 'leather', 'grey'], styles: ['Everyday', 'Workwear'] },
  { id: 'teal-leather-satchel', name: 'Teal Leather Satchel', store: 'marello', cat: 'bags', sub: 'Crossbody', price: 389, colors: ['Teal', 'Black'], imgs: g('tealSatchel'), blurb: 'A jewel-toned satchel with a brushed-gold clasp and a roomy, organised interior.', mat: '100% calf leather. Lining: suede.', days: 39, tags: ['satchel', 'leather', 'teal', 'green', 'shoulder bag'], styles: ['Statement', 'Workwear'] },
  { id: 'black-leather-boston-bag', name: 'Black Leather Boston Bag', store: 'ege', cat: 'bags', sub: 'Top-Handle', price: 369, colors: ['Black'], imgs: g('boston'), blurb: 'A barrel-shaped Boston bag with buckle straps and a detachable long strap.', mat: '100% grained leather. Lining: cotton.', days: 45, tags: ['boston', 'top handle', 'leather', 'black', 'duffle'], styles: ['Everyday'] },

  /* ------------------------------ Accessories ------------------------------ */
  { id: 'round-gold-frame-sunglasses', name: 'Round Gold-Frame Sunglasses', store: 'serena', cat: 'accessories', sub: 'Sunglasses', price: 169, colors: ['Gold'], imgs: g('sunglasses'), blurb: 'Slim round sunglasses with a fine gold frame and UV400 lenses.', mat: 'Metal frame, polycarbonate lenses. UV400.', days: 25, tags: ['sunglasses', 'round', 'gold', 'summer'], styles: ['Minimal', 'Everyday'], fit: 'One size. Lens width 50 mm.' },
  { id: 'gold-chunky-hoop-earrings', name: 'Gold Chunky Hoop Earrings', store: 'iznik', cat: 'accessories', sub: 'Jewellery', price: 89, colors: ['Gold'], imgs: g('hoops'), blurb: 'Sculpted, lightweight hoops in 18k gold plating with a braided texture.', mat: 'Brass with 18k gold plating.', days: 13, best: true, tags: ['earrings', 'hoops', 'jewellery', 'gold'], styles: ['Statement', 'Everyday'], fit: 'One size. Diameter 3 cm.' },
  { id: 'sapphire-crystal-drop-earrings', name: 'Sapphire Crystal Drop Earrings', store: 'iznik', cat: 'accessories', sub: 'Jewellery', price: 119, was: 149, colors: ['Silver'], imgs: g('sapphireEarrings'), blurb: 'Statement drops set with a deep blue centre stone and baguette crystals.', mat: 'Brass, rhodium plating, crystal.', days: 47, tags: ['earrings', 'drop', 'crystal', 'jewellery', 'evening'], styles: ['Evening', 'Statement'], fit: 'One size. Drop length 5 cm.' },
  { id: 'crystal-tennis-bracelet', name: 'Crystal Tennis Bracelet', store: 'iznik', cat: 'accessories', sub: 'Jewellery', price: 139, colors: ['Silver'], imgs: g('crystalBracelet'), blurb: 'An openwork bracelet in a sparkling infinity design with hand-set crystals.', mat: 'Brass, rhodium plating, crystal.', days: 60, tags: ['bracelet', 'crystal', 'jewellery', 'silver', 'evening'], styles: ['Evening', 'Elegant'], fit: 'One size. Adjustable clasp.' },
  { id: 'rose-gold-filigree-bracelet', name: 'Rose Gold Filigree Bracelet', store: 'iznik', cat: 'accessories', sub: 'Jewellery', price: 99, colors: ['Gold', 'Rose'], imgs: g('roseBracelet'), blurb: 'A delicate filigree bracelet with warm rose-gold plating and crystal accents.', mat: 'Brass, rose-gold plating, crystal.', days: 32, tags: ['bracelet', 'filigree', 'jewellery', 'rose gold'], styles: ['Elegant', 'Everyday'], fit: 'One size. Adjustable clasp.' },
  { id: 'layered-chain-jewellery-set', name: 'Layered Chain Jewellery Set', store: 'iznik', cat: 'accessories', sub: 'Jewellery', price: 149, colors: ['Gold', 'Silver'], imgs: g('chains'), blurb: 'A mixed set of chains, hoops and charms designed for layering and stacking.', mat: 'Brass with gold and rhodium plating.', days: 8, tags: ['necklace', 'chains', 'jewellery', 'set', 'gold'], styles: ['Statement'], fit: 'One size.' },
  { id: 'floral-silk-square-scarf', name: 'Floral Silk-Touch Square Scarf', store: 'anadolu', cat: 'accessories', sub: 'Scarves', price: 129, colors: ['Red', 'Navy'], imgs: g('silkScarf'), blurb: 'A generously sized square scarf with a vintage floral print — wear it on the head, neck or bag.', mat: '100% silk-touch polyester twill. 90 × 90 cm.', days: 34, modest: true, tags: ['scarf', 'silk', 'floral', 'headscarf', 'square'], styles: ['Elegant', 'Statement'], fit: 'One size. 90 × 90 cm.' },
  { id: 'paisley-pashmina-wrap', name: 'Paisley Pashmina Wrap', store: 'anadolu', cat: 'accessories', sub: 'Scarves', price: 159, was: 199, colors: ['Rose', 'Teal', 'Gold'], imgs: g('pashmina'), blurb: 'A softly woven paisley pashmina with a hand-knotted fringe, in a rich mix of colours.', mat: '70% viscose, 30% cashmere blend. 70 × 200 cm.', days: 77, modest: true, tags: ['scarf', 'pashmina', 'wrap', 'paisley', 'shawl'], styles: ['Elegant', 'Statement'], fit: 'One size. 70 × 200 cm.' },
  { id: 'saffron-chiffon-scarf', name: 'Saffron Chiffon Scarf', store: 'anadolu', cat: 'accessories', sub: 'Scarves', price: 79, colors: ['Gold', 'Orange'], imgs: g('chiffonScarf'), blurb: 'A featherlight chiffon scarf in a warm saffron tone.', mat: '100% polyester chiffon. 70 × 180 cm.', days: 15, modest: true, tags: ['scarf', 'chiffon', 'yellow', 'orange', 'headscarf'], styles: ['Statement', 'Everyday'], fit: 'One size. 70 × 180 cm.' },
]

export const PRODUCTS: Product[] = SPECS.map(build)

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]))

export const getProduct = (slug: string): Product | undefined => BY_SLUG.get(slug)

export const getProductsByIds = (ids: string[]): Product[] =>
  ids.map((id) => BY_SLUG.get(id)).filter((p): p is Product => Boolean(p))
