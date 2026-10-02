import type { ImageKey } from '@/data/imageLibrary'
import type { CountryCode } from '@/types'

export interface NavLink {
  label: string
  to: string
  /** When set, a flag icon is rendered next to the label. */
  country?: CountryCode
}

export interface NavGroup {
  title: string
  links: NavLink[]
}

export interface NavItem {
  label: string
  to: string
  groups?: NavGroup[]
  feature?: { image: ImageKey; title: string; to: string; focusY?: number }
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'New In', to: '/shop/new-in' },
  {
    label: 'Women',
    to: '/shop/women',
    groups: [
      {
        title: 'Shop',
        links: [
          { label: 'All Women', to: '/shop/women' },
          { label: 'Dresses', to: '/shop/dresses' },
          { label: 'Tops', to: '/shop/tops' },
          { label: 'Bottoms', to: '/shop/bottoms' },
          { label: 'Sets & Jumpsuits', to: '/shop/sets' },
        ],
      },
      {
        title: 'Complete the look',
        links: [
          { label: 'Shoes', to: '/shop/shoes' },
          { label: 'Bags', to: '/shop/bags' },
          { label: 'Accessories', to: '/shop/accessories' },
          { label: 'Coats & Blazers', to: '/shop/outerwear' },
        ],
      },
      {
        title: 'By country',
        links: [
          { label: 'Turkey', to: '/country/TR', country: 'TR' },
          { label: 'Italy', to: '/country/IT', country: 'IT' },
          { label: 'South Korea', to: '/country/KR', country: 'KR' },
          { label: 'UAE', to: '/country/AE', country: 'AE' },
        ],
      },
    ],
    feature: { image: 'edOfficeSpring', title: 'Trending Now', to: '/shop/trending', focusY: 0.25 },
  },
  {
    label: 'Modest',
    to: '/shop/modest',
    groups: [
      {
        title: 'The Modest Edit',
        links: [
          { label: 'All Modest', to: '/shop/modest' },
          { label: 'Maxi Dresses', to: '/shop/modest-maxi-dresses' },
          { label: 'Long Sleeve Dresses', to: '/shop/long-sleeve-dresses' },
          { label: 'Modest Sets', to: '/shop/modest-sets' },
        ],
      },
      {
        title: 'Essentials',
        links: [
          { label: 'Abayas', to: '/shop/abayas' },
          { label: 'Hijabs', to: '/shop/hijabs' },
          { label: 'Long Skirts', to: '/shop/long-skirts' },
          { label: 'Scarves', to: '/shop/scarves' },
        ],
      },
    ],
    feature: { image: 'abayaSand', title: 'Sand & Champagne Abayas', to: '/shop/abayas', focusY: 0.3 },
  },
  {
    label: 'Dresses',
    to: '/shop/dresses',
    groups: [
      {
        title: 'Dresses',
        links: [
          { label: 'All Dresses', to: '/shop/dresses' },
          { label: 'Maxi Dresses', to: '/shop/maxi-dresses' },
          { label: 'Midi Dresses', to: '/shop/midi-dresses' },
          { label: 'Evening Dresses', to: '/shop/evening-dresses' },
        ],
      },
    ],
    feature: { image: 'rubyMaxi', title: 'The Maxi Edit', to: '/shop/maxi-dresses' },
  },
  {
    label: 'Clothing',
    to: '/shop/clothing',
    groups: [
      {
        title: 'Clothing',
        links: [
          { label: 'All Clothing', to: '/shop/clothing' },
          { label: 'Tops', to: '/shop/tops' },
          { label: 'Bottoms', to: '/shop/bottoms' },
          { label: 'Sets & Jumpsuits', to: '/shop/sets' },
          { label: 'Coats, Blazers & Abayas', to: '/shop/outerwear' },
        ],
      },
    ],
    feature: { image: 'creamBlazer', title: 'Tailoring from Italy', to: '/country/IT', focusY: 0.3 },
  },
  {
    label: 'Shoes',
    to: '/shop/shoes',
    groups: [
      {
        title: 'Shoes',
        links: [
          { label: 'All Shoes', to: '/shop/shoes' },
          { label: 'Heels', to: '/shop/heels' },
          { label: 'Sneakers', to: '/shop/sneakers' },
        ],
      },
    ],
    feature: { image: 'floralHeels', title: 'Statement Heels', to: '/shop/heels' },
  },
  {
    label: 'Bags',
    to: '/shop/bags',
    groups: [
      {
        title: 'Bags',
        links: [
          { label: 'All Bags', to: '/shop/bags' },
          { label: 'Totes', to: '/shop/totes' },
          { label: 'Crossbody', to: '/shop/crossbody-bags' },
        ],
      },
    ],
    feature: { image: 'wovenTote', title: 'Leather from Izmir', to: '/shop/bags' },
  },
  {
    label: 'Accessories',
    to: '/shop/accessories',
    groups: [
      {
        title: 'Accessories',
        links: [
          { label: 'All Accessories', to: '/shop/accessories' },
          { label: 'Jewellery', to: '/shop/jewellery' },
          { label: 'Scarves', to: '/shop/scarves' },
          { label: 'Hijabs', to: '/shop/hijabs' },
        ],
      },
    ],
    feature: { image: 'sapphireEarrings', title: 'Jewellery Edit', to: '/shop/jewellery' },
  },
]
