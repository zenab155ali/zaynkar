import type { Store } from '@/types'

/** Fictional stores/brands — every seller on ZAYNKAR is an independent shop. */
export const STORES: Store[] = [
  { id: 'nisan', name: 'Nisan Atelier', country: 'TR', city: 'Istanbul', rating: 4.8, since: 2016, about: 'Fluid, feminine day-to-evening pieces cut in small Istanbul runs.' },
  { id: 'sura', name: 'Sura Istanbul', country: 'TR', city: 'Istanbul', rating: 4.7, since: 2014, about: 'Statement dressing and jumpsuits with a tailored Bosphorus edge.' },
  { id: 'lale', name: 'Maison Lale', country: 'TR', city: 'Izmir', rating: 4.7, since: 2018, about: 'Romantic prints, broderie and occasion wear from the Aegean coast.' },
  { id: 'bosphora', name: 'Bosphora', country: 'TR', city: 'Istanbul', rating: 4.6, since: 2019, about: 'Modern everyday wardrobe staples — relaxed trousers, shirts, denim.' },
  { id: 'anadolu', name: 'Anadolu Loom', country: 'TR', city: 'Bursa', rating: 4.8, since: 2012, about: 'Natural fibres and silk scarves woven in Bursa workshops.' },
  { id: 'zeyn', name: 'Zeyn Modest', country: 'TR', city: 'Istanbul', rating: 4.9, since: 2015, about: 'Contemporary modest fashion: maxi dresses, long skirts and hijabs.' },
  { id: 'ege', name: 'Ege Leather Co.', country: 'TR', city: 'Izmir', rating: 4.7, since: 2011, about: 'Full-grain leather bags and shoes made in the Aegean region.' },
  { id: 'iznik', name: 'Iznik Jewels', country: 'TR', city: 'Istanbul', rating: 4.6, since: 2017, about: 'Handfinished jewellery inspired by Ottoman tilework.' },
  { id: 'serena', name: 'Via Serena', country: 'IT', city: 'Milan', rating: 4.8, since: 2009, about: 'Milanese wardrobe essentials in wool, suede and fine knits.' },
  { id: 'marello', name: 'Studio Marello', country: 'IT', city: 'Florence', rating: 4.9, since: 2005, about: 'Tailoring and evening pieces finished by hand in Florence.' },
  { id: 'haneul', name: 'Haneul Seoul', country: 'KR', city: 'Seoul', rating: 4.7, since: 2019, about: 'Youthful co-ords and soft, sculpted blouses from Seoul.' },
  { id: 'mira', name: 'Mira Studio', country: 'KR', city: 'Seoul', rating: 4.6, since: 2020, about: 'Clean-lined denim, sneakers and mini bags.' },
  { id: 'noor', name: 'Noor Dubai', country: 'AE', city: 'Dubai', rating: 4.9, since: 2013, about: 'Modern abayas and modest evening wear from Dubai.' },
  { id: 'sahara', name: 'Sahara Atelier', country: 'AE', city: 'Abu Dhabi', rating: 4.8, since: 2016, about: 'Embellished abayas and luxurious hijabs, hand-finished.' },
]

export const getStore = (id: string): Store | undefined => STORES.find((s) => s.id === id)
