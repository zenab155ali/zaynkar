import type { Country, CountryCode } from '@/types'

export const COUNTRIES: Record<CountryCode, Country> = {
  TR: {
    code: 'TR',
    name: 'Turkey',
    demonym: 'Turkish',
    headline: 'Discover Turkish Fashion',
    blurb: 'Istanbul ateliers, Aegean leather and Anatolian textiles — our largest selection.',
    image: 'edOfficeSpring',
    imageFocusY: 0.3,
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    demonym: 'Italian',
    headline: 'Italian Style',
    blurb: 'Tailoring, suede and quiet luxury from Milan and Florence.',
    image: 'creamBlazer',
    imageFocusY: 0.3,
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    demonym: 'Korean',
    headline: 'K-Fashion',
    blurb: 'Playful proportions and clean, youthful silhouettes from Seoul.',
    image: 'puffBlouse',
    imageFocusY: 0.35,
  },
  AE: {
    code: 'AE',
    name: 'UAE',
    demonym: 'Emirati',
    headline: 'Modern Modest Fashion',
    blurb: 'Contemporary abayas and refined modest wear from Dubai and Abu Dhabi.',
    image: 'abayaOpen',
    imageFocusY: 0.35,
  },
}

export const COUNTRY_LIST: Country[] = [COUNTRIES.TR, COUNTRIES.IT, COUNTRIES.KR, COUNTRIES.AE]

export const isCountryCode = (value: string): value is CountryCode => value in COUNTRIES
