/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type CartItem = {
  _id: string
  name: string
  slug: string
  price: number
  quantity: number
  image?: string
}

type CartContextType = {
  cart: CartItem[]
  cartCount: number
  totalPrice: number
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  increase: (id: string) => void
  decrease: (id: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  // Save cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Add product
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((p) => p._id === item._id)
      if (exists) {
        return prev.map((p) =>
          p._id === item._id
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        )
      }
      return [...prev, item]
    })
  }

  // Remove one item
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p._id !== id))
  }

  // Clear full cart
  const clearCart = () => setCart([])

  // Increase quantity
  const increase = (id: string) => {
    setCart((prev) =>
      prev.map((p) => (p._id === id ? { ...p, quantity: p.quantity + 1 } : p))
    )
  }

  // Decrease quantity (min = 1)
  const decrease = (id: string) => {
    setCart((prev) =>
      prev.map((p) =>
        p._id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    )
  }

  // Count items
  const cartCount = cart.reduce((t, i) => t + i.quantity, 0)

  // Total price
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
        increase,
        decrease
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
