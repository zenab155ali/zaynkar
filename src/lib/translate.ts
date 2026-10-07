/**
 * Best-effort automatic Arabic -> Hebrew translation for catalog text (product names,
 * descriptions, color names). Uses a free, keyless public translation API — good enough
 * as an automatic starting draft, not guaranteed perfectly accurate. The admin can always
 * overwrite a Hebrew field by hand later; this never blocks or fails a product save.
 */
export async function translateToHebrew(text: string): Promise<string | null> {
  const trimmed = text.trim()
  if (!trimmed) return null
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=ar|he`)
    if (!res.ok) return null
    const data = (await res.json()) as { responseData?: { translatedText?: string } }
    const translated = data?.responseData?.translatedText
    return typeof translated === 'string' && translated.trim() ? translated.trim() : null
  } catch {
    return null
  }
}
