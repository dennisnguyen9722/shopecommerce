/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'

type WishlistItem = {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images?: Array<{ url: string } | string>
  discountPercent?: number | null
  isNew?: boolean
  isHot?: boolean
}

type WishlistContextType = {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  // Load từ localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem('wishlist')
    if (saved) {
      try {
        setWishlist(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load wishlist:', error)
      }
    }
  }, [])

  // Save vào localStorage khi wishlist thay đổi
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      // Kiểm tra đã tồn tại chưa
      if (prev.some((i) => i._id === item._id)) {
        return prev
      }
      return [...prev, item]
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item._id !== id))
  }

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item._id === id)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
