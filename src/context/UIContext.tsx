import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface UIContextValue {
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  imageSearchOpen: boolean
  setImageSearchOpen: (open: boolean) => void
  /** "Complete My Look" modal. `lookProductId` optionally pre-selects the anchor piece. */
  lookOpen: boolean
  lookProductId?: string
  openLook: (productId?: string) => void
  closeLook: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

/** Global overlay state (search, mobile menu, image search, Complete My Look). */
export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [imageSearchOpen, setImageSearchOpen] = useState(false)
  const [look, setLook] = useState<{ open: boolean; productId?: string }>({ open: false })

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const openLook = useCallback((productId?: string) => setLook({ open: true, productId }), [])
  const closeLook = useCallback(() => setLook((prev) => ({ ...prev, open: false })), [])

  const value = useMemo(
    () => ({
      searchOpen,
      openSearch,
      closeSearch,
      menuOpen,
      setMenuOpen,
      imageSearchOpen,
      setImageSearchOpen,
      lookOpen: look.open,
      lookProductId: look.productId,
      openLook,
      closeLook,
    }),
    [searchOpen, openSearch, closeSearch, menuOpen, imageSearchOpen, look, openLook, closeLook],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
