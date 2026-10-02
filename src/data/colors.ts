/** Colour name → swatch hex. Product data only stores names, so the palette lives in one place. */
export const COLOR_HEX: Record<string, string> = {
  Black: '#1b1917',
  White: '#ffffff',
  Ivory: '#f6f1e7',
  Cream: '#efe6d3',
  Beige: '#d8c7ad',
  Sand: '#cdb99a',
  Camel: '#b98a55',
  Cognac: '#9a5b2e',
  Brown: '#5d4332',
  Grey: '#9a9a98',
  Stone: '#b8b1a6',
  Navy: '#1f2a44',
  Blue: '#5f86b7',
  Teal: '#1f6f78',
  Sage: '#9aa88a',
  Olive: '#6b6e3a',
  Green: '#2f5d43',
  Yellow: '#e3b73a',
  Gold: '#c9a24a',
  Silver: '#c4c6c9',
  Orange: '#d9772b',
  Terracotta: '#b5583a',
  Red: '#b3262c',
  Burgundy: '#6d1f2e',
  Rose: '#c98d96',
  Blush: '#e9c6c0',
  Pink: '#e79bb0',
  Plum: '#5d2a4e',
}

export const colorHex = (name: string): string => COLOR_HEX[name] ?? '#cccccc'

/** Light swatches need a visible border. */
export const isLightColor = (name: string): boolean =>
  ['White', 'Ivory', 'Cream', 'Beige', 'Blush', 'Silver'].includes(name)
