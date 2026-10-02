# ZAYNKAR

**ZAYNKAR** is a real, live store for dresses (`/store`), plus the original frontend prototype of a wider global marketplace concept (everything else) kept for reference.

## The real store

- **Customers**: browse at `/store`, sign up / sign in, pick a size and colour, and submit their list at `/selections` — no payment is taken; the store owner fulfils requests in person. Customers can see their own submitted lists at `/my-requests`, and search any item by its unique code.
- **Admin** (`/admin/login`, username `zenabkareem`): add/edit/delete products — name, description, price, sizes, colours (each with its own optional photo), and any number of general photos or videos. New categories (e.g. "Shoes") can be added any time without a code change. Submitted customer requests are visible at `/admin/requests`.
- **Data**: a real Supabase (Postgres) database — see [`supabase/README.md`](supabase/README.md) to connect it (one-time setup) and [`supabase/schema.sql`](supabase/schema.sql) for the full schema and security rules.

> The rest of this README (and everything under `/shop`, `/bag`, `/checkout`, etc.) describes the **original prototype**: mock stores, mock products and a demo checkout, kept as a reference for the wider marketplace vision. It has no connection to the real store above.

## Live site

**https://zenab155ali.github.io/zaynkar/**

Deployed on GitHub Pages. Every deploy keeps a permanent link under [`/versions/`](https://zenab155ali.github.io/zaynkar/versions/), so earlier versions stay reachable after a new one is published — see [`deploy/README.md`](deploy/README.md) for how deploys work.

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build into /dist
npm run preview    # serve the production build locally
npm run typecheck  # TypeScript only
```

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Lucide icons. No other runtime dependencies.

## Project structure

```
src/
  components/
    layout/    Header (mega menu), MobileMenu, Footer, PromoBar, Layout
    home/      Hero, CategoryGrid, NewArrivals, TrendingNow, WorldSection, ModestEdit, ...
    product/   ProductCard, ProductGallery, FilterPanel, ProductListing, ProductCarousel, ...
    search/    SearchOverlay, ImageSearchModal (demo), CompleteMyLookModal (mock AI)
    bag/       OrderSummary
    account/   Orders / Addresses / Profile tabs
    ui/        Dialog (native <dialog>), SmartImage, Flag, Badge, Rating, Skeleton, ...
  context/     Cart, Favorites, Toast, Currency, UI (overlay state)
  data/        products, stores, countries, collections, navigation, image library, static pages
  hooks/       useLocalStorage, useRecentlyViewed, useSimulatedLoading, useDocumentTitle
  pages/       Home, Collection, Product, Search, Bag, Checkout, Favorites, Account, Static, ...
  types/       Shared TypeScript types
  utils/       currency, images, pricing, filters/sorting, search, recommendations, reviews, orders
```

## Routes

| Route | Page |
| --- | --- |
| `/store`, `/store/:code` | **Real** live product listing and detail (by code) |
| `/signup`, `/signin` | **Real** customer accounts |
| `/selections`, `/my-requests` | **Real** pick-items-then-submit flow and a customer's own history |
| `/admin/login`, `/admin/products`, `/admin/requests` | **Real** admin dashboard |
| `/` | Homepage (prototype) |
| `/shop/:slug` | Collections & categories (`women`, `new-in`, `modest`, `dresses`, `shoes`, `bags`, `hijabs`, `abayas`, `sale`, …) |
| `/country/:code` | Country collections (`TR`, `IT`, `KR`, `AE`) |
| `/product/:slug` | Product page |
| `/search?q=` | Search results |
| `/favorites`, `/bag`, `/checkout`, `/order-confirmation/:id` | Wishlist, bag, demo checkout |
| `/account/:tab` | `orders`, `favorites`, `addresses`, `profile`, `recently-viewed` |
| `/info/:slug` | Help / About / Legal placeholder pages |

## Where to change things later

- **Demo images** — every photo is registered by key in [`src/data/imageLibrary.ts`](src/data/imageLibrary.ts) (Unsplash, free to use). URL building lives only in [`src/utils/images.ts`](src/utils/images.ts). To use real seller photos, give a product `images: [{ url: 'https://…' }]` — no component changes needed.
- **Products & stores** — [`src/data/products.ts`](src/data/products.ts) and [`src/data/stores.ts`](src/data/stores.ts). Swap these for an API later.
- **Currency** — prices are stored in the base currency (₪ ILS). [`src/utils/currency.ts`](src/utils/currency.ts) and `CurrencyContext` are ready for more currencies (flip `enabled` and add real rates).
- **Shipping rules** — [`src/config.ts`](src/config.ts) (free-shipping threshold, flat rates).
- **Persistence** — bag, favorites, recently viewed, profile, addresses and demo orders are stored in `localStorage` (keys in `src/config.ts`).
- **Future AI** — "Search by image" and "Complete My Look" are UI-ready mocks (`components/search/`, `utils/recommend.ts`).
